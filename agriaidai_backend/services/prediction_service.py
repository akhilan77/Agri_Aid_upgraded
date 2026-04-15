"""
Prediction Service - handles disease prediction using the trained TF/Keras model.
Loads plant_disease_model.h5 and class_labels.npy from the models folder at startup.
"""
import io
import logging
import asyncio
from pathlib import Path
from functools import lru_cache
from typing import List, Tuple

import numpy as np
from PIL import Image

try:
    import tensorflow as tf
    from tensorflow.keras.models import load_model
    from tensorflow.keras.applications.mobilenet_v2 import preprocess_input
    TF_AVAILABLE = True
except ImportError:
    TF_AVAILABLE = False

try:
    from ..interfaces.base_predictor import BasePredictor
    from ..models.prediction_models import PredictionResponse
except ImportError:
    from interfaces.base_predictor import BasePredictor
    from models.prediction_models import PredictionResponse

logger = logging.getLogger(__name__)

# ── Paths ──────────────────────────────────────────────────────────────────────
_MODELS_DIR = Path(__file__).resolve().parent.parent / "models"
_MODEL_PATH  = _MODELS_DIR / "plant_disease_model.h5"
_LABELS_PATH = _MODELS_DIR / "class_labels.npy"

IMG_SIZE = (224, 224)


# ── Label helpers ──────────────────────────────────────────────────────────────

def _parse_label(label: str) -> Tuple[str, str]:
    """
    Convert a PlantVillage class label such as 'Tomato___Early_blight'
    into ('Tomato', 'Early Blight').  'Healthy' variants become ('Crop', 'Healthy').
    """
    parts = label.split("___", 1)
    crop = parts[0].replace("_", " ").strip()
    disease = parts[1].replace("_", " ").strip() if len(parts) > 1 else "Healthy"
    # Title-case both
    return crop.title(), disease.title()


# Static agronomy lookup: disease keyword → (symptoms, treatments, preventive tips)
# Used to enrich the model output with actionable advice.
_DISEASE_INFO: dict = {
    "early blight": (
        ["Target spots with concentric rings", "Yellowing lower leaves", "Dark border around lesions"],
        ["Apply Mancozeb or chlorothalonil fungicide", "Remove and destroy infected leaves", "Rotate crops annually"],
        ["Use drip irrigation to keep foliage dry", "Space plants for good airflow", "Choose resistant varieties"],
    ),
    "late blight": (
        ["Water-soaked dark lesions on leaves", "White fuzzy mold on leaf underside", "Rapid plant collapse in wet weather"],
        ["Copper-based or systemic fungicides", "Remove and bag infected plant material", "Improve field drainage"],
        ["Avoid overhead irrigation", "Plant certified disease-free seed/transplants", "Monitor forecasts for blight risk"],
    ),
    "leaf spot": (
        ["Small brown or black circular spots", "Yellowing halo around spots", "Premature leaf drop"],
        ["Spray copper oxychloride or mancozeb", "Prune heavily infected branches", "Apply neem-oil solution"],
        ["Sanitize pruning tools between plants", "Avoid wetting foliage when watering", "Maintain proper plant spacing"],
    ),
    "leaf blight": (
        ["Large irregular tan-to-brown lesions", "Lesions with yellow margins", "Rapid dieback in humid conditions"],
        ["Foliar fungicide application", "Remove blighted tissue promptly", "Improve canopy ventilation"],
        ["Avoid excessive nitrogen fertilization", "Plant in well-drained soil", "Use disease-resistant cultivars"],
    ),
    "rust": (
        ["Orange or rust-colored pustules on leaves", "Yellowing surrounding pustules", "Premature defoliation"],
        ["Systemic triazole fungicide", "Remove and destroy infected debris", "Apply foliar sulfur spray"],
        ["Plant rust-resistant varieties", "Crop rotation with non-host crops", "Avoid saturated soil conditions"],
    ),
    "scab": (
        ["Olive-green to black scabby lesions on fruit/leaves", "Corky or cracked tissue", "Deformed fruit"],
        ["Protective fungicide before bud break", "Prune infected branches", "Apply lime-sulfur spray"],
        ["Plant scab-resistant cultivars", "Ensure good air circulation", "Remove fallen leaves and fruit"],
    ),
    "powdery mildew": (
        ["White powdery coating on leaf surfaces", "Distorted new growth", "Premature leaf senescence"],
        ["Potassium bicarbonate or sulfur-based fungicide", "Neem oil foliar spray", "Remove heavily infected shoots"],
        ["Avoid high-nitrogen fertilization", "Plant in full sun with airflow", "Water at base, not overhead"],
    ),
    "downy mildew": (
        ["Yellow angular lesions on upper leaf", "Grey-purple spore mass on underside", "Wilting in moist mornings"],
        ["Copper fungicide or metalaxyl spray", "Apply preventive fungicide before infection", "Destroy infected plant waste"],
        ["Improve drainage and spacing", "Avoid evening irrigation", "Use resistant varieties"],
    ),
    "bacterial spot": (
        ["Small water-soaked lesions turning brown", "Raised scabby lesions on fruit", "Leaf yellowing and drop"],
        ["Copper bactericide spray", "Remove infected plant parts", "Avoid overhead irrigation"],
        ["Use disease-free seed/transplants", "Rotate with non-solanaceous crops", "Minimise leaf wetness"],
    ),
    "mosaic virus": (
        ["Mosaic pattern of light and dark green on leaves", "Leaf distortion and curling", "Stunted growth"],
        ["No effective cure — remove infected plants", "Control aphid vectors with insecticide", "Apply reflective mulches to deter aphids"],
        ["Plant virus-resistant varieties", "Control weed hosts nearby", "Disinfect tools between plants"],
    ),
    "smut": (
        ["Black powdery galls on ears or tassels", "Swollen deformed kernels", "White immature galls"],
        ["Remove and destroy galls before they burst", "Apply fungicide at planting", "Avoid mechanical injury to plants"],
        ["Plant smut-resistant hybrids", "Rotate with non-corn crops", "Manage soil fertility to reduce stress"],
    ),
    "blast": (
        ["Diamond-shaped grey lesions with brown borders", "White to grey lesion centers", "Neck rot causing head blasting"],
        ["Systemic tricyclazole or isoprothiolane fungicide", "Drain field temporarily and re-flood", "Apply fungicide at booting stage"],
        ["Use blast-resistant varieties", "Avoid excessive nitrogen at panicle initiation", "Maintain optimal planting density"],
    ),
    "healthy": (
        ["No disease symptoms detected"],
        ["Continue your current crop management practices", "Maintain regular field scouting"],
        ["Ensure balanced fertilization", "Practice crop rotation", "Monitor for early pest or disease signs"],
    ),
}


def _get_disease_info(disease_lower: str) -> Tuple[List[str], List[str], List[str]]:
    """Return (symptoms, treatments, tips) for the closest disease keyword match."""
    for key, info in _DISEASE_INFO.items():
        if key in disease_lower:
            return info
    # Generic fallback
    return (
        ["Visual symptoms observed — see specialist for confirmation"],
        ["Consult an agronomist for a targeted treatment plan", "Isolate affected plants"],
        ["Practice crop rotation", "Maintain field sanitation", "Use certified planting material"],
    )


# ── Model loader (singleton via module-level cache) ───────────────────────────

@lru_cache(maxsize=1)
def _load_artifacts():
    """Load model and class labels once and cache them."""
    if not TF_AVAILABLE:
        raise RuntimeError("TensorFlow is not installed. Please run: pip install tensorflow")

    if not _MODEL_PATH.exists():
        raise FileNotFoundError(f"Model file not found: {_MODEL_PATH}")
    if not _LABELS_PATH.exists():
        raise FileNotFoundError(f"Class labels not found: {_LABELS_PATH}")

    logger.info(f"Loading model from {_MODEL_PATH}")
    model = load_model(str(_MODEL_PATH), compile=False)

    logger.info(f"Loading class labels from {_LABELS_PATH}")
    class_labels: np.ndarray = np.load(str(_LABELS_PATH), allow_pickle=True)

    logger.info(f"Model ready \u2014 {len(class_labels)} classes")
    return model, class_labels


# Map user-supplied crop name → PlantVillage label prefix (case-insensitive key)
_CROP_PREFIX_MAP: dict = {
    "tomato":      "Tomato",
    "corn":        "Corn",
    "maize":       "Corn",
    "wheat":       "Wheat",
    "rice":        "Rice",
    "potato":      "Potato",
    "apple":       "Apple",
    "grape":       "Grape",
    "peach":       "Peach",
    "cherry":      "Cherry",
    "strawberry":  "Strawberry",
    "soybean":     "Soybean",
    "squash":      "Squash",
    "pepper":      "Pepper",
    "orange":      "Orange",
    "blueberry":   "Blueberry",
    "raspberry":   "Raspberry",
}


def _crop_indices(crop: str, class_labels: np.ndarray) -> List[int]:
    """
    Return the indices in class_labels whose label starts with the
    PlantVillage prefix for the given crop name.
    Falls back to all indices if the crop is not recognised.
    """
    prefix = _CROP_PREFIX_MAP.get(crop.lower().strip())
    if not prefix:
        logger.warning(f"Unknown crop '{crop}' — using all classes")
        return list(range(len(class_labels)))

    indices = [i for i, lbl in enumerate(class_labels) if lbl.startswith(prefix)]
    if not indices:
        logger.warning(f"No class labels found for prefix '{prefix}' — using all classes")
        return list(range(len(class_labels)))

    logger.info(f"Crop '{crop}' matched prefix '{prefix}' \u2192 {len(indices)} candidate classes")
    return indices


# ── Real predictor ────────────────────────────────────────────────────────────

class PlantDiseasePredictor(BasePredictor):
    """
    Real predictor that runs inference against the trained MobileNetV2 model.
    The selected crop constrains which classes are considered, so a
    'Tomato' selection will never return a Maize or Strawberry result.
    """

    async def predict(self, crop: str, image_bytes: bytes) -> PredictionResponse:
        """Run model inference constrained to the selected crop's label set."""
        logger.info(f"predict() called \u2014 crop: {crop}, image: {len(image_bytes)} bytes")
        loop = asyncio.get_event_loop()
        result = await loop.run_in_executor(None, self._run_inference, crop, image_bytes)
        return result

    def _run_inference(self, crop: str, image_bytes: bytes) -> PredictionResponse:
        model, class_labels = _load_artifacts()

        # Pre-process image
        img = Image.open(io.BytesIO(image_bytes)).convert("RGB").resize(IMG_SIZE)
        arr = np.expand_dims(np.array(img, dtype=np.float32), axis=0)
        arr = preprocess_input(arr)

        # Full inference over all 38 classes
        preds = model.predict(arr, verbose=0)   # shape: (1, num_classes)
        scores = preds[0]                        # 1-D array

        # Filter to classes that match the selected crop
        candidate_indices = _crop_indices(crop, class_labels)

        # Pick the highest-scoring class among candidates
        best_idx = max(candidate_indices, key=lambda i: scores[i])
        confidence = float(scores[best_idx])
        raw_label: str = class_labels[best_idx]

        logger.info(f"Selected class: {raw_label} ({confidence:.3f}) "
                    f"from {len(candidate_indices)} candidates for crop='{crop}'")

        # Parse label → human-readable crop & disease
        pred_crop, disease = _parse_label(raw_label)

        symptoms, treatments, tips = _get_disease_info(disease.lower())

        return PredictionResponse(
            crop=pred_crop,
            disease=disease,
            confidence=round(confidence, 4),
            symptoms=symptoms,
            treatments=treatments,
            preventiveTips=tips,
        )

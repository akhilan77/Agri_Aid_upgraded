"""
Train plant disease classifier using MobileNetV2 transfer learning.

Usage:
    python -m agriaidai_backend.models.train_plant_disease <data_dir> [--output_dir .]

data_dir must be a PlantVillage-style directory:
    data_dir/
        Tomato___Early_blight/   (image files)
        Tomato___Late_blight/
        ...  (38 classes total)

Improvements over v1:
- Phase 1: 20 epochs (was 5) — head training with frozen base
- Phase 2: 20 epochs (was 5) — fine-tune last 50 base layers (was 30)
- ReduceLROnPlateau + EarlyStopping callbacks
- Richer data augmentation (brightness, contrast, more rotation)
- Lower dropout (0.3) to reduce underfitting
- Label smoothing (0.1) for better-calibrated confidence scores
- Saves best checkpoint, not just last epoch
"""
import argparse
import os
import numpy as np
import tensorflow as tf
from tensorflow.keras import layers, models, optimizers, callbacks
from tensorflow.keras.applications import MobileNetV2
from tensorflow.keras.applications.mobilenet_v2 import preprocess_input
from tensorflow.keras.preprocessing import image_dataset_from_directory

# ── Hyperparameters ────────────────────────────────────────────────────────────
IMG_SIZE       = (224, 224)
BATCH_SIZE     = 32
PHASE1_EPOCHS  = 20          # head-only training
PHASE2_EPOCHS  = 20          # fine-tuning
FINE_TUNE_FROM = -50         # unfreeze last 50 base layers (was -30)
NUM_CLASSES    = 38
MODEL_FILENAME = "plant_disease_model.h5"
LABELS_FILENAME = "class_labels.npy"


# ── Dataset ───────────────────────────────────────────────────────────────────

def build_datasets(data_dir):
    common = dict(
        labels="inferred",
        label_mode="categorical",
        validation_split=0.2,
        seed=123,
        image_size=IMG_SIZE,
        batch_size=BATCH_SIZE,
    )
    train_ds = image_dataset_from_directory(data_dir, subset="training",   **common)
    val_ds   = image_dataset_from_directory(data_dir, subset="validation", **common)

    class_names = train_ds.class_names
    if len(class_names) != NUM_CLASSES:
        raise ValueError(f"Expected {NUM_CLASSES} classes, found {len(class_names)} in {data_dir}.")

    autotune = tf.data.AUTOTUNE
    train_ds = (
        train_ds
        .map(lambda x, y: (preprocess_input(x), y), num_parallel_calls=autotune)
        .cache()
        .shuffle(1000)
        .prefetch(autotune)
    )
    val_ds = (
        val_ds
        .map(lambda x, y: (preprocess_input(x), y), num_parallel_calls=autotune)
        .cache()
        .prefetch(autotune)
    )
    return train_ds, val_ds, class_names


# ── Model ─────────────────────────────────────────────────────────────────────

def build_model():
    inputs = layers.Input(shape=(*IMG_SIZE, 3))

    # Richer augmentation helps generalise to real-world images
    augmentation = models.Sequential([
        layers.RandomFlip("horizontal"),
        layers.RandomRotation(0.2),           # ±20° (was 0.1)
        layers.RandomZoom(0.15),
        layers.RandomBrightness(0.2),
        layers.RandomContrast(0.2),
    ], name="augmentation")

    base_model = MobileNetV2(
        input_shape=(*IMG_SIZE, 3),
        include_top=False,
        weights="imagenet",
    )
    base_model.trainable = False  # frozen during phase 1

    x = augmentation(inputs)
    x = base_model(x, training=False)
    x = layers.GlobalAveragePooling2D()(x)
    x = layers.BatchNormalization()(x)          # stabilises activations
    x = layers.Dense(256, activation="relu")(x)
    x = layers.Dropout(0.3)(x)                  # 0.3 (was 0.5) — less underfitting
    x = layers.Dense(128, activation="relu")(x)
    x = layers.Dropout(0.3)(x)
    outputs = layers.Dense(NUM_CLASSES, activation="softmax")(x)

    return models.Model(inputs, outputs), base_model


def _callbacks(checkpoint_path: str, monitor: str = "val_accuracy") -> list:
    """Standard callbacks used in both phases."""
    return [
        callbacks.ModelCheckpoint(
            filepath=checkpoint_path,
            monitor=monitor,
            save_best_only=True,
            verbose=1,
        ),
        callbacks.ReduceLROnPlateau(
            monitor=monitor,
            factor=0.5,
            patience=3,
            min_lr=1e-7,
            verbose=1,
        ),
        callbacks.EarlyStopping(
            monitor=monitor,
            patience=6,
            restore_best_weights=True,
            verbose=1,
        ),
    ]


# ── Training phases ────────────────────────────────────────────────────────────

def phase1_train(model, train_ds, val_ds, checkpoint_path: str):
    """Train classifier head only (base frozen)."""
    model.compile(
        optimizer=optimizers.Adam(learning_rate=1e-3),
        # Label smoothing → better-calibrated softmax confidence
        loss=tf.keras.losses.CategoricalCrossentropy(label_smoothing=0.1),
        metrics=["accuracy"],
    )
    print("\n=== Phase 1: Training head (base frozen) ===")
    model.fit(
        train_ds,
        validation_data=val_ds,
        epochs=PHASE1_EPOCHS,
        callbacks=_callbacks(checkpoint_path),
        verbose=1,
    )


def phase2_finetune(model, base_model, train_ds, val_ds, checkpoint_path: str):
    """Unfreeze last N base layers and fine-tune at low LR."""
    for layer in base_model.layers[:FINE_TUNE_FROM]:
        layer.trainable = False
    for layer in base_model.layers[FINE_TUNE_FROM:]:
        layer.trainable = True

    model.compile(
        optimizer=optimizers.Adam(learning_rate=1e-5),
        loss=tf.keras.losses.CategoricalCrossentropy(label_smoothing=0.1),
        metrics=["accuracy"],
    )
    print(f"\n=== Phase 2: Fine-tuning last {abs(FINE_TUNE_FROM)} base layers ===")
    model.fit(
        train_ds,
        validation_data=val_ds,
        epochs=PHASE2_EPOCHS,
        callbacks=_callbacks(checkpoint_path),
        verbose=1,
    )


# ── Save ──────────────────────────────────────────────────────────────────────

def save_artifacts(model, class_names, output_dir: str):
    os.makedirs(output_dir, exist_ok=True)
    model_path  = os.path.join(output_dir, MODEL_FILENAME)
    labels_path = os.path.join(output_dir, LABELS_FILENAME)
    model.save(model_path)
    np.save(labels_path, np.array(class_names))
    print(f"\n✅ Model saved  → {model_path}")
    print(f"✅ Labels saved → {labels_path}")


# ── Entry point ───────────────────────────────────────────────────────────────

def parse_args():
    parser = argparse.ArgumentParser(description="Train plant disease classifier (MobileNetV2).")
    parser.add_argument("data_dir", help="PlantVillage-style dataset directory (38 class folders).")
    parser.add_argument("--output_dir", default=".", help="Where to save model + labels (default: current dir).")
    return parser.parse_args()


def main():
    args = parse_args()
    train_ds, val_ds, class_names = build_datasets(args.data_dir)

    model, base_model = build_model()

    checkpoint_path = os.path.join(args.output_dir, "best_checkpoint.h5")

    phase1_train(model, train_ds, val_ds, checkpoint_path)
    phase2_finetune(model, base_model, train_ds, val_ds, checkpoint_path)

    # Save the final best weights
    save_artifacts(model, class_names, args.output_dir)


if __name__ == "__main__":
    main()

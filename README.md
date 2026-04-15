# 🌱 AgriAidAI

> **AI-powered crop disease detection and agricultural intelligence platform for modern farmers.**

AgriAidAI combines a fine-tuned MobileNetV2 computer vision model with a FastAPI backend and a React frontend to deliver instant crop disease diagnosis, expert treatment recommendations, live weather intelligence, and a persistent scan history — all in one platform.

---

## ✨ Features

| Feature                     | Description                                                                                                  |
| --------------------------- | ------------------------------------------------------------------------------------------------------------ |
| 🔬 **AI Disease Detection** | MobileNetV2 model trained on the PlantVillage dataset — 38 disease classes across 16 crops                   |
| 📋 **Structured Results**   | Per-scan: disease name, confidence score, symptoms, treatment plan, preventive tips                          |
| 🌤️ **Live Weather**         | Real-time weather via [Open-Meteo](https://open-meteo.com) using GPS or IP geolocation — no API key required |
| 📈 **Prediction History**   | All scans persisted in-memory; auto-refreshes on the dashboard                                               |
| 📊 **Admin Statistics**     | Real prediction counts, average confidence, 7-day activity chart                                             |
| 📄 **Export to PDF**        | Print any scan result as a PDF directly from the browser                                                     |
| 🔐 **Auth (lightweight)**   | Email + fixed password login; username derived from email; localStorage session                              |
| 🌍 **Multilingual**         | English + Hindi support via `LanguageContext`                                                                |
| 📱 **Responsive**           | Works across desktop, tablet, and mobile                                                                     |

---

## 🖥️ Tech Stack

### Backend

| Layer       | Technology                                                                                      |
| ----------- | ----------------------------------------------------------------------------------------------- |
| Framework   | [FastAPI](https://fastapi.tiangolo.com/)                                                        |
| ML Runtime  | TensorFlow / Keras                                                                              |
| Model       | MobileNetV2 (fine-tuned, PlantVillage dataset)                                                  |
| Weather     | [Open-Meteo API](https://open-meteo.com) + [Nominatim](https://nominatim.org) reverse geocoding |
| HTTP client | [httpx](https://www.python-httpx.org/)                                                          |
| Server      | Uvicorn with ASGI lifespan                                                                      |

### Frontend

| Layer         | Technology                           |
| ------------- | ------------------------------------ |
| Framework     | React 18 + TypeScript                |
| Styling       | Tailwind CSS (minimal design system) |
| UI Components | shadcn/ui                            |
| Charts        | Recharts                             |
| Routing       | React Router v6                      |
| Data Fetching | Native `fetch` + `useCallback` hooks |

---

## 🗂️ Project Structure

```
agri-aid-master/
├── agriaidai_backend/          # FastAPI backend
│   ├── main.py                 # App entry point, routes, lifespan
│   ├── models/
│   │   ├── prediction_models.py    # Pydantic schemas
│   │   └── train_plant_disease.py  # Model training script
│   └── services/
│       ├── prediction_service.py   # MobileNetV2 inference engine
│       ├── history_service.py      # In-memory prediction history
│       ├── weather_service.py      # Open-Meteo live weather
│       └── admin_service.py        # Real admin stats from history
│
├── agri-aid-bright/            # React frontend
│   └── src/
│       ├── pages/
│       │   ├── Index.tsx       # Home + login (merged)
│       │   ├── Dashboard.tsx   # Live dashboard with stats & charts
│       │   ├── Predict.tsx     # Split-screen: upload + results
│       │   ├── Admin.tsx       # Admin stats dashboard
│       │   └── About.tsx       # Platform info & tech details
│       ├── components/
│       │   └── Navigation.tsx  # Sticky nav with auth + logout
│       └── contexts/
│           └── LanguageContext.tsx
│
└── models/                     # Trained model artifacts
    ├── plant_disease_model.h5
    └── class_labels.npy
```

---

## 🚀 Getting Started

### Prerequisites

- Python 3.10+
- Node.js 18+
- A trained model file at `models/plant_disease_model.h5` (see [Training](#-model-training))

### 1. Backend Setup

```bash
cd agri-aid-master

# Create and activate a virtual environment
python -m venv .venv
.venv\Scripts\activate          # Windows
# source .venv/bin/activate     # macOS/Linux

# Install dependencies
pip install fastapi uvicorn tensorflow httpx numpy pillow python-multipart

# Start the backend
python -m agriaidai_backend.main
```

Backend runs at: **http://localhost:8000**
Interactive API docs: **http://localhost:8000/docs**

> **Environment variables** (optional — set to suppress TF noise):
>
> ```
> TF_ENABLE_ONEDNN_OPTS=0
> TF_CPP_MIN_LOG_LEVEL=2
> ```

### 2. Frontend Setup

```bash
cd agri-aid-bright

npm install
npm run dev
```

Frontend runs at: **http://localhost:8081**

---

## 🔑 Login

The app uses a lightweight auth system with localStorage.

| Field    | Value                                    |
| -------- | ---------------------------------------- |
| Email    | Any valid email (`yourname@example.com`) |
| Password | `password123#`                           |

Your username in the navigation is automatically derived from the email prefix (e.g. `akhilanworks@gmail.com` → displays as `akhilanworks`).

---

## 🌿 Supported Crops & Diseases

The model classifies **38 disease classes** across **16 crops**:

| Crop                                                         | Example Diseases                                   |
| ------------------------------------------------------------ | -------------------------------------------------- |
| Tomato                                                       | Early Blight, Late Blight, Leaf Mold, Mosaic Virus |
| Corn                                                         | Common Rust, Northern Leaf Blight, Gray Leaf Spot  |
| Potato                                                       | Early Blight, Late Blight                          |
| Apple                                                        | Apple Scab, Black Rot, Cedar Apple Rust            |
| Grape                                                        | Black Rot, Esca, Leaf Blight                       |
| Pepper                                                       | Bacterial Spot                                     |
| Strawberry                                                   | Leaf Scorch                                        |
| Peach, Cherry, Squash, Soybean, Orange, Blueberry, Raspberry | Various                                            |

All crops also include a **Healthy** class.

---

## 🧠 Model Training

To retrain or improve the model:

```bash
# Place PlantVillage dataset inside:
# agriaidai_backend/models/dataset/PlantVillage/

python agriaidai_backend/models/train_plant_disease.py
```

Training configuration (in `train_plant_disease.py`):

- **Architecture**: MobileNetV2 (ImageNet pre-trained)
- **Input size**: 224 × 224 RGB
- **Phase 1**: 20 epochs — top classifier only
- **Phase 2**: 20 epochs — fine-tune top 30 layers
- **Augmentation**: flip, rotation, zoom, brightness, contrast
- **Callbacks**: EarlyStopping, ReduceLROnPlateau, ModelCheckpoint

Artifacts saved to `models/`:

- `plant_disease_model.h5` — Keras model weights
- `class_labels.npy` — ordered class name array

---

## 🌐 API Reference

| Method | Endpoint       | Description                                                   |
| ------ | -------------- | ------------------------------------------------------------- |
| `POST` | `/predict`     | Multipart: `crop` (str) + `file` (image) → disease prediction |
| `GET`  | `/weather`     | `?city=` or `?lat=&lon=` → live weather object                |
| `GET`  | `/history`     | Returns last N predictions                                    |
| `POST` | `/history`     | Save a prediction entry                                       |
| `GET`  | `/admin/stats` | Returns real prediction counts and 7-day chart data           |

Full schema available at **http://localhost:8000/docs**

---

## 📍 Weather & Location

Weather is fetched automatically using a 3-tier location strategy:

1. **Browser GPS** — asks for location permission; uses real coordinates
2. **IP Geolocation** (`ipapi.co`) — no permission needed; returns city from IP
3. **Fallback** — Coimbatore (default if both above fail)

The backend uses Open-Meteo (free, no API key) and Nominatim for reverse geocoding.

---

## 🗺️ Roadmap

- [ ] Persistent database (SQLite / PostgreSQL) for prediction history
- [ ] Real user authentication with JWT
- [ ] Crop calendar & seasonal advisories
- [ ] Batch image analysis
- [ ] Push notifications for disease alerts
- [ ] Offline PWA support
- [ ] OpenWeatherMap integration for extended forecast

---

## 📄 License

MIT License — open for personal and commercial use. Contributions welcome.

---

## 🙏 Acknowledgements

- [PlantVillage Dataset](https://plantvillage.psu.edu) — disease image training data
- [Open-Meteo](https://open-meteo.com) — free, no-key weather API
- [Nominatim / OpenStreetMap](https://nominatim.org) — reverse geocoding
- [shadcn/ui](https://ui.shadcn.com) — React component system
- [TensorFlow / Keras](https://tensorflow.org) — ML framework

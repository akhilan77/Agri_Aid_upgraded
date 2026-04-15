# AgriAid AI

Agricultural decision support system with AI-powered recommendations for crop management, pest control, and resource optimization. and more.

## 🌟 Overview

AgriAid AI is an intelligent web application designed to help farmers and agriculturists quickly identify plant diseases. By simply capturing or uploading a photo of a plant leaf, the system leverages a deep learning computer vision model to detect the specific disease and provides actionable insights, including symptoms, treatment recommendations, and preventive measures.

## 🏗️ Project Architecture

The project is structured into three main components:

### 1. Frontend (`/frontend`)
A lightweight, fast, and responsive user interface built using vanilla HTML, CSS, and JavaScript.
Features:
- Image upload and preview.
- Communication with the backend API to retrieve AI inference results.
- Display of the detected disease, model confidence, suggested treatments, and ways to prevent future occurrences.

### 2. Backend (`/backend`)
A high-performance REST API built with **FastAPI** (Python).
- Exposes a `/predict` endpoint that receives uploaded leaf images.
- Preprocesses images to the required format (224x224, normalized).
- Interfaces with the ML inference service to perform predictions.
- Enriches the ML prediction with domain knowledge from `disease_info.py`, matching the predicted disease to practical treatments and prevention strategies.

### 3. Machine Learning (`/ml`)
A customized **MobileNetV2** deep learning model created using **TensorFlow/Keras**.
- Designed to classify **38 different plant disease classes**.
- The training pipeline (`train_plant_disease.py`) includes advanced data augmentation (rotations, flips, zooming) to ensure model robustness.
- Uses a two-phase training approach: an initial training of the top layers followed by fine-tuning deeper layers for optimal accuracy.

## 🚀 How to Run

### Backend
1. Ensure Python 3.8+ is installed.
2. Install the necessary dependencies: `pip install fastapi uvicorn pillow numpy "tensorflow>2.0"` (or from your generated `requirements.txt`).
3. Navigate into the `backend` directory.
4. Start the FastAPI development server:
   ```bash
   uvicorn main:app --reload
   ```
5. The API will be available at `http://127.0.0.1:8000`.

### Frontend
1. The frontend is fully static! Simply open `frontend/index.html` in your web browser.
2. It is configured to communicate directly with the local FastAPI server at `http://127.0.0.1:8000`.

## 🧠 Model Training (Optional)
If you wish to retrain the ML model on standard PlantVillage-style datasets:
1. Ensure TensorFlow is installed.
2. Run the training script:
   ```bash
   python ml/training/train_plant_disease.py /path/to/your/dataset --output_dir ./ml/models
   ```

## 🛠️ Tech Stack
- **Frontend**: HTML5, CSS3, JavaScript
- **Backend**: Python, FastAPI, Uvicorn, Pillow
- **AI/ML**: TensorFlow, Keras, MobileNetV2, NumPy

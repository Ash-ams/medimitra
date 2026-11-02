# MediMitra: AI-Powered Multilingual Medical Chatbot & Telehealth Consultation Platform

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![React](https://img.shields.io/badge/Frontend-React_18-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![Node.js](https://img.shields.io/badge/Backend-Node.js_Express-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![Python](https://img.shields.io/badge/ML%2FNLP-Python_3.10-3776AB?logo=python&logoColor=white)](https://python.org/)
[![Random Forest](https://img.shields.io/badge/Accuracy-95.65%25-success)](ml-training/README.md)
[![WebRTC](https://img.shields.io/badge/Streaming-D--ID_WebRTC-FF6B6B)](did-streaming/README.md)

---

## 👥 Project Development Team

*Department of Computer Engineering*  
*School of Technology Management and Engineering (STME)*  
*SVKM's Narsee Monjee Institute of Management Studies (NMIMS), Navi Mumbai, Maharashtra, India*  
*Academic Project Supervisor:* **Dr. Snehal Lohi**

| Author Name | Roll Number | Academic Role & Subsystem Ownership |
|:---|:---:|:---|
| **Sheikh Mohammad Ashraf** | **A266** | Full-Stack System Architecture, Core Integration & DevOps |
| **Samarth Srivastava** | **A255** | Node.js Backend Orchestration & Clinical Decision Support (CDS) Triage |
| **Aadit Doshi** | **A251** | Statistical NLP Preprocessing, ML Ensemble Models & Speech Synthesis |
| **Madhav Soni** | **A265** | React Frontend UI/UX, WebRTC Digital Avatar & Geolocation Services |

---

## 📖 Executive Summary & Clinical Problem Statement

In developing nations like India, the allopathic doctor-to-population ratio severely lags below the World Health Organization (WHO) minimum benchmark of 1:1,000. Compounding this healthcare deficit is widespread linguistic diversity: while modern telehealth interfaces operate almost exclusively in English, fewer than 12% of Indian citizens communicate comfortably in English for medical complaints. 

**MediMitra** (*"Medical Friend"*) is a cyber-physical telehealth and conversational artificial intelligence system engineered to bridge this gap. MediMitra provides high-precision clinical intent triage, real-time consultation in native Indian languages (**English, Hindi, and Marathi**), emergency red-flag screening, interactive digital doctor avatar consultations via WebRTC, and geolocation-based routing to nearby medical dispensaries.

---

## 🏛️ Comprehensive 4-Tier System Architecture

MediMitra is engineered as a strictly decoupled, modular 4-tier architecture designed for low-latency local execution and scalable cloud deployment:

```
                                  +-------------------------------------------------------------+
                                  |                 TIER 1: CLIENT PRESENTATION                 |
                                  |   React 18 SPA | Web Speech API | Dual-Mode Avatar UI       |
                                  +------------------------------+------------------------------+
                                                                 |
                                                  HTTP / REST    |   WebSockets / WebRTC
                                                                 v
                                  +-------------------------------------------------------------+
                                  |             TIER 2: BACKEND ORCHESTRATION GATEWAY           |
                                  |       Node.js / Express (Port 5051) | MongoDB Atlas         |
                                  |    - Deterministic CDS Red-Flag Emergency Triage Engine     |
                                  |    - Google Cloud Neural Wavenet TTS (Hindi/Marathi/Eng)    |
                                  |    - Geolocation Router (Google Places & OpenStreetMap)     |
                                  +--------------+-------------------------------+--------------+
                                                 |                               |
                             IPC Subprocess Spawn|                               | Peer Connection SDP
                                                 v                               v
+------------------------------------------------+-------------+   +--------------------------------------------+
|         TIER 3: STATISTICAL NLP & MACHINE LEARNING           |   |       TIER 4: D-ID WebRTC STREAMING        |
| Python 3.10 | Scikit-Learn | NLTK Lemmatization | TF-IDF     |   | D-ID Streaming Agent | H.264 Video Stream  |
| - Random Forest Classifier (95.65% Benchmark Accuracy)       |   | - Low-latency avatar video rendering       |
| - 6 Medical Intent Categories | Sub-15 ms Local Inference    |   | - Neural lip-sync driven by response text  |
+--------------------------------------------------------------+   +--------------------------------------------+
```

### 1. Tier 1: Client Presentation Layer (`/client`)
- **Technology**: React 18, React Router v7, HTML5, CSS3 Glassmorphism, Web Speech API.
- **Multilingual Consultation**: Real-time language switcher supporting English, Hindi (हिन्दी), and Marathi (मराठी).
- **Dual Avatar Experience**:
  - *Interactive Animated Doctor*: Lightweight, hardware-accelerated animated avatar component with reactive speaking dynamics, transcription history, and clinical suggestions.
  - *D-ID Video Stream Frame*: High-fidelity conversational digital human streaming window embedded via iframe.
- **Geolocation Pharmacy Discovery**: Interactive map and list locating nearby pharmacies with dual-source fallback (Google Places API & OpenStreetMap Overpass API).
- **Appointment Scheduling**: Integrated doctor specialty selector and scheduling system with automated email confirmation.

### 2. Tier 2: Backend Orchestration & API Layer (`/server`)
- **Technology**: Node.js, Express 5, MongoDB / Mongoose, Nodemailer, Axios.
- **Clinical Decision Support (CDS) Triage Tree**: Evaluates patient symptom descriptions against emergency red-flag triggers (e.g., crushing chest pain, radiating left arm numbness, acute thunderclap headache) and immediately triggers ambulance dispatch advisories (108/112).
- **Neural Text-to-Speech (TTS)**: Synthesizes high-fidelity regional audio via Google Cloud Text-to-Speech using WaveNet voices:
  - English: `en-US-Wavenet-A`
  - Hindi: `hi-IN-Wavenet-A`
  - Marathi: `mr-IN-Wavenet-A`
- **Data Persistence**: Stores user sessions, consultation histories, and doctor appointment registries with encrypted credentials.

### 3. Tier 3: Machine Learning & NLP Intelligence Layer (`/ml-training`)
- **Technology**: Python 3.10, Scikit-Learn, Pandas, NumPy, NLTK, WordNet.
- **Text Preprocessing**: Normalizes Devanagari Unicode scripts, strips non-alphabetic noise, applies tokenization, removes stop-words, and extracts lemmatized word stems.
- **TF-IDF Feature Representation**: 5,000 n-gram features representing medical vocabularies across a training corpus of 256,917 real-world medical dialogue records.
- **Supervised Classification**: Evaluates patient complaints into 6 core clinical categories:
  1. *Pain-related* (musculoskeletal, joint, acute abdominal)
  2. *Fever-related* (pyrexia, chills, viral infections)
  3. *Headache-related* (migraine, tension, cranial pressure)
  4. *Stomach-related* (gastrointestinal, nausea, dyspepsia)
  5. *Skin-related* (dermatological lesions, rashes, pruritus)
  6. *General Medical Inquiries*
- **Ultra-Low Latency**: Sub-15 ms local inference allows edge deployment without cloud GPU dependencies.

### 4. Tier 4: Multimodal Digital Human & WebRTC Streaming Layer (`/did-streaming`)
- **Technology**: WebRTC Peer Connection, D-ID Real-Time Streaming API, Express.
- **Signaling & Media Exchange**: Facilitates Session Description Protocol (SDP) offer/answer negotiation and Interactive Connectivity Establishment (ICE) candidate routing.
- **Synchronized Lip-Sync**: Renders H.264 video streams of a digital medical practitioner directly driven by synthesized conversational text.

---

## 📊 Empirical Machine Learning Evaluation

The core intent classification engine was empirically evaluated on an 80/20 train-test split against traditional classifiers:

| Model Architecture | Accuracy | Precision (Weighted) | Recall (Weighted) | F1-Score (Weighted) | Inference Latency |
|:---|:---:|:---:|:---:|:---:|:---:|
| **Random Forest Ensemble (Ours)** | **95.65%** | **0.9400** | **0.9300** | **0.9500** | **< 15 ms** |
| Logistic Regression (L2 Regularized) | 90.25% | 0.8900 | 0.8800 | 0.8800 | < 10 ms |
| Multinomial Naïve Bayes | 81.90% | 0.8000 | 0.7900 | 0.7900 | < 5 ms |

*Detailed confusion matrices, classification reports, and radar charts are preserved in [`docs/figures/`](docs/figures/) and documented in [`docs/medimitra_ieee_report.html`](docs/medimitra_ieee_report.html).*

---

## 📁 Repository Directory Structure

```
medimitra/
├── client/                     # [Tier 1] React 18 Frontend Application
│   ├── public/                 # Static assets, favicon, manifest.json
│   ├── src/
│   │   ├── components/         # Reusable UI components (DidAvatar, ErrorBoundary)
│   │   ├── pages/              # Views (AvatarChat, VoiceChat, TextChat, MedicalShops, AboutUs)
│   │   ├── utils/              # Client-side TTS fallbacks & speech helpers
│   │   ├── App.js              # Application root & router
│   │   └── index.js            # React DOM entry point
│   ├── .env.example            # Client environment template
│   └── package.json            # Client dependencies & scripts
│
├── server/                     # [Tier 2] Node.js Express Orchestration Server
│   ├── config/                 # Service credentials & configurations
│   ├── mongodb-config.js       # MongoDB Atlas connection handler
│   ├── test_google_tts.js      # TTS endpoint test suite
│   ├── index.js                # Core Express API, CDS triage & routing engine
│   ├── .env.example            # Server environment template
│   └── package.json            # Server dependencies & scripts
│
├── ml-training/                # [Tier 3] Python Machine Learning & NLP Subsystem
│   ├── trained_models/         # Serialized models (best_model.pkl, vectorizer.pkl)
│   ├── preprocessed_data/      # Processed matrices & label encodings
│   ├── advanced_nlp.py         # Lemmatization & feature extraction pipeline
│   ├── data_preprocessing.py   # Dataset ingestion & text normalization
│   ├── model_training.py       # Supervised model training & evaluation
│   ├── quick_inference.py      # Sub-15 ms CLI test inference script
│   ├── requirements.txt        # Python dependency manifest
│   └── README.md               # ML-specific documentation & benchmarks
│
├── did-streaming/              # [Tier 4] D-ID WebRTC Avatar Streaming Integration
│   ├── streaming-client-api.js # WebRTC SDP & ICE candidate exchange logic
│   ├── index.html              # Standalone avatar streaming viewport
│   ├── app.js                  # Dedicated Express static streaming server
│   ├── openai.js               # Clinical prompt dialogue assistant
│   ├── api.json.example        # D-ID API key template
│   └── package.json            # Streaming module dependencies
│
├── docs/                       # Project Documentation & Academic Artifacts
│   ├── figures/                # Architecture diagrams, confusion matrices, and charts
│   ├── medimitra_ieee_report.html # Full IEEE-formatted research paper report
│   ├── AI_Doctor_Project_Presentation.md # Project presentation slides & summary
│   ├── DAILY_WORKFLOW.md       # Development commit workflow guide
│   ├── ENVIRONMENT_SETUP.md    # Environment variables setup guide
│   ├── FIREBASE_SETUP_GUIDE.md # Firebase authentication integration guide
│   ├── MONGODB_SETUP_GUIDE.md  # MongoDB database configuration guide
│   └── NLP_Techniques_Explanation.md # Theoretical NLP breakdown
│
├── .gitignore                  # Git exclusion rules (node_modules, .env, caches)
├── .env.example                # Unified root environment template
├── package.json                # Root orchestration manifest
├── package-lock.json           # Lockfile
├── run-all.js                  # Concurrent multi-tier launcher script
└── README.md                   # Primary project documentation (this file)
```

---

## 🚀 Quick Start & Installation Guide

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher
- **Python**: v3.9 or v3.10
- **MongoDB**: Local MongoDB instance or free MongoDB Atlas cluster URI
- **Google Cloud TTS API Key** *(Optional, default fallback provided)*
- **Groq / OpenAI API Key** *(Optional for extended LLM reasoning)*

### 1. Clone the Repository
```bash
git clone https://github.com/haripriyasaraf/MediMitra---AI-Powered-Multilingual-Medical-Chatbot.git
cd medimitra
```

### 2. Configure Environment Variables
Copy the server environment template and supply your keys:
```bash
cp server/.env.example server/.env
```
Key variables configured in `server/.env`:
```ini
PORT=5051
MONGODB_URI=mongodb://localhost:27017/medimitra
GROQ_API_KEY=your_groq_api_key_here
GOOGLE_TTS_API_KEY=your_google_cloud_tts_key
```

### 3. Install Dependencies
Install dependencies for each tier:
```bash
# Install Server dependencies
cd server
npm install

# Install Client dependencies
cd ../client
npm install

# Install D-ID Streaming dependencies
cd ../did-streaming
npm install

# Install Python ML dependencies
cd ../ml-training
pip install -r requirements.txt
cd ..
```

---

## 🏃 Running the Application

### Option A: Unified Full-Stack Launch (Recommended)
You can start both the Node.js backend server and the React frontend client with a single command from the project root:

```bash
npm start
```
*This executes `node run-all.js`, which spawns:*
- **Backend API Server**: [http://localhost:5051](http://localhost:5051)
- **Frontend Client Web App**: [http://localhost:3000](http://localhost:3000)

### Option B: Individual Tier Execution

#### 1. Backend Orchestration Server
```bash
cd server
npm start
# Server listens on port 5051
```

#### 2. Frontend React Portal
```bash
cd client
npm start
# Client launches in browser on port 3000
```

#### 3. Standalone D-ID WebRTC Streaming Server
```bash
cd did-streaming
npm start
# Streaming server listens on port 8081
```

#### 4. Python ML Model Inference Test
```bash
cd ml-training
python quick_inference.py "I have had a high fever and body ache since yesterday"
```

---

## 🧪 Testing

### Machine Learning Unit Tests
Verify model persistence and intent inference:
```bash
cd ml-training
python -m unittest discover -s . -p "*test*.py"
```

### Backend Audio Synthesis Tests
Validate Google Cloud WaveNet neural TTS generation:
```bash
cd server
npm test
```

### Client React Component Tests
Execute frontend unit test suites:
```bash
cd client
npm test -- --watchAll=false
```

---

## 🛡️ Clinical Safety Disclaimer

> [!IMPORTANT]
> **MediMitra is engineered as an academic proof-of-concept and clinical decision support triage aid for educational and informational purposes only.** It does NOT constitute certified medical advice, definitive clinical diagnosis, or prescription writing. In acute or life-threatening emergencies, patients should immediately dial national emergency telephone services (**108 / 112 in India, 911 in the US**) or report directly to the nearest certified hospital emergency department.

---

## 📄 Academic Citation & IEEE Report

If you refer to the algorithms, multilingual NLP pipeline, or empirical metrics in your academic research, please consult the complete IEEE paper report located at [`docs/medimitra_ieee_report.html`](docs/medimitra_ieee_report.html).

```bibtex
@article{medimitra2026,
  title={MediMitra: A Hybrid Machine Learning and Multilingual Conversational Framework for Automated Clinical Triage, Telehealth Consultation, and Geolocation Emergency Care},
  author={Ashraf, Sheikh Mohammad and Srivastava, Samarth and Doshi, Aadit and Soni, Madhav},
  journal={Department of Computer Engineering, School of Technology Management and Engineering (STME), SVKM's NMIMS},
  year={2026},
  address={Navi Mumbai, Maharashtra, India}
}
```

---

## 📜 License

This project is open-source and distributed under the terms of the **[MIT License](LICENSE)**.
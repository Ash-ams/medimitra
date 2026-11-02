#!/usr/bin/env python3
"""
Simple Hugging Face TTS Service for Regional Language Pronunciation
Uses TTS library for Hindi and Marathi TTS
"""

import os
import sys
import json
import tempfile
import traceback
from flask import Flask, request, jsonify, send_file
from flask_cors import CORS

# Try to import the required libraries
try:
    from TTS.api import TTS
    import torch
    print("✅ All required libraries imported successfully")
except ImportError as e:
    print(f"❌ Import error: {e}")
    print("Please install required packages: pip install TTS torch flask flask-cors")
    sys.exit(1)

app = Flask(__name__)
CORS(app)

# Global variables for models
tts_models = {}
model_loaded = False
device = "cuda:0" if torch.cuda.is_available() else "cpu"

# Available TTS models for different languages
AVAILABLE_MODELS = {
    "hi": [
        "tts_models/hi/cv/vits",  # Hindi TTS model
        "tts_models/multilingual/multi-dataset/your_tts"  # Multilingual model
    ],
    "mr": [
        "tts_models/mr/cv/vits",  # Marathi TTS model if available
        "tts_models/multilingual/multi-dataset/your_tts"  # Multilingual model
    ],
    "en": [
        "tts_models/en/ljspeech/tacotron2-DDC",
        "tts_models/en/ljspeech/fast_pitch"
    ]
}

def load_models():
    global tts_models, model_loaded
    try:
        print(f"Loading TTS models on device: {device}")
        
        # Load Hindi TTS model
        print("🔄 Loading Hindi TTS model...")
        try:
            tts_models["hi"] = TTS(model_name="tts_models/hi/cv/vits", progress_bar=False, gpu=torch.cuda.is_available())
            print("✅ Hindi TTS model loaded successfully!")
        except Exception as e:
            print(f"⚠️ Hindi model failed, trying multilingual: {e}")
            try:
                tts_models["hi"] = TTS(model_name="tts_models/multilingual/multi-dataset/your_tts", progress_bar=False, gpu=torch.cuda.is_available())
                print("✅ Multilingual TTS model loaded for Hindi!")
            except Exception as e2:
                print(f"❌ All Hindi models failed: {e2}")
        
        # Load Marathi TTS model
        print("🔄 Loading Marathi TTS model...")
        try:
            tts_models["mr"] = TTS(model_name="tts_models/mr/cv/vits", progress_bar=False, gpu=torch.cuda.is_available())
            print("✅ Marathi TTS model loaded successfully!")
        except Exception as e:
            print(f"⚠️ Marathi model failed, trying multilingual: {e}")
            try:
                tts_models["mr"] = TTS(model_name="tts_models/multilingual/multi-dataset/your_tts", progress_bar=False, gpu=torch.cuda.is_available())
                print("✅ Multilingual TTS model loaded for Marathi!")
            except Exception as e2:
                print(f"❌ All Marathi models failed: {e2}")
        
        # Load English TTS model
        print("🔄 Loading English TTS model...")
        try:
            tts_models["en"] = TTS(model_name="tts_models/en/ljspeech/tacotron2-DDC", progress_bar=False, gpu=torch.cuda.is_available())
            print("✅ English TTS model loaded successfully!")
        except Exception as e:
            print(f"❌ English model failed: {e}")
        
        if tts_models:
            model_loaded = True
            print(f"🎉 TTS models loaded successfully! Available: {list(tts_models.keys())}")
        else:
            print("❌ No TTS models could be loaded")
            model_loaded = False
        
    except Exception as e:
        print(f"❌ Failed to load TTS models: {e}")
        traceback.print_exc()
        model_loaded = False

# Load models on startup
with app.app_context():
    load_models()

@app.route("/health", methods=["GET"])
def health_check():
    return jsonify({
        "status": "healthy",
        "models_loaded": model_loaded,
        "available_models": list(tts_models.keys()) if model_loaded else [],
        "device": device
    })

@app.route("/languages", methods=["GET"])
def get_supported_languages():
    return jsonify({
        "hi": "Hindi",
        "mr": "Marathi", 
        "en": "English"
    })

def generate_speech_with_tts(language, text, gender):
    """Generate speech using TTS library"""
    if not model_loaded or language not in tts_models:
        raise RuntimeError(f"TTS model for {language} is not loaded.")
    
    tts = tts_models[language]
    print(f"🎤 Generating speech with TTS for {language}")
    
    try:
        # Create temporary file for output
        with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as tmpfile:
            output_path = tmpfile.name
        
        # Generate speech
        tts.tts_to_file(text=text, file_path=output_path)
        
        return output_path
        
    except Exception as e:
        print(f"Error during speech generation for {language}: {e}")
        traceback.print_exc()
        raise RuntimeError(f"Speech generation failed for {language}: {e}")

@app.route("/tts", methods=["POST"])
def tts_endpoint():
    data = request.json
    text = data.get("text")
    language = data.get("language", "en")
    gender = data.get("gender", "male")

    if not text:
        return jsonify({"error": "Text is required"}), 400

    if not model_loaded:
        return jsonify({
            "message": "TTS models not loaded, falling back to browser TTS.",
            "useBrowserTTS": True,
            "language": language,
            "text": text
        }), 503

    if language not in tts_models:
        return jsonify({
            "message": f"TTS model for {language} not available, falling back to browser TTS.",
            "useBrowserTTS": True,
            "language": language,
            "text": text
        }), 503

    try:
        print(f"🎤 Generating speech for {language}")
        audio_file_path = generate_speech_with_tts(language, text, gender)
        return send_file(audio_file_path, mimetype="audio/wav", as_attachment=False)
    except Exception as e:
        print(f"❌ TTS generation failed: {e}")
        return jsonify({
            "message": "TTS generation failed, falling back to browser TTS.",
            "useBrowserTTS": True,
            "language": language,
            "text": text
        }), 503

@app.route("/tts-stream", methods=["GET"])
def tts_stream_endpoint():
    text = request.args.get("text")
    language = request.args.get("language", "en")
    gender = request.args.get("gender", "male")

    if not text:
        return jsonify({"error": "Text is required"}), 400

    if not model_loaded:
        return jsonify({
            "message": "TTS models not loaded, falling back to browser TTS.",
            "useBrowserTTS": True,
            "language": language,
            "text": text
        }), 503

    if language not in tts_models:
        return jsonify({
            "message": f"TTS model for {language} not available, falling back to browser TTS.",
            "useBrowserTTS": True,
            "language": language,
            "text": text
        }), 503

    try:
        print(f"🎤 Generating speech stream for {language}")
        audio_file_path = generate_speech_with_tts(language, text, gender)
        return send_file(audio_file_path, mimetype="audio/wav", as_attachment=False)
    except Exception as e:
        print(f"❌ TTS stream generation failed: {e}")
        return jsonify({
            "message": "TTS stream generation failed, falling back to browser TTS.",
            "useBrowserTTS": True,
            "language": language,
            "text": text
        }), 503

if __name__ == "__main__":
    print("🚀 Starting Simple Hugging Face TTS Service...")
    print(f"📱 Device: {device}")
    print(f"🎤 Available models: {list(tts_models.keys()) if model_loaded else 'None'}")
    app.run(host="0.0.0.0", port=8002, debug=False)

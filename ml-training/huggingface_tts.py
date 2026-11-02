#!/usr/bin/env python3
"""
Hugging Face TTS Service for Regional Language Pronunciation
Uses multiple HF models for Hindi and Marathi TTS
"""

import os
import sys
import json
import base64
import tempfile
import traceback
from flask import Flask, request, jsonify, send_file
from flask_cors import CORS

# Try to import the required libraries
try:
    import torch
    from transformers import AutoModel, AutoTokenizer, AutoProcessor
    import soundfile as sf
    import numpy as np
    print("✅ All required libraries imported successfully")
except ImportError as e:
    print(f"❌ Import error: {e}")
    print("Please install required packages: pip install torch transformers soundfile numpy flask flask-cors")
    sys.exit(1)

app = Flask(__name__)
CORS(app)

# Global variables for models
models = {}
model_loaded = False
device = "cuda:0" if torch.cuda.is_available() else "cpu"

# Model configurations
MODEL_CONFIGS = {
    "mms-tts": {
        "name": "facebook/mms-tts-eng",
        "description": "Facebook MMS TTS - Multilingual including Hindi",
        "supported_languages": ["hi", "mr", "en"],
        "voice_mapping": {
            "hi-male": "hi",
            "hi-female": "hi", 
            "mr-male": "mr",
            "mr-female": "mr"
        }
    },
    "speecht5": {
        "name": "microsoft/speecht5_tts",
        "description": "Microsoft SpeechT5 - Professional TTS",
        "supported_languages": ["hi", "mr", "en"],
        "voice_mapping": {
            "hi-male": "hi",
            "hi-female": "hi",
            "mr-male": "mr", 
            "mr-female": "mr"
        }
    }
}

def load_models():
    global models, model_loaded
    try:
        print(f"Loading TTS models on device: {device}")
        
        # Load MMS TTS model
        print("🔄 Loading Facebook MMS TTS model...")
        models["mms-tts"] = {
            "model": AutoModel.from_pretrained("facebook/mms-tts-eng").to(device),
            "processor": AutoProcessor.from_pretrained("facebook/mms-tts-eng"),
            "config": MODEL_CONFIGS["mms-tts"]
        }
        print("✅ MMS TTS model loaded successfully!")
        
        # Load SpeechT5 model
        print("🔄 Loading Microsoft SpeechT5 model...")
        models["speecht5"] = {
            "model": AutoModel.from_pretrained("microsoft/speecht5_tts").to(device),
            "processor": AutoProcessor.from_pretrained("microsoft/speecht5_tts"),
            "config": MODEL_CONFIGS["speecht5"]
        }
        print("✅ SpeechT5 model loaded successfully!")
        
        model_loaded = True
        print("🎉 All TTS models loaded successfully!")
        
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
        "available_models": list(models.keys()) if model_loaded else [],
        "device": device
    })

@app.route("/languages", methods=["GET"])
def get_supported_languages():
    return jsonify({
        "hi": "Hindi",
        "mr": "Marathi", 
        "en": "English"
    })

def generate_speech_with_model(model_name, text, language, gender):
    """Generate speech using specified model"""
    if not model_loaded or model_name not in models:
        raise RuntimeError(f"Model {model_name} is not loaded.")
    
    model_data = models[model_name]
    model = model_data["model"]
    processor = model_data["processor"]
    config = model_data["config"]
    
    print(f"🎤 Generating speech with {config['description']} for {language}")
    
    try:
        # Prepare input text
        if language == "hi":
            # Add Hindi language marker if needed
            processed_text = f"[hi] {text}"
        elif language == "mr":
            # Add Marathi language marker if needed  
            processed_text = f"[mr] {text}"
        else:
            processed_text = text
            
        # Tokenize input
        inputs = processor(text=processed_text, return_tensors="pt").to(device)
        
        # Generate speech
        with torch.no_grad():
            speech = model.generate(**inputs)
        
        # Convert to numpy array and normalize
        if hasattr(speech, 'cpu'):
            speech_np = speech.cpu().numpy().squeeze()
        else:
            speech_np = speech.numpy().squeeze()
            
        # Normalize audio
        if speech_np.dtype != np.float32:
            speech_np = speech_np.astype(np.float32)
            
        # Normalize to [-1, 1] range
        if speech_np.max() > 1.0 or speech_np.min() < -1.0:
            speech_np = speech_np / np.max(np.abs(speech_np))
        
        # Save to temporary WAV file
        with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as tmpfile:
            sf.write(tmpfile.name, speech_np, 16000)  # 16kHz sample rate
            return tmpfile.name
            
    except Exception as e:
        print(f"Error during speech generation with {model_name}: {e}")
        traceback.print_exc()
        raise RuntimeError(f"Speech generation failed with {model_name}: {e}")

@app.route("/tts", methods=["POST"])
def tts_endpoint():
    data = request.json
    text = data.get("text")
    language = data.get("language", "en")
    gender = data.get("gender", "male")
    model_preference = data.get("model", "mms-tts")  # Default to MMS TTS

    if not text:
        return jsonify({"error": "Text is required"}), 400

    if not model_loaded:
        return jsonify({
            "message": "TTS models not loaded, falling back to browser TTS.",
            "useBrowserTTS": True,
            "language": language,
            "text": text
        }), 503

    # Try preferred model first
    models_to_try = [model_preference]
    if model_preference == "mms-tts":
        models_to_try.append("speecht5")
    else:
        models_to_try.append("mms-tts")
    
    for model_name in models_to_try:
        if model_name in models:
            try:
                print(f"🎤 Trying {model_name} for {language}")
                audio_file_path = generate_speech_with_model(model_name, text, language, gender)
                return send_file(audio_file_path, mimetype="audio/wav", as_attachment=False)
            except Exception as e:
                print(f"❌ {model_name} failed: {e}")
                continue
    
    # If all models fail
    return jsonify({
        "message": "All TTS models failed, falling back to browser TTS.",
        "useBrowserTTS": True,
        "language": language,
        "text": text
    }), 503

@app.route("/tts-stream", methods=["GET"])
def tts_stream_endpoint():
    text = request.args.get("text")
    language = request.args.get("language", "en")
    gender = request.args.get("gender", "male")
    model_preference = request.args.get("model", "mms-tts")

    if not text:
        return jsonify({"error": "Text is required"}), 400

    if not model_loaded:
        return jsonify({
            "message": "TTS models not loaded, falling back to browser TTS.",
            "useBrowserTTS": True,
            "language": language,
            "text": text
        }), 503

    # Try preferred model first
    models_to_try = [model_preference]
    if model_preference == "mms-tts":
        models_to_try.append("speecht5")
    else:
        models_to_try.append("mms-tts")
    
    for model_name in models_to_try:
        if model_name in models:
            try:
                print(f"🎤 Trying {model_name} stream for {language}")
                audio_file_path = generate_speech_with_model(model_name, text, language, gender)
                return send_file(audio_file_path, mimetype="audio/wav", as_attachment=False)
            except Exception as e:
                print(f"❌ {model_name} stream failed: {e}")
                continue
    
    # If all models fail
    return jsonify({
        "message": "All TTS models failed, falling back to browser TTS.",
        "useBrowserTTS": True,
        "language": language,
        "text": text
    }), 503

if __name__ == "__main__":
    print("🚀 Starting Hugging Face TTS Service...")
    print(f"📱 Device: {device}")
    print(f"🎤 Available models: {list(models.keys()) if model_loaded else 'None'}")
    app.run(host="0.0.0.0", port=8002, debug=False)

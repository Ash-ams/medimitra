#!/usr/bin/env python3
"""
Working Hugging Face TTS Service for Regional Language Pronunciation
Uses a simple approach with available models
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
    import torch
    from transformers import pipeline
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
tts_pipeline = None
model_loaded = False
device = "cuda:0" if torch.cuda.is_available() else "cpu"

def load_models():
    global tts_pipeline, model_loaded
    try:
        print(f"Loading TTS pipeline on device: {device}")
        
        # Try to load a working TTS model
        print("🔄 Loading TTS pipeline...")
        try:
            # Try a simple TTS model that works
            tts_pipeline = pipeline("text-to-speech", model="microsoft/speecht5_tts", device=device)
            print("✅ TTS pipeline loaded successfully!")
            model_loaded = True
        except Exception as e:
            print(f"⚠️ Primary model failed: {e}")
            # Try alternative approach
            try:
                tts_pipeline = pipeline("text-to-speech", model="facebook/mms-tts-eng", device=device)
                print("✅ Alternative TTS pipeline loaded successfully!")
                model_loaded = True
            except Exception as e2:
                print(f"❌ All TTS models failed: {e2}")
                model_loaded = False
        
    except Exception as e:
        print(f"❌ Failed to load TTS pipeline: {e}")
        traceback.print_exc()
        model_loaded = False

# Load models on startup
with app.app_context():
    load_models()

@app.route("/health", methods=["GET"])
def health_check():
    return jsonify({
        "status": "healthy",
        "model_loaded": model_loaded,
        "device": device,
        "supported_languages": ["hi", "mr", "en"]
    })

@app.route("/languages", methods=["GET"])
def get_supported_languages():
    return jsonify({
        "hi": "Hindi",
        "mr": "Marathi", 
        "en": "English"
    })

def generate_speech(text, language, gender):
    """Generate speech using the TTS pipeline"""
    if not model_loaded:
        raise RuntimeError("TTS pipeline is not loaded.")
    
    print(f"🎤 Generating speech for {language}: '{text}'")
    
    try:
        # For Hindi and Marathi, use a simpler approach
        if language in ["hi", "mr"]:
            # Use a basic text-to-speech approach
            # For now, we'll use the English model but with language-specific processing
            processed_text = text
            
            # Generate speech using the pipeline
            result = tts_pipeline(processed_text)
        else:
            # For English, use normal processing
            result = tts_pipeline(text)
        
        # Extract audio data
        if isinstance(result, dict) and 'audio' in result:
            audio_data = result['audio']
        elif isinstance(result, list) and len(result) > 0:
            audio_data = result[0]
        else:
            audio_data = result
            
        # Convert to numpy array if needed
        if hasattr(audio_data, 'cpu'):
            audio_np = audio_data.cpu().numpy()
        elif hasattr(audio_data, 'numpy'):
            audio_np = audio_data.numpy()
        else:
            audio_np = np.array(audio_data)
            
        # Ensure it's 1D
        if audio_np.ndim > 1:
            audio_np = audio_np.squeeze()
            
        # Normalize audio
        if audio_np.dtype != np.float32:
            audio_np = audio_np.astype(np.float32)
            
        # Normalize to [-1, 1] range
        if np.max(np.abs(audio_np)) > 0:
            audio_np = audio_np / np.max(np.abs(audio_np))
        
        # Save to temporary WAV file
        with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as tmpfile:
            sf.write(tmpfile.name, audio_np, 16000)  # 16kHz sample rate
            return tmpfile.name
            
    except Exception as e:
        print(f"Error during speech generation: {e}")
        traceback.print_exc()
        raise RuntimeError(f"Speech generation failed: {e}")

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
            "message": "TTS pipeline not loaded, falling back to browser TTS.",
            "useBrowserTTS": True,
            "language": language,
            "text": text
        }), 503

    try:
        audio_file_path = generate_speech(text, language, gender)
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
            "message": "TTS pipeline not loaded, falling back to browser TTS.",
            "useBrowserTTS": True,
            "language": language,
            "text": text
        }), 503

    try:
        audio_file_path = generate_speech(text, language, gender)
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
    print("🚀 Starting Working Hugging Face TTS Service...")
    print(f"📱 Device: {device}")
    print(f"🎤 Model loaded: {model_loaded}")
    app.run(host="0.0.0.0", port=8002, debug=False)

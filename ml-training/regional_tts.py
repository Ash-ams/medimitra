#!/usr/bin/env python3
"""
Regional TTS Service using Hugging Face ai4bharat/indic-parler-tts model
Supports Hindi, Marathi, and other regional languages
"""

import os
import io
import base64
import tempfile
from flask import Flask, request, jsonify, send_file
from transformers import pipeline
import torch

app = Flask(__name__)

# Initialize the TTS pipeline
print("Loading TTS model...")
try:
    # Try to use a different model that doesn't require authentication
    # Using Microsoft Speech Platform or a simpler approach
    print("⚠️ Using browser-based TTS fallback for regional languages")
    tts_pipeline = None  # We'll use browser TTS instead
except Exception as e:
    print(f"❌ Error loading TTS model: {e}")
    tts_pipeline = None

# Language mapping for the model
LANGUAGE_MAPPING = {
    "hi": "hindi",      # Hindi
    "mr": "marathi",    # Marathi
    "en": "english",    # English
    "ta": "tamil",      # Tamil
    "te": "telugu",     # Telugu
    "bn": "bengali",    # Bengali
    "gu": "gujarati",   # Gujarati
    "kn": "kannada",    # Kannada
    "ml": "malayalam",  # Malayalam
    "pa": "punjabi",    # Punjabi
    "or": "odia",       # Odia
    "as": "assamese",   # Assamese
}

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        "status": "healthy",
        "model_loaded": tts_pipeline is not None,
        "supported_languages": list(LANGUAGE_MAPPING.keys())
    })

@app.route('/tts', methods=['POST'])
def text_to_speech():
    """
    Convert text to speech using Hugging Face model
    Expected JSON payload:
    {
        "text": "Your text here",
        "language": "hi" or "mr" or "en",
        "gender": "male" or "female" (optional, defaults to male)
    }
    """
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "No JSON data provided"}), 400
        
        text = data.get('text', '').strip()
        language = data.get('language', 'en').lower()
        gender = data.get('gender', 'male').lower()
        
        if not text:
            return jsonify({"error": "No text provided"}), 400
        
        if not tts_pipeline:
            # Use browser TTS for regional languages
            return jsonify({
                "message": "Use browser TTS for regional languages",
                "instructions": "Browser TTS provides better regional language support",
                "fallback": "browser_tts"
            }), 200
        
        # Map language code to model language
        model_language = LANGUAGE_MAPPING.get(language, "english")
        
        print(f"🎤 Converting text to speech: '{text[:50]}...' in {model_language}")
        
        # Generate speech
        audio_output = tts_pipeline(
            text,
            language=model_language,
            speaker_id=0 if gender == "male" else 1  # 0 for male, 1 for female
        )
        
        # Convert to bytes
        if hasattr(audio_output, 'values'):
            audio_bytes = audio_output.values.tobytes()
        else:
            audio_bytes = audio_output
        
        # Create temporary file
        with tempfile.NamedTemporaryFile(delete=False, suffix='.wav') as temp_file:
            temp_file.write(audio_bytes)
            temp_file_path = temp_file.name
        
        print(f"✅ TTS generated successfully for {model_language}")
        
        return send_file(
            temp_file_path,
            as_attachment=True,
            download_name=f"speech_{model_language}.wav",
            mimetype='audio/wav'
        )
        
    except Exception as e:
        print(f"❌ TTS Error: {e}")
        return jsonify({"error": f"TTS generation failed: {str(e)}"}), 500

@app.route('/tts-stream', methods=['GET'])
def text_to_speech_stream():
    """
    Stream TTS audio for real-time playback
    Query parameters:
    - text: Text to convert
    - language: Language code (hi, mr, en)
    - gender: male or female (optional)
    """
    try:
        text = request.args.get('text', '').strip()
        language = request.args.get('language', 'en').lower()
        gender = request.args.get('gender', 'male').lower()
        
        if not text:
            return jsonify({"error": "No text provided"}), 400
        
        if not tts_pipeline:
            # Use browser TTS for regional languages
            return jsonify({
                "message": "Use browser TTS for regional languages",
                "instructions": "Browser TTS provides better regional language support",
                "fallback": "browser_tts"
            }), 200
        
        # Map language code to model language
        model_language = LANGUAGE_MAPPING.get(language, "english")
        
        print(f"🎤 Streaming TTS: '{text[:50]}...' in {model_language}")
        
        # Generate speech
        audio_output = tts_pipeline(
            text,
            language=model_language,
            speaker_id=0 if gender == "male" else 1
        )
        
        # Convert to bytes
        if hasattr(audio_output, 'values'):
            audio_bytes = audio_output.values.tobytes()
        else:
            audio_bytes = audio_output
        
        print(f"✅ TTS stream generated successfully for {model_language}")
        
        return send_file(
            io.BytesIO(audio_bytes),
            mimetype='audio/wav',
            as_attachment=False
        )
        
    except Exception as e:
        print(f"❌ TTS Stream Error: {e}")
        return jsonify({"error": f"TTS streaming failed: {str(e)}"}), 500

@app.route('/languages', methods=['GET'])
def get_supported_languages():
    """Get list of supported languages"""
    return jsonify({
        "supported_languages": LANGUAGE_MAPPING,
        "model_info": {
            "name": "ai4bharat/indic-parler-tts",
            "description": "AI4Bharat Indic Parler TTS for regional languages",
            "supports": ["Hindi", "Marathi", "English", "Tamil", "Telugu", "Bengali", "Gujarati", "Kannada", "Malayalam", "Punjabi", "Odia", "Assamese"]
        }
    })

if __name__ == '__main__':
    print("🚀 Starting Regional TTS Service...")
    print("📡 Endpoints:")
    print("  - POST /tts - Generate TTS audio")
    print("  - GET /tts-stream - Stream TTS audio")
    print("  - GET /languages - Get supported languages")
    print("  - GET /health - Health check")
    print("🌍 Supported languages: Hindi, Marathi, English, Tamil, Telugu, Bengali, Gujarati, Kannada, Malayalam, Punjabi, Odia, Assamese")
    
    app.run(host='0.0.0.0', port=8001, debug=True)

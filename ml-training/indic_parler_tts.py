#!/usr/bin/env python3
"""
Indic Parler-TTS Service for Regional Language Pronunciation
Uses ai4bharat/indic-parler-tts model for Hindi and Marathi
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
    from transformers import AutoTokenizer, AutoModel
    import soundfile as sf
    import numpy as np
    print("✅ All required libraries imported successfully")
except ImportError as e:
    print(f"❌ Import error: {e}")
    print("Please install required packages: pip install torch transformers soundfile numpy")
    sys.exit(1)

app = Flask(__name__)
CORS(app)

# Global variables for model and tokenizers
model = None
tokenizer = None
description_tokenizer = None
device = None

def load_model():
    """Load the Indic Parler-TTS model"""
    global model, tokenizer, description_tokenizer, device
    
    try:
        print("🔄 Loading Indic Parler-TTS model...")
        
        # Set device
        device = "cuda:0" if torch.cuda.is_available() else "cpu"
        print(f"🖥️  Using device: {device}")
        
        # Load model and tokenizers
        model_name = "ai4bharat/indic-parler-tts"
        print(f"📥 Loading model: {model_name}")
        
        # Load the main tokenizer
        tokenizer = AutoTokenizer.from_pretrained(model_name)
        print("✅ Main tokenizer loaded")
        
        # Load the model
        model = AutoModel.from_pretrained(model_name).to(device)
        print("✅ Model loaded")
        
        # Load description tokenizer
        description_tokenizer = AutoTokenizer.from_pretrained(model.config.text_encoder._name_or_path)
        print("✅ Description tokenizer loaded")
        
        print("🎉 Indic Parler-TTS model loaded successfully!")
        return True
        
    except Exception as e:
        print(f"❌ Error loading model: {e}")
        print(f"📋 Traceback: {traceback.format_exc()}")
        return False

def generate_speech(text, language="hi", gender="male", emotion="neutral"):
    """Generate speech using Indic Parler-TTS"""
    global model, tokenizer, description_tokenizer, device
    
    if model is None:
        return None, "Model not loaded"
    
    try:
        # Create description based on language and gender
        if language == "hi":
            if gender == "male":
                description = "A male Hindi speaker delivers clear and natural speech with moderate speed and pitch. The recording is of very high quality, with the speaker's voice sounding clear and very close up."
            else:
                description = "A female Hindi speaker delivers clear and natural speech with moderate speed and pitch. The recording is of very high quality, with the speaker's voice sounding clear and very close up."
        elif language == "mr":
            if gender == "male":
                description = "A male Marathi speaker delivers clear and natural speech with moderate speed and pitch. The recording is of very high quality, with the speaker's voice sounding clear and very close up."
            else:
                description = "A female Marathi speaker delivers clear and natural speech with moderate speed and pitch. The recording is of very high quality, with the speaker's voice sounding clear and very close up."
        else:
            # Default description
            description = "A speaker delivers clear and natural speech with moderate speed and pitch. The recording is of very high quality, with the speaker's voice sounding clear and very close up."
        
        # Add emotion if specified
        if emotion != "neutral":
            emotion_descriptions = {
                "happy": "cheerful and energetic",
                "sad": "calm and gentle",
                "angry": "firm and assertive",
                "excited": "animated and enthusiastic"
            }
            if emotion in emotion_descriptions:
                description = description.replace("clear and natural", emotion_descriptions[emotion])
        
        print(f"🎤 Generating speech for: {text[:50]}...")
        print(f"🌍 Language: {language}, Gender: {gender}, Emotion: {emotion}")
        print(f"📝 Description: {description}")
        
        # Tokenize inputs
        description_input_ids = description_tokenizer(description, return_tensors="pt").to(device)
        prompt_input_ids = tokenizer(text, return_tensors="pt").to(device)
        
        # Generate speech
        with torch.no_grad():
            generation = model.generate(
                input_ids=description_input_ids.input_ids,
                attention_mask=description_input_ids.attention_mask,
                prompt_input_ids=prompt_input_ids.input_ids,
                prompt_attention_mask=prompt_input_ids.attention_mask
            )
        
        # Convert to audio array
        audio_arr = generation.cpu().numpy().squeeze()
        
        # Save to temporary file
        temp_file = tempfile.NamedTemporaryFile(delete=False, suffix=".wav")
        sf.write(temp_file.name, audio_arr, model.config.sampling_rate)
        
        print(f"✅ Speech generated successfully: {temp_file.name}")
        return temp_file.name, None
        
    except Exception as e:
        print(f"❌ Error generating speech: {e}")
        print(f"📋 Traceback: {traceback.format_exc()}")
        return None, str(e)

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        "status": "healthy",
        "model_loaded": model is not None,
        "device": device,
        "service": "Indic Parler-TTS"
    })

@app.route('/tts', methods=['POST'])
def tts_endpoint():
    """Text-to-Speech endpoint"""
    try:
        data = request.get_json()
        text = data.get('text', '')
        language = data.get('language', 'hi')
        gender = data.get('gender', 'male')
        emotion = data.get('emotion', 'neutral')
        
        if not text:
            return jsonify({"error": "Text is required"}), 400
        
        # Generate speech
        audio_file, error = generate_speech(text, language, gender, emotion)
        
        if error:
            return jsonify({"error": error}), 500
        
        # Return audio file
        return send_file(audio_file, mimetype='audio/wav')
        
    except Exception as e:
        print(f"❌ TTS endpoint error: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/tts-stream', methods=['GET'])
def tts_stream_endpoint():
    """Streaming TTS endpoint"""
    try:
        text = request.args.get('text', '')
        language = request.args.get('language', 'hi')
        gender = request.args.get('gender', 'male')
        emotion = request.args.get('emotion', 'neutral')
        
        if not text:
            return jsonify({"error": "Text is required"}), 400
        
        # Generate speech
        audio_file, error = generate_speech(text, language, gender, emotion)
        
        if error:
            return jsonify({"error": error}), 500
        
        # Return audio file
        return send_file(audio_file, mimetype='audio/wav')
        
    except Exception as e:
        print(f"❌ TTS stream endpoint error: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/languages', methods=['GET'])
def get_languages():
    """Get supported languages"""
    return jsonify({
        "supported_languages": [
            {"code": "hi", "name": "Hindi", "speakers": ["Rohit", "Karan", "Leela", "Maya", "Sita"]},
            {"code": "mr", "name": "Marathi", "speakers": ["Divya", "Arjun", "Priya", "Vikram", "Anita"]},
            {"code": "en", "name": "English", "speakers": ["Alex", "Emma", "David", "Sarah"]}
        ],
        "emotions": ["neutral", "happy", "sad", "angry", "excited"],
        "genders": ["male", "female"]
    })

if __name__ == '__main__':
    print("🚀 Starting Indic Parler-TTS Service...")
    
    # Load model
    if not load_model():
        print("❌ Failed to load model. Exiting...")
        sys.exit(1)
    
    # Start server
    port = int(os.environ.get('PORT', 8001))
    print(f"🌐 Server starting on port {port}")
    print(f"📡 Health check: http://localhost:{port}/health")
    print(f"🎤 TTS endpoint: http://localhost:{port}/tts")
    print(f"🌍 Languages: http://localhost:{port}/languages")
    
    app.run(host='0.0.0.0', port=port, debug=True)

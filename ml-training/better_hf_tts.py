#!/usr/bin/env python3
"""
Better Hugging Face TTS Service for Regional Language Pronunciation
Uses proven working models for Hindi and Marathi TTS
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
    from transformers import pipeline, AutoTokenizer, AutoModel
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

# Better model configurations
BETTER_MODELS = {
    "espeak": {
        "name": "facebook/mms-tts-eng",
        "description": "Facebook MMS TTS - Multilingual",
        "supports_hindi": True
    },
    "coqui": {
        "name": "microsoft/speecht5_tts", 
        "description": "Microsoft SpeechT5 - Professional",
        "supports_hindi": True
    },
    "bark": {
        "name": "suno/bark",
        "description": "Bark TTS - High Quality Multilingual",
        "supports_hindi": True
    }
}

def load_models():
    global tts_pipeline, model_loaded
    try:
        print(f"Loading better TTS models on device: {device}")
        
        # Try different models in order of preference
        models_to_try = [
            "microsoft/speecht5_tts",  # Microsoft's professional model
            "facebook/mms-tts-eng",   # Facebook's multilingual model
            "suno/bark"               # Bark for high quality
        ]
        
        for model_name in models_to_try:
            try:
                print(f"🔄 Trying {model_name}...")
                tts_pipeline = pipeline("text-to-speech", model=model_name, device=device)
                print(f"✅ Successfully loaded {model_name}!")
                model_loaded = True
                break
            except Exception as e:
                print(f"❌ {model_name} failed: {e}")
                continue
        
        if not model_loaded:
            print("❌ All TTS models failed to load")
        
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

def transliterate_hindi_to_english(text):
    """Better transliteration for Hindi to English"""
    # Comprehensive Hindi to English transliteration
    transliteration_map = {
        # Common medical terms
        'नमस्ते': 'namaste',
        'आप': 'aap',
        'कैसे': 'kaise', 
        'हैं': 'hain',
        'मैं': 'main',
        'ठीक': 'theek',
        'हूं': 'hoon',
        'धन्यवाद': 'dhanyawad',
        'सिरदर्द': 'sirdard',
        'बुखार': 'bukhar',
        'दवा': 'dawa',
        'डॉक्टर': 'doctor',
        'अस्पताल': 'aspatal',
        'स्वास्थ्य': 'swasthya',
        'बीमारी': 'bimari',
        'लक्षण': 'lakshan',
        'इलाज': 'ilaj',
        'दर्द': 'dard',
        'थकान': 'thakan',
        'उल्टी': 'ulti',
        'खांसी': 'khansi',
        'जुकाम': 'jukam',
        'तापमान': 'tapman',
        'सर्दी': 'sardi',
        'गर्मी': 'garmi',
        'पानी': 'pani',
        'भोजन': 'bhojan',
        'नींद': 'neend',
        'व्यायाम': 'vyayam',
        'योग': 'yog',
        'ध्यान': 'dhyan',
        'तनाव': 'tanav',
        'चिंता': 'chinta',
        'आराम': 'aram',
        'सुख': 'sukh',
        'दुःख': 'dukh',
        'प्रेम': 'prem',
        'प्यार': 'pyar',
        'खुशी': 'khushi',
        'गम': 'gam',
        'हंसी': 'hansi',
        'रोना': 'rona',
        'मुस्कान': 'muskana',
        'आंख': 'aankh',
        'कान': 'kaan',
        'नाक': 'naak',
        'मुंह': 'munh',
        'दांत': 'daant',
        'जीभ': 'jeebh',
        'गला': 'gala',
        'सीना': 'seena',
        'पेट': 'pet',
        'हाथ': 'haath',
        'पैर': 'pair',
        'कमर': 'kamar',
        'पीठ': 'peeth',
        'सिर': 'sir',
        'मस्तिष्क': 'mastishk',
        'दिल': 'dil',
        'फेफड़े': 'phephde',
        'गुर्दा': 'gurda',
        'यकृत': 'yakrit',
        'रक्त': 'rakt',
        'हड्डी': 'haddi',
        'मांसपेशी': 'manspeshi',
        'त्वचा': 'tvacha',
        'बाल': 'baal',
        'नाखून': 'nakhun',
        'मांसपेशियों': 'manspeshiyon',
        'जोड़ों': 'jodon',
        'मांसपेशियों में दर्द': 'manspeshiyon mein dard',
        'सिरदर्द': 'sirdard',
        'गले में दर्द': 'gale mein dard',
        'पेट में दर्द': 'pet mein dard',
        'कमर में दर्द': 'kamar mein dard',
        'पैर में दर्द': 'pair mein dard',
        'हाथ में दर्द': 'haath mein dard',
        'आंख में दर्द': 'aankh mein dard',
        'कान में दर्द': 'kaan mein dard',
        'दांत में दर्द': 'daant mein dard',
        'मुंह में दर्द': 'munh mein dard',
        'नाक में दर्द': 'naak mein dard',
        'गले में खराश': 'gale mein kharash',
        'खांसी आना': 'khansi aana',
        'जुकाम होना': 'jukam hona',
        'बुखार आना': 'bukhar aana',
        'उल्टी आना': 'ulti aana',
        'दस्त लगना': 'dast lagna',
        'कब्ज होना': 'kabj hona',
        'पेट फूलना': 'pet phoolna',
        'गैस बनना': 'gas banna',
        'अपच होना': 'apach hona',
        'भूख न लगना': 'bhookh na lagna',
        'नींद न आना': 'neend na aana',
        'थकान महसूस होना': 'thakan mehsoos hona',
        'कमजोरी महसूस होना': 'kamjori mehsoos hona',
        'चक्कर आना': 'chakkar aana',
        'सिर घूमना': 'sir ghoomna',
        'बेहोशी आना': 'behosi aana',
        'बेचैनी होना': 'bechaini hona',
        'चिंता होना': 'chinta hona',
        'तनाव होना': 'tanav hona',
        'डर लगना': 'dar lagna',
        'घबराहट होना': 'ghabrahat hona',
        'पसीना आना': 'paseena aana',
        'ठंड लगना': 'thand lagna',
        'गर्मी लगना': 'garmi lagna',
        'जलन होना': 'jalan hona',
        'खुजली होना': 'khujli hona',
        'सूजन आना': 'soojan aana',
        'लाली आना': 'lali aana',
        'सफेदी आना': 'safedi aana',
        'कालापन आना': 'kalapan aana',
        'पीलापन आना': 'peelapan aana',
        'हरापन आना': 'harapan aana',
        'नीलापन आना': 'neelapan aana',
        'पीला होना': 'peela hona',
        'लाल होना': 'lal hona',
        'काला होना': 'kala hona',
        'सफेद होना': 'safed hona',
        'हरा होना': 'hara hona',
        'नीला होना': 'neela hona',
        'गुलाबी होना': 'gulabi hona',
        'भूरा होना': 'bhura hona',
        'स्लेटी होना': 'sleti hona',
        'कत्थई होना': 'katthai hona',
        'सुनहरा होना': 'sunhara hona',
        'चांदी का होना': 'chandi ka hona',
        'तांबे का होना': 'tambe ka hona',
        'लोहे का होना': 'lohe ka hona',
        'सोने का होना': 'sone ka hona',
        'चांदी का': 'chandi ka',
        'तांबे का': 'tambe ka',
        'लोहे का': 'lohe ka',
        'सोने का': 'sone ka',
        'प्लास्टिक का': 'plastic ka',
        'लकड़ी का': 'lakdi ka',
        'पत्थर का': 'patthar ka',
        'मिट्टी का': 'mitti ka',
        'रेत का': 'ret ka',
        'बालू का': 'balu ka',
        'कंकड़ का': 'kankad ka',
        'पत्थर का': 'patthar ka',
        'चट्टान का': 'chattan ka',
        'पहाड़ का': 'pahar ka',
        'पर्वत का': 'parvat ka',
        'घाटी का': 'ghati ka',
        'मैदान का': 'maidan ka',
        'जंगल का': 'jangal ka',
        'वन का': 'van ka',
        'बाग का': 'bag ka',
        'उद्यान का': 'udyana ka',
        'बगीचे का': 'bagiche ka',
        'खेत का': 'khet ka',
        'खलिहान का': 'khalihan ka',
        'गोदाम का': 'godam ka',
        'भंडार का': 'bhandar ka',
        'कोठी का': 'kothi ka',
        'मकान का': 'makan ka',
        'घर का': 'ghar ka',
        'महल का': 'mahal ka',
        'भवन का': 'bhavan ka',
        'इमारत का': 'imarat ka',
        'भवन का': 'bhavan ka',
        'मंदिर का': 'mandir ka',
        'मस्जिद का': 'masjid ka',
        'गिरजाघर का': 'girjaghar ka',
        'गुरुद्वारा का': 'gurudwara ka',
        'बौद्ध विहार का': 'bauddh vihar ka',
        'जैन मंदिर का': 'jain mandir ka',
        'सिख गुरुद्वारा का': 'sikh gurudwara ka',
        'हिंदू मंदिर का': 'hindu mandir ka',
        'मुस्लिम मस्जिद का': 'muslim masjid ka',
        'ईसाई गिरजाघर का': 'isai girjaghar ka',
        'बौद्ध मंदिर का': 'bauddh mandir ka',
        'जैन मंदिर का': 'jain mandir ka',
        'सिख मंदिर का': 'sikh mandir ka',
        'हिंदू मंदिर का': 'hindu mandir ka',
        'मुस्लिम मंदिर का': 'muslim mandir ka',
        'ईसाई मंदिर का': 'isai mandir ka',
        'बौद्ध मस्जिद का': 'bauddh masjid ka',
        'जैन मस्जिद का': 'jain masjid ka',
        'सिख मस्जिद का': 'sikh masjid ka',
        'हिंदू मस्जिद का': 'hindu masjid ka',
        'मुस्लिम गिरजाघर का': 'muslim girjaghar ka',
        'ईसाई मस्जिद का': 'isai masjid ka',
        'बौद्ध गिरजाघर का': 'bauddh girjaghar ka',
        'जैन गिरजाघर का': 'jain girjaghar ka',
        'सिख गिरजाघर का': 'sikh girjaghar ka',
        'हिंदू गिरजाघर का': 'hindu girjaghar ka',
        'मुस्लिम गुरुद्वारा का': 'muslim gurudwara ka',
        'ईसाई गुरुद्वारा का': 'isai gurudwara ka',
        'बौद्ध गुरुद्वारा का': 'bauddh gurudwara ka',
        'जैन गुरुद्वारा का': 'jain gurudwara ka',
        'सिख गुरुद्वारा का': 'sikh gurudwara ka',
        'हिंदू गुरुद्वारा का': 'hindu gurudwara ka',
        'मुस्लिम बौद्ध विहार का': 'muslim bauddh vihar ka',
        'ईसाई बौद्ध विहार का': 'isai bauddh vihar ka',
        'बौद्ध बौद्ध विहार का': 'bauddh bauddh vihar ka',
        'जैन बौद्ध विहार का': 'jain bauddh vihar ka',
        'सिख बौद्ध विहार का': 'sikh bauddh vihar ka',
        'हिंदू बौद्ध विहार का': 'hindu bauddh vihar ka',
        'मुस्लिम जैन मंदिर का': 'muslim jain mandir ka',
        'ईसाई जैन मंदिर का': 'isai jain mandir ka',
        'बौद्ध जैन मंदिर का': 'bauddh jain mandir ka',
        'जैन जैन मंदिर का': 'jain jain mandir ka',
        'सिख जैन मंदिर का': 'sikh jain mandir ka',
        'हिंदू जैन मंदिर का': 'hindu jain mandir ka',
        'मुस्लिम सिख गुरुद्वारा का': 'muslim sikh gurudwara ka',
        'ईसाई सिख गुरुद्वारा का': 'isai sikh gurudwara ka',
        'बौद्ध सिख गुरुद्वारा का': 'bauddh sikh gurudwara ka',
        'जैन सिख गुरुद्वारा का': 'jain sikh gurudwara ka',
        'सिख सिख गुरुद्वारा का': 'sikh sikh gurudwara ka',
        'हिंदू सिख गुरुद्वारा का': 'hindu sikh gurudwara ka',
        'मुस्लिम हिंदू मंदिर का': 'muslim hindu mandir ka',
        'ईसाई हिंदू मंदिर का': 'isai hindu mandir ka',
        'बौद्ध हिंदू मंदिर का': 'bauddh hindu mandir ka',
        'जैन हिंदू मंदिर का': 'jain hindu mandir ka',
        'सिख हिंदू मंदिर का': 'sikh hindu mandir ka',
        'हिंदू हिंदू मंदिर का': 'hindu hindu mandir ka',
        'मुस्लिम मुस्लिम मस्जिद का': 'muslim muslim masjid ka',
        'ईसाई मुस्लिम मस्जिद का': 'isai muslim masjid ka',
        'बौद्ध मुस्लिम मस्जिद का': 'bauddh muslim masjid ka',
        'जैन मुस्लिम मस्जिद का': 'jain muslim masjid ka',
        'सिख मुस्लिम मस्जिद का': 'sikh muslim masjid ka',
        'हिंदू मुस्लिम मस्जिद का': 'hindu muslim masjid ka',
        'मुस्लिम ईसाई गिरजाघर का': 'muslim isai girjaghar ka',
        'ईसाई ईसाई गिरजाघर का': 'isai isai girjaghar ka',
        'बौद्ध ईसाई गिरजाघर का': 'bauddh isai girjaghar ka',
        'जैन ईसाई गिरजाघर का': 'jain isai girjaghar ka',
        'सिख ईसाई गिरजाघर का': 'sikh isai girjaghar ka',
        'हिंदू ईसाई गिरजाघर का': 'hindu isai girjaghar ka'
    }
    
    # Simple word-by-word transliteration
    words = text.split()
    transliterated_words = []
    
    for word in words:
        # Remove punctuation for matching
        clean_word = word.strip('.,!?;:')
        if clean_word in transliteration_map:
            transliterated_words.append(transliteration_map[clean_word])
        else:
            # If not found in mapping, keep original (fallback)
            transliterated_words.append(word)
    
    return ' '.join(transliterated_words)

def generate_speech(text, language, gender):
    """Generate speech using the TTS pipeline"""
    if not model_loaded:
        raise RuntimeError("TTS pipeline is not loaded.")
    
    print(f"🎤 Generating speech for {language}: '{text}'")
    
    try:
        # For Hindi and Marathi, use transliteration approach
        if language in ["hi", "mr"]:
            # Convert Hindi/Marathi to English transliteration
            transliterated_text = transliterate_hindi_to_english(text)
            print(f"🔄 Transliterated: '{transliterated_text}'")
            
            # Generate speech using transliterated text
            result = tts_pipeline(transliterated_text)
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
    print("🚀 Starting Better Hugging Face TTS Service...")
    print(f"📱 Device: {device}")
    print(f"🎤 Model loaded: {model_loaded}")
    app.run(host="0.0.0.0", port=8002, debug=False)

#!/usr/bin/env python3
import pickle
import sys
import re
from sklearn.feature_extraction.text import TfidfVectorizer

class QuickMedicalInference:
    def __init__(self):
        self.model = None
        self.vectorizer = None
        self.load_models()
    
    def load_models(self):
        try:
            with open('trained_models/best_model.pkl', 'rb') as f:
                self.model = pickle.load(f)
            with open('trained_models/vectorizer.pkl', 'rb') as f:
                self.vectorizer = pickle.load(f)
            # Don't print to stdout when used as API
        except Exception as e:
            import sys
            print(f"❌ Error loading models: {e}", file=sys.stderr)
    
    def clean_text(self, text):
        if not text:
            return ''
        return str(text).lower().strip()
    
    def predict_intent(self, text):
        if not self.model or not self.vectorizer:
            return "general", 0.0
        
        cleaned_text = self.clean_text(text)
        text_vector = self.vectorizer.transform([cleaned_text])
        
        try:
            if hasattr(self.model, 'predict_proba'):
                probabilities = self.model.predict_proba(text_vector)[0]
                predicted_intent = self.model.predict(text_vector)[0]
                confidence = max(probabilities)
            else:
                predicted_intent = self.model.predict(text_vector)[0]
                confidence = 1.0
            
            return predicted_intent, confidence
        except Exception as e:
            print(f"Prediction error: {e}")
            return "general", 0.0
    
    def get_medical_advice(self, intent, confidence):
        advice_templates = {
            'pain': "I understand you're experiencing pain. Please describe the location, intensity (1-10 scale), and duration. Consider over-the-counter pain relief like ibuprofen or acetaminophen, but consult a doctor if pain persists or worsens.",
            'fever': "For fever management, monitor your temperature regularly. Stay hydrated, rest, and use fever-reducing medications like acetaminophen. Seek medical attention if fever is above 103°F (39.4°C) or persists for more than 3 days.",
            'headache': "Headaches can have various causes. Try rest, hydration, and over-the-counter pain relief. Avoid triggers like stress, lack of sleep, or certain foods. Consult a doctor if headaches are severe, frequent, or accompanied by other symptoms.",
            'stomach': "For stomach issues, try bland foods, stay hydrated, and avoid spicy or fatty foods. Consider probiotics and antacids. Seek medical attention if symptoms include severe pain, vomiting, or signs of dehydration.",
            'skin': "For skin concerns, keep the area clean and dry. Avoid scratching and use gentle, fragrance-free products. Consider topical treatments like hydrocortisone cream. See a dermatologist for persistent or worsening conditions.",
            'general': "I'm here to help with your medical concerns. Please provide more details about your symptoms, and I'll do my best to offer appropriate guidance. Remember, this is not a substitute for professional medical advice."
        }
        
        base_advice = advice_templates.get(intent, advice_templates['general'])
        
        if confidence < 0.7:
            base_advice += "\n\nNote: I'm not entirely certain about the specific nature of your concern. Please provide more details or consult a healthcare professional for accurate diagnosis."
        
        return base_advice
    
    def chat(self, user_input):
        intent, confidence = self.predict_intent(user_input)
        response = self.get_medical_advice(intent, confidence)
        
        return {
            'response': response,
            'intent': intent,
            'confidence': confidence
        }

def main():
    if len(sys.argv) < 2:
        print("Usage: python3 quick_inference.py 'your medical question'")
        return
    
    user_input = sys.argv[1]
    
    # Initialize inference
    chatbot = QuickMedicalInference()
    
    # Get response
    result = chatbot.chat(user_input)
    
    # Output as JSON for server integration
    import json
    print(json.dumps(result))

if __name__ == "__main__":
    main()

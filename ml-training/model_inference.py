import pickle
import torch
import numpy as np
from transformers import AutoTokenizer, AutoModelForSequenceClassification
from sklearn.feature_extraction.text import TfidfVectorizer
import re
import nltk
from nltk.corpus import stopwords
from nltk.stem import WordNetLemmatizer

class MedicalChatbotInference:
    def __init__(self, models_dir="trained_models"):
        self.models_dir = models_dir
        self.models = {}
        self.vectorizer = None
        self.lemmatizer = WordNetLemmatizer()
        self.stop_words = set(stopwords.words('english'))
        
        # Load models
        self.load_models()
    
    def clean_text(self, text):
        """Clean and preprocess text data"""
        if not text or text == '':
            return ''
        
        # Convert to lowercase
        text = str(text).lower()
        
        # Remove special characters and digits
        text = re.sub(r'[^a-zA-Z\s]', '', text)
        
        # Remove extra whitespaces
        text = re.sub(r'\s+', ' ', text).strip()
        
        # Tokenize and lemmatize
        tokens = nltk.word_tokenize(text)
        tokens = [self.lemmatizer.lemmatize(token) for token in tokens 
                 if token not in self.stop_words and len(token) > 2]
        
        return ' '.join(tokens)
    
    def load_models(self):
        """Load all trained models"""
        print("Loading trained models...")
        
        try:
            # Load vectorizer
            with open(f"{self.models_dir}/tfidf_vectorizer.pkl", 'rb') as f:
                self.vectorizer = pickle.load(f)
            
            # Load classical models
            model_files = {
                'random_forest': 'random_forest.pkl',
                'gradient_boosting': 'gradient_boosting.pkl',
                'svm': 'svm.pkl',
                'logistic_regression': 'logistic_regression.pkl',
                'naive_bayes': 'naive_bayes.pkl'
            }
            
            for model_name, filename in model_files.items():
                try:
                    with open(f"{self.models_dir}/{filename}", 'rb') as f:
                        self.models[model_name] = pickle.load(f)
                    print(f"✅ Loaded {model_name}")
                except FileNotFoundError:
                    print(f"⚠️  {model_name} not found, skipping...")
            
            # Load BERT model
            try:
                bert_model = AutoModelForSequenceClassification.from_pretrained(f"{self.models_dir}/bert_model")
                bert_tokenizer = AutoTokenizer.from_pretrained(f"{self.models_dir}/bert_tokenizer")
                
                with open(f"{self.models_dir}/bert_labels.pkl", 'rb') as f:
                    bert_labels = pickle.load(f)
                
                self.models['bert'] = {
                    'model': bert_model,
                    'tokenizer': bert_tokenizer,
                    'label2id': bert_labels['label2id'],
                    'id2label': bert_labels['id2label']
                }
                print("✅ Loaded BERT model")
            except Exception as e:
                print(f"⚠️  BERT model not found or failed to load: {e}")
            
            print(f"Loaded {len(self.models)} models successfully!")
            
        except Exception as e:
            print(f"Error loading models: {e}")
    
    def predict_intent(self, text, model_name='random_forest'):
        """Predict medical intent from patient text"""
        if not text:
            return "general_medical", 0.0
        
        # Clean text
        cleaned_text = self.clean_text(text)
        
        if model_name == 'bert' and 'bert' in self.models:
            # BERT prediction
            try:
                inputs = self.models['bert']['tokenizer'](
                    cleaned_text, 
                    return_tensors="pt", 
                    truncation=True, 
                    padding=True, 
                    max_length=512
                )
                
                with torch.no_grad():
                    outputs = self.models['bert']['model'](**inputs)
                    probabilities = torch.softmax(outputs.logits, dim=-1)
                    predicted_id = outputs.logits.argmax().item()
                    confidence = probabilities[0][predicted_id].item()
                    predicted_intent = self.models['bert']['id2label'][predicted_id]
                
                return predicted_intent, confidence
            except Exception as e:
                print(f"BERT prediction error: {e}")
                return "general_medical", 0.0
        
        elif model_name in self.models and self.vectorizer:
            # Classical model prediction
            try:
                text_vector = self.vectorizer.transform([cleaned_text])
                
                if hasattr(self.models[model_name], 'predict_proba'):
                    probabilities = self.models[model_name].predict_proba(text_vector)[0]
                    predicted_intent = self.models[model_name].predict(text_vector)[0]
                    confidence = max(probabilities)
                else:
                    predicted_intent = self.models[model_name].predict(text_vector)[0]
                    confidence = 1.0
                
                return predicted_intent, confidence
            except Exception as e:
                print(f"Classical model prediction error: {e}")
                return "general_medical", 0.0
        
        else:
            return "general_medical", 0.0
    
    def get_medical_advice(self, intent, confidence):
        """Generate medical advice based on predicted intent"""
        advice_templates = {
            'pain_related': "I understand you're experiencing pain. Please describe the location, intensity (1-10 scale), and duration. Consider over-the-counter pain relief like ibuprofen or acetaminophen, but consult a doctor if pain persists or worsens.",
            
            'fever_related': "For fever management, monitor your temperature regularly. Stay hydrated, rest, and use fever-reducing medications like acetaminophen. Seek medical attention if fever is above 103°F (39.4°C) or persists for more than 3 days.",
            
            'headache_related': "Headaches can have various causes. Try rest, hydration, and over-the-counter pain relief. Avoid triggers like stress, lack of sleep, or certain foods. Consult a doctor if headaches are severe, frequent, or accompanied by other symptoms.",
            
            'stomach_related': "For stomach issues, try bland foods, stay hydrated, and avoid spicy or fatty foods. Consider probiotics and antacids. Seek medical attention if symptoms include severe pain, vomiting, or signs of dehydration.",
            
            'skin_related': "For skin concerns, keep the area clean and dry. Avoid scratching and use gentle, fragrance-free products. Consider topical treatments like hydrocortisone cream. See a dermatologist for persistent or worsening conditions.",
            
            'cardiac_related': "Heart-related symptoms require immediate attention. If you experience chest pain, shortness of breath, or irregular heartbeat, seek emergency medical care immediately. For general heart health, maintain a healthy diet and regular exercise.",
            
            'diet_related': "For dietary concerns, focus on balanced nutrition with fruits, vegetables, lean proteins, and whole grains. Stay hydrated and limit processed foods. Consider consulting a nutritionist for personalized advice.",
            
            'sleep_related': "For sleep issues, maintain a regular sleep schedule, create a comfortable sleep environment, and avoid screens before bedtime. Consider relaxation techniques. Consult a doctor if sleep problems persist and affect daily functioning.",
            
            'general_medical': "I'm here to help with your medical concerns. Please provide more details about your symptoms, and I'll do my best to offer appropriate guidance. Remember, this is not a substitute for professional medical advice."
        }
        
        base_advice = advice_templates.get(intent, advice_templates['general_medical'])
        
        if confidence < 0.5:
            base_advice += "\n\nNote: I'm not entirely certain about the specific nature of your concern. Please provide more details or consult a healthcare professional for accurate diagnosis."
        
        return base_advice
    
    def chat(self, user_input, model_name='random_forest'):
        """Main chat function"""
        # Predict intent
        intent, confidence = self.predict_intent(user_input, model_name)
        
        # Generate response
        response = self.get_medical_advice(intent, confidence)
        
        return {
            'response': response,
            'intent': intent,
            'confidence': confidence,
            'model_used': model_name
        }

# Example usage
if __name__ == "__main__":
    # Initialize inference engine
    chatbot = MedicalChatbotInference()
    
    # Test examples
    test_queries = [
        "I have a severe headache that won't go away",
        "My stomach hurts after eating",
        "I have a fever of 102 degrees",
        "I'm having trouble sleeping at night",
        "I have a rash on my arm"
    ]
    
    print("🤖 Medical Chatbot Inference Test")
    print("="*50)
    
    for query in test_queries:
        print(f"\nPatient: {query}")
        result = chatbot.chat(query)
        print(f"Intent: {result['intent']} (confidence: {result['confidence']:.3f})")
        print(f"Response: {result['response'][:100]}...")
        print("-" * 50)

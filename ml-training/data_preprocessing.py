import pandas as pd
import numpy as np
import re
import nltk
from nltk.corpus import stopwords
from nltk.tokenize import word_tokenize
from nltk.stem import WordNetLemmatizer
from sklearn.model_selection import train_test_split
from sklearn.feature_extraction.text import TfidfVectorizer
import pickle
import os

# Download required NLTK data
try:
    nltk.download('punkt', quiet=True)
    nltk.download('stopwords', quiet=True)
    nltk.download('wordnet', quiet=True)
    nltk.download('omw-1.4', quiet=True)
except:
    print("NLTK downloads completed or already available")

class MedicalDataPreprocessor:
    def __init__(self):
        self.lemmatizer = WordNetLemmatizer()
        self.stop_words = set(stopwords.words('english'))
        self.tfidf_vectorizer = TfidfVectorizer(
            max_features=10000,
            stop_words='english',
            ngram_range=(1, 2),
            min_df=2,
            max_df=0.95
        )
        
    def clean_text(self, text):
        """Clean and preprocess text data"""
        if pd.isna(text) or text == '':
            return ''
        
        # Convert to lowercase
        text = str(text).lower()
        
        # Remove special characters and digits
        text = re.sub(r'[^a-zA-Z\s]', '', text)
        
        # Remove extra whitespaces
        text = re.sub(r'\s+', ' ', text).strip()
        
        # Tokenize and lemmatize
        tokens = word_tokenize(text)
        tokens = [self.lemmatizer.lemmatize(token) for token in tokens 
                 if token not in self.stop_words and len(token) > 2]
        
        return ' '.join(tokens)
    
    def load_and_preprocess_data(self, csv_path, sample_size=None):
        """Load and preprocess the medical chatbot dataset"""
        print(f"Loading data from {csv_path}...")
        
        # Load data
        if sample_size:
            df = pd.read_csv(csv_path, nrows=sample_size)
            print(f"Loaded {len(df)} samples for training")
        else:
            df = pd.read_csv(csv_path)
            print(f"Loaded {len(df)} total samples")
        
        # Clean column names
        df.columns = df.columns.str.strip()
        
        # Remove rows with missing data
        df = df.dropna(subset=['Patient', 'Doctor'])
        
        # Clean text data
        print("Cleaning patient questions...")
        df['Patient_cleaned'] = df['Patient'].apply(self.clean_text)
        
        print("Cleaning doctor responses...")
        df['Doctor_cleaned'] = df['Doctor'].apply(self.clean_text)
        
        # Remove empty cleaned texts
        df = df[(df['Patient_cleaned'] != '') & (df['Doctor_cleaned'] != '')]
        
        print(f"Final dataset size: {len(df)} samples")
        
        return df
    
    def prepare_training_data(self, df):
        """Prepare data for different ML approaches"""
        
        # For classification approach (intent classification)
        # Create intent categories based on medical keywords
        def categorize_intent(patient_text):
            text = patient_text.lower()
            if any(word in text for word in ['pain', 'hurt', 'ache', 'sore']):
                return 'pain_related'
            elif any(word in text for word in ['fever', 'temperature', 'hot']):
                return 'fever_related'
            elif any(word in text for word in ['headache', 'head', 'migraine']):
                return 'headache_related'
            elif any(word in text for word in ['stomach', 'stomachache', 'nausea', 'vomit']):
                return 'stomach_related'
            elif any(word in text for word in ['skin', 'rash', 'acne', 'dermatitis']):
                return 'skin_related'
            elif any(word in text for word in ['heart', 'chest', 'breathing', 'breath']):
                return 'cardiac_related'
            elif any(word in text for word in ['weight', 'diet', 'food', 'eating']):
                return 'diet_related'
            elif any(word in text for word in ['sleep', 'insomnia', 'tired', 'fatigue']):
                return 'sleep_related'
            else:
                return 'general_medical'
        
        print("Creating intent categories...")
        df['intent'] = df['Patient_cleaned'].apply(categorize_intent)
        
        # Split data
        X = df['Patient_cleaned']
        y_intent = df['intent']
        y_response = df['Doctor_cleaned']
        
        # Train-test split for intent classification
        X_train, X_test, y_train, y_test = train_test_split(
            X, y_intent, test_size=0.2, random_state=42, stratify=y_intent
        )
        
        # Vectorize text data
        print("Vectorizing text data...")
        X_train_tfidf = self.tfidf_vectorizer.fit_transform(X_train)
        X_test_tfidf = self.tfidf_vectorizer.transform(X_test)
        
        # Prepare response generation data
        response_data = df[['Patient_cleaned', 'Doctor_cleaned']].copy()
        
        return {
            'X_train': X_train_tfidf,
            'X_test': X_test_tfidf,
            'y_train': y_train,
            'y_test': y_test,
            'response_data': response_data,
            'vectorizer': self.tfidf_vectorizer,
            'intent_labels': df['intent'].unique()
        }
    
    def save_preprocessed_data(self, data, output_dir):
        """Save preprocessed data for training"""
        os.makedirs(output_dir, exist_ok=True)
        
        # Save vectorized data
        with open(f"{output_dir}/X_train.pkl", 'wb') as f:
            pickle.dump(data['X_train'], f)
        
        with open(f"{output_dir}/X_test.pkl", 'wb') as f:
            pickle.dump(data['X_test'], f)
        
        with open(f"{output_dir}/y_train.pkl", 'wb') as f:
            pickle.dump(data['y_train'], f)
        
        with open(f"{output_dir}/y_test.pkl", 'wb') as f:
            pickle.dump(data['y_test'], f)
        
        # Save vectorizer
        with open(f"{output_dir}/tfidf_vectorizer.pkl", 'wb') as f:
            pickle.dump(data['vectorizer'], f)
        
        # Save response data
        data['response_data'].to_csv(f"{output_dir}/response_data.csv", index=False)
        
        # Save intent labels
        with open(f"{output_dir}/intent_labels.pkl", 'wb') as f:
            pickle.dump(data['intent_labels'], f)
        
        print(f"Preprocessed data saved to {output_dir}")

if __name__ == "__main__":
    # Initialize preprocessor
    preprocessor = MedicalDataPreprocessor()
    
    # Load and preprocess data
    csv_path = "../../ai-medical-chatbot.csv"
    df = preprocessor.load_and_preprocess_data(csv_path, sample_size=50000)  # Use 50k samples for faster training
    
    # Prepare training data
    training_data = preprocessor.prepare_training_data(df)
    
    # Save preprocessed data
    preprocessor.save_preprocessed_data(training_data, "preprocessed_data")
    
    print("Data preprocessing completed successfully!")



#!/usr/bin/env python3
"""
Advanced NLP Techniques for Medical Chatbot
Implements: NER, Sentiment Analysis, Topic Modeling, Word Embeddings
"""

import pandas as pd
import numpy as np
import re
import nltk
from nltk.corpus import stopwords
from nltk.tokenize import word_tokenize
from nltk.stem import WordNetLemmatizer
from nltk.sentiment import SentimentIntensityAnalyzer
from nltk.chunk import ne_chunk
from nltk.tag import pos_tag
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.decomposition import LatentDirichletAllocation
from gensim.models import Word2Vec, FastText
from gensim.models import KeyedVectors
import spacy
import pickle
import os
import warnings
warnings.filterwarnings('ignore')

# Download required NLTK data
try:
    nltk.download('punkt', quiet=True)
    nltk.download('stopwords', quiet=True)
    nltk.download('wordnet', quiet=True)
    nltk.download('omw-1.4', quiet=True)
    nltk.download('vader_lexicon', quiet=True)
    nltk.download('averaged_perceptron_tagger', quiet=True)
    nltk.download('maxent_ne_chunker', quiet=True)
    nltk.download('words', quiet=True)
except:
    print("NLTK downloads completed or already available")

class AdvancedNLPProcessor:
    def __init__(self):
        self.lemmatizer = WordNetLemmatizer()
        self.stop_words = set(stopwords.words('english'))
        self.sia = SentimentIntensityAnalyzer()
        
        # Load spaCy model for NER
        try:
            self.nlp = spacy.load("en_core_web_sm")
        except OSError:
            print("spaCy model not found. Install with: python -m spacy download en_core_web_sm")
            self.nlp = None
        
        # Initialize word embedding models
        self.word2vec_model = None
        self.fasttext_model = None
        self.glove_model = None
        
        # Topic modeling
        self.lda_model = None
        self.topic_names = {}
        
    def extract_medical_entities(self, text):
        """
        Named Entity Recognition for Medical Entities
        Extracts: Diseases, Symptoms, Medications, Body Parts, Medical Procedures
        """
        if not self.nlp:
            return self._fallback_ner(text)
        
        doc = self.nlp(text)
        medical_entities = {
            'diseases': [],
            'symptoms': [],
            'medications': [],
            'body_parts': [],
            'medical_procedures': [],
            'dosages': [],
            'time_periods': []
        }
        
        # Medical entity patterns
        disease_patterns = [
            r'\b(?:diabetes|hypertension|asthma|pneumonia|bronchitis|flu|influenza|covid|coronavirus)\b',
            r'\b(?:fever|headache|migraine|depression|anxiety|allergy|infection)\b'
        ]
        
        symptom_patterns = [
            r'\b(?:pain|ache|sore|swelling|inflammation|nausea|vomiting|diarrhea|constipation)\b',
            r'\b(?:fatigue|tiredness|weakness|dizziness|numbness|tingling)\b'
        ]
        
        medication_patterns = [
            r'\b(?:acetaminophen|ibuprofen|aspirin|paracetamol|tylenol|advil|motrin)\b',
            r'\b(?:antibiotics|penicillin|amoxicillin|cephalexin|azithromycin)\b'
        ]
        
        body_part_patterns = [
            r'\b(?:head|neck|chest|back|stomach|abdomen|arm|leg|hand|foot|eye|ear|nose|throat)\b',
            r'\b(?:heart|lung|liver|kidney|brain|spine|joint|muscle|bone)\b'
        ]
        
        dosage_patterns = [
            r'\b\d+\s*(?:mg|ml|g|tablets?|capsules?|drops?)\b',
            r'\b(?:once|twice|thrice)\s+(?:daily|a day|per day)\b'
        ]
        
        # Extract entities using patterns
        for pattern in disease_patterns:
            matches = re.findall(pattern, text, re.IGNORECASE)
            medical_entities['diseases'].extend(matches)
        
        for pattern in symptom_patterns:
            matches = re.findall(pattern, text, re.IGNORECASE)
            medical_entities['symptoms'].extend(matches)
        
        for pattern in medication_patterns:
            matches = re.findall(pattern, text, re.IGNORECASE)
            medical_entities['medications'].extend(matches)
        
        for pattern in body_part_patterns:
            matches = re.findall(pattern, text, re.IGNORECASE)
            medical_entities['body_parts'].extend(matches)
        
        for pattern in dosage_patterns:
            matches = re.findall(pattern, text, re.IGNORECASE)
            medical_entities['dosages'].extend(matches)
        
        # Remove duplicates and empty entries
        for key in medical_entities:
            medical_entities[key] = list(set([entity.lower() for entity in medical_entities[key] if entity.strip()]))
        
        return medical_entities
    
    def _fallback_ner(self, text):
        """Fallback NER using NLTK when spaCy is not available"""
        tokens = word_tokenize(text)
        pos_tags = pos_tag(tokens)
        chunks = ne_chunk(pos_tags)
        
        entities = {
            'diseases': [],
            'symptoms': [],
            'medications': [],
            'body_parts': [],
            'medical_procedures': [],
            'dosages': [],
            'time_periods': []
        }
        
        # Simple pattern-based extraction
        medical_keywords = {
            'diseases': ['fever', 'headache', 'cough', 'cold', 'flu', 'diabetes', 'hypertension'],
            'symptoms': ['pain', 'ache', 'swelling', 'nausea', 'vomiting', 'fatigue'],
            'medications': ['acetaminophen', 'ibuprofen', 'aspirin', 'tylenol', 'advil'],
            'body_parts': ['head', 'chest', 'stomach', 'back', 'arm', 'leg', 'throat']
        }
        
        text_lower = text.lower()
        for category, keywords in medical_keywords.items():
            for keyword in keywords:
                if keyword in text_lower:
                    entities[category].append(keyword)
        
        return entities
    
    def analyze_sentiment(self, text):
        """
        Sentiment Analysis for Patient Emotional State
        Returns: emotional state, confidence, medical urgency
        """
        # VADER sentiment analysis
        vader_scores = self.sia.polarity_scores(text)
        
        # Medical sentiment analysis
        medical_sentiment = self._analyze_medical_sentiment(text)
        
        # Determine emotional state
        if vader_scores['compound'] >= 0.05:
            emotional_state = "positive"
        elif vader_scores['compound'] <= -0.05:
            emotional_state = "negative"
        else:
            emotional_state = "neutral"
        
        # Medical urgency based on keywords
        urgency_keywords = {
            'high': ['severe', 'emergency', 'urgent', 'critical', 'immediate', 'serious'],
            'medium': ['moderate', 'persistent', 'worsening', 'concerning'],
            'low': ['mild', 'slight', 'minor', 'occasional']
        }
        
        urgency_level = "low"
        text_lower = text.lower()
        for level, keywords in urgency_keywords.items():
            if any(keyword in text_lower for keyword in keywords):
                urgency_level = level
                break
        
        return {
            'emotional_state': emotional_state,
            'confidence': abs(vader_scores['compound']),
            'urgency_level': urgency_level,
            'vader_scores': vader_scores,
            'medical_sentiment': medical_sentiment
        }
    
    def _analyze_medical_sentiment(self, text):
        """Analyze medical-specific sentiment"""
        medical_positive = ['better', 'improved', 'recovering', 'healing', 'well', 'good']
        medical_negative = ['worse', 'deteriorating', 'severe', 'painful', 'uncomfortable', 'sick']
        
        text_lower = text.lower()
        positive_count = sum(1 for word in medical_positive if word in text_lower)
        negative_count = sum(1 for word in medical_negative if word in text_lower)
        
        if positive_count > negative_count:
            return "positive_medical"
        elif negative_count > positive_count:
            return "negative_medical"
        else:
            return "neutral_medical"
    
    def extract_topics(self, texts, n_topics=5):
        """
        Topic Modeling using LDA
        Extracts medical topics from conversation data
        """
        # Preprocess texts
        processed_texts = [self._preprocess_for_topic_modeling(text) for text in texts]
        
        # Create TF-IDF matrix
        vectorizer = TfidfVectorizer(
            max_features=1000,
            stop_words='english',
            ngram_range=(1, 2),
            min_df=2,
            max_df=0.95
        )
        
        tfidf_matrix = vectorizer.fit_transform(processed_texts)
        
        # Apply LDA
        lda = LatentDirichletAllocation(
            n_components=n_topics,
            random_state=42,
            max_iter=10
        )
        
        lda.fit(tfidf_matrix)
        
        # Get topic names
        feature_names = vectorizer.get_feature_names_out()
        topics = []
        
        for topic_idx, topic in enumerate(lda.components_):
            top_words_idx = topic.argsort()[-10:][::-1]
            top_words = [feature_names[i] for i in top_words_idx]
            topics.append({
                'topic_id': topic_idx,
                'top_words': top_words,
                'topic_name': self._generate_topic_name(top_words)
            })
        
        self.lda_model = lda
        self.topic_names = {i: topics[i]['topic_name'] for i in range(n_topics)}
        
        return topics
    
    def _preprocess_for_topic_modeling(self, text):
        """Preprocess text for topic modeling"""
        if pd.isna(text) or text == '':
            return ''
        
        # Convert to lowercase
        text = str(text).lower()
        
        # Remove special characters
        text = re.sub(r'[^a-zA-Z\s]', '', text)
        
        # Remove extra whitespaces
        text = re.sub(r'\s+', ' ', text).strip()
        
        # Tokenize and lemmatize
        tokens = word_tokenize(text)
        tokens = [self.lemmatizer.lemmatize(token) for token in tokens 
                 if token not in self.stop_words and len(token) > 2]
        
        return ' '.join(tokens)
    
    def _generate_topic_name(self, top_words):
        """Generate meaningful topic names"""
        medical_topics = {
            'fever': ['fever', 'temperature', 'hot', 'chills'],
            'headache': ['headache', 'head', 'pain', 'migraine'],
            'respiratory': ['cough', 'breathing', 'chest', 'lung'],
            'digestive': ['stomach', 'nausea', 'vomiting', 'diarrhea'],
            'pain': ['pain', 'ache', 'sore', 'hurt']
        }
        
        for topic_name, keywords in medical_topics.items():
            if any(keyword in top_words for keyword in keywords):
                return topic_name
        
        return f"topic_{top_words[0]}"
    
    def train_word_embeddings(self, texts, model_type='word2vec'):
        """
        Train Word Embeddings (Word2Vec, FastText, GloVe)
        """
        # Preprocess texts
        processed_texts = [self._preprocess_for_embeddings(text) for text in texts]
        
        if model_type == 'word2vec':
            self.word2vec_model = Word2Vec(
                sentences=processed_texts,
                vector_size=100,
                window=5,
                min_count=2,
                workers=4,
                epochs=10
            )
            return self.word2vec_model
        
        elif model_type == 'fasttext':
            self.fasttext_model = FastText(
                sentences=processed_texts,
                vector_size=100,
                window=5,
                min_count=2,
                workers=4,
                epochs=10
            )
            return self.fasttext_model
    
    def _preprocess_for_embeddings(self, text):
        """Preprocess text for word embeddings"""
        if pd.isna(text) or text == '':
            return []
        
        # Convert to lowercase
        text = str(text).lower()
        
        # Remove special characters
        text = re.sub(r'[^a-zA-Z\s]', '', text)
        
        # Tokenize
        tokens = word_tokenize(text)
        tokens = [token for token in tokens 
                 if token not in self.stop_words and len(token) > 2]
        
        return tokens
    
    def get_similar_words(self, word, model_type='word2vec', topn=5):
        """Get similar words using word embeddings"""
        if model_type == 'word2vec' and self.word2vec_model:
            try:
                return self.word2vec_model.wv.most_similar(word, topn=topn)
            except KeyError:
                return []
        elif model_type == 'fasttext' and self.fasttext_model:
            try:
                return self.fasttext_model.wv.most_similar(word, topn=topn)
            except KeyError:
                return []
        return []
    
    def analyze_medical_conversation(self, text):
        """
        Comprehensive medical conversation analysis
        Combines all NLP techniques
        """
        # Extract medical entities
        entities = self.extract_medical_entities(text)
        
        # Analyze sentiment
        sentiment = self.analyze_sentiment(text)
        
        # Get topic if LDA model is trained
        topic = None
        if self.lda_model:
            processed_text = self._preprocess_for_topic_modeling(text)
            # This would require the original vectorizer used in topic modeling
            # For now, we'll return a simple topic analysis
            topic = self._simple_topic_analysis(text)
        
        return {
            'entities': entities,
            'sentiment': sentiment,
            'topic': topic,
            'medical_keywords': self._extract_medical_keywords(text),
            'urgency_score': self._calculate_urgency_score(text, entities, sentiment)
        }
    
    def _simple_topic_analysis(self, text):
        """Simple topic analysis without LDA"""
        topics = {
            'fever': ['fever', 'temperature', 'hot', 'chills'],
            'headache': ['headache', 'head', 'pain', 'migraine'],
            'respiratory': ['cough', 'breathing', 'chest', 'lung'],
            'digestive': ['stomach', 'nausea', 'vomiting', 'diarrhea'],
            'pain': ['pain', 'ache', 'sore', 'hurt']
        }
        
        text_lower = text.lower()
        for topic_name, keywords in topics.items():
            if any(keyword in text_lower for keyword in keywords):
                return topic_name
        
        return 'general_medical'
    
    def _extract_medical_keywords(self, text):
        """Extract medical keywords from text"""
        medical_keywords = [
            'fever', 'headache', 'cough', 'pain', 'ache', 'sore', 'swelling',
            'nausea', 'vomiting', 'diarrhea', 'constipation', 'fatigue',
            'tiredness', 'weakness', 'dizziness', 'numbness', 'tingling',
            'breathing', 'chest', 'stomach', 'head', 'back', 'arm', 'leg'
        ]
        
        text_lower = text.lower()
        found_keywords = [keyword for keyword in medical_keywords if keyword in text_lower]
        return found_keywords
    
    def _calculate_urgency_score(self, text, entities, sentiment):
        """Calculate medical urgency score"""
        urgency_score = 0
        
        # Base score from sentiment
        if sentiment['urgency_level'] == 'high':
            urgency_score += 3
        elif sentiment['urgency_level'] == 'medium':
            urgency_score += 2
        else:
            urgency_score += 1
        
        # Add score based on entities
        if entities['diseases']:
            urgency_score += 1
        if entities['symptoms']:
            urgency_score += len(entities['symptoms']) * 0.5
        
        # Add score based on medical keywords
        urgent_keywords = ['severe', 'emergency', 'urgent', 'critical', 'immediate']
        text_lower = text.lower()
        for keyword in urgent_keywords:
            if keyword in text_lower:
                urgency_score += 2
        
        return min(urgency_score, 10)  # Cap at 10
    
    def save_models(self, save_dir="advanced_nlp_models"):
        """Save trained models"""
        os.makedirs(save_dir, exist_ok=True)
        
        if self.word2vec_model:
            self.word2vec_model.save(f"{save_dir}/word2vec.model")
        
        if self.fasttext_model:
            self.fasttext_model.save(f"{save_dir}/fasttext.model")
        
        if self.lda_model:
            with open(f"{save_dir}/lda_model.pkl", 'wb') as f:
                pickle.dump(self.lda_model, f)
        
        with open(f"{save_dir}/topic_names.pkl", 'wb') as f:
            pickle.dump(self.topic_names, f)
        
        print(f"Models saved to {save_dir}")
    
    def load_models(self, save_dir="advanced_nlp_models"):
        """Load trained models"""
        if os.path.exists(f"{save_dir}/word2vec.model"):
            self.word2vec_model = Word2Vec.load(f"{save_dir}/word2vec.model")
        
        if os.path.exists(f"{save_dir}/fasttext.model"):
            self.fasttext_model = FastText.load(f"{save_dir}/fasttext.model")
        
        if os.path.exists(f"{save_dir}/lda_model.pkl"):
            with open(f"{save_dir}/lda_model.pkl", 'rb') as f:
                self.lda_model = pickle.load(f)
        
        if os.path.exists(f"{save_dir}/topic_names.pkl"):
            with open(f"{save_dir}/topic_names.pkl", 'rb') as f:
                self.topic_names = pickle.load(f)
        
        print(f"Models loaded from {save_dir}")

# Example usage and testing
if __name__ == "__main__":
    import sys
    import json
    
    # Initialize advanced NLP processor
    nlp_processor = AdvancedNLPProcessor()
    
    # Check if text is provided as command line argument
    if len(sys.argv) > 2 and sys.argv[1] == '--text':
        sample_text = sys.argv[2]
    else:
        # Test with sample medical text
        sample_text = "I have a severe headache and fever. The pain is getting worse and I feel nauseous. I took acetaminophen 500mg but it's not helping much."
    
    # Perform comprehensive analysis
    analysis = nlp_processor.analyze_medical_conversation(sample_text)
    
    # Output as JSON for server integration
    print(json.dumps(analysis, indent=2))

import pandas as pd
import numpy as np
import pickle
import os
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.svm import SVC
from sklearn.linear_model import LogisticRegression
from sklearn.naive_bayes import MultinomialNB
from sklearn.metrics import classification_report, confusion_matrix, accuracy_score
from sklearn.model_selection import cross_val_score
import matplotlib.pyplot as plt
import seaborn as sns
from transformers import AutoTokenizer, AutoModelForSequenceClassification, TrainingArguments, Trainer
from transformers import AutoModelForCausalLM, AutoTokenizer
import torch
from torch.utils.data import Dataset
import warnings
warnings.filterwarnings('ignore')

class MedicalChatbotTrainer:
    def __init__(self, data_dir="preprocessed_data"):
        self.data_dir = data_dir
        self.models = {}
        self.results = {}
        
    def load_preprocessed_data(self):
        """Load preprocessed data"""
        print("Loading preprocessed data...")
        
        with open(f"{self.data_dir}/X_train.pkl", 'rb') as f:
            self.X_train = pickle.load(f)
        
        with open(f"{self.data_dir}/X_test.pkl", 'rb') as f:
            self.X_test = pickle.load(f)
        
        with open(f"{self.data_dir}/y_train.pkl", 'rb') as f:
            self.y_train = pickle.load(f)
        
        with open(f"{self.data_dir}/y_test.pkl", 'rb') as f:
            self.y_test = pickle.load(f)
        
        with open(f"{self.data_dir}/tfidf_vectorizer.pkl", 'rb') as f:
            self.vectorizer = pickle.load(f)
        
        self.response_data = pd.read_csv(f"{self.data_dir}/response_data.csv")
        
        with open(f"{self.data_dir}/intent_labels.pkl", 'rb') as f:
            self.intent_labels = pickle.load(f)
        
        print(f"Loaded {self.X_train.shape[0]} training samples and {self.X_test.shape[0]} test samples")
        print(f"Intent categories: {self.intent_labels}")
    
    def train_classical_models(self):
        """Train classical ML models for intent classification"""
        print("\n=== Training Classical ML Models ===")
        
        models = {
            'Random Forest': RandomForestClassifier(n_estimators=100, random_state=42),
            'Gradient Boosting': GradientBoostingClassifier(n_estimators=100, random_state=42),
            'SVM': SVC(kernel='linear', random_state=42),
            'Logistic Regression': LogisticRegression(random_state=42, max_iter=1000),
            'Naive Bayes': MultinomialNB()
        }
        
        for name, model in models.items():
            print(f"\nTraining {name}...")
            
            # Train model
            model.fit(self.X_train, self.y_train)
            
            # Predictions
            y_pred = model.predict(self.X_test)
            
            # Calculate metrics
            accuracy = accuracy_score(self.y_test, y_pred)
            
            # Cross-validation score
            cv_scores = cross_val_score(model, self.X_train, self.y_train, cv=5)
            
            # Store results
            self.models[name] = model
            self.results[name] = {
                'accuracy': accuracy,
                'cv_mean': cv_scores.mean(),
                'cv_std': cv_scores.std(),
                'predictions': y_pred,
                'classification_report': classification_report(self.y_test, y_pred, output_dict=True)
            }
            
            print(f"{name} - Accuracy: {accuracy:.4f}, CV Score: {cv_scores.mean():.4f} (+/- {cv_scores.std()*2:.4f})")
    
    def train_bert_model(self, epochs=3):
        """Train BERT model for intent classification"""
        print(f"\n=== Training BERT Model ({epochs} epochs) ===")
        
        try:
            # Load tokenizer and model
            model_name = "bert-base-uncased"
            tokenizer = AutoTokenizer.from_pretrained(model_name)
            model = AutoModelForSequenceClassification.from_pretrained(
                model_name, 
                num_labels=len(self.intent_labels)
            )
            
            # Create label mapping
            label2id = {label: idx for idx, label in enumerate(self.intent_labels)}
            id2label = {idx: label for label, idx in label2id.items()}
            
            # Prepare data for BERT
            train_texts = self.response_data['Patient_cleaned'].iloc[:len(self.y_train)].tolist()
            train_labels = [label2id[label] for label in self.y_train]
            
            test_texts = self.response_data['Patient_cleaned'].iloc[len(self.y_train):len(self.y_train)+len(self.y_test)].tolist()
            test_labels = [label2id[label] for label in self.y_test]
            
            # Tokenize
            train_encodings = tokenizer(train_texts, truncation=True, padding=True, max_length=512)
            test_encodings = tokenizer(test_texts, truncation=True, padding=True, max_length=512)
            
            # Create dataset class
            class MedicalDataset(Dataset):
                def __init__(self, encodings, labels):
                    self.encodings = encodings
                    self.labels = labels
                
                def __getitem__(self, idx):
                    item = {key: torch.tensor(val[idx]) for key, val in self.encodings.items()}
                    item['labels'] = torch.tensor(self.labels[idx])
                    return item
                
                def __len__(self):
                    return len(self.labels)
            
            train_dataset = MedicalDataset(train_encodings, train_labels)
            test_dataset = MedicalDataset(test_encodings, test_labels)
            
            # Training arguments
            training_args = TrainingArguments(
                output_dir='./bert_results',
                num_train_epochs=epochs,
                per_device_train_batch_size=16,
                per_device_eval_batch_size=16,
                warmup_steps=500,
                weight_decay=0.01,
                logging_dir='./logs',
                logging_steps=100,
                evaluation_strategy="epoch",
                save_strategy="epoch",
                load_best_model_at_end=True,
            )
            
            # Trainer
            trainer = Trainer(
                model=model,
                args=training_args,
                train_dataset=train_dataset,
                eval_dataset=test_dataset,
                tokenizer=tokenizer,
            )
            
            # Train
            trainer.train()
            
            # Evaluate
            eval_results = trainer.evaluate()
            
            # Predictions
            predictions = trainer.predict(test_dataset)
            y_pred_bert = [id2label[pred] for pred in predictions.predictions.argmax(axis=1)]
            
            # Calculate accuracy
            accuracy = accuracy_score(self.y_test, y_pred_bert)
            
            # Store results
            self.models['BERT'] = {
                'model': model,
                'tokenizer': tokenizer,
                'label2id': label2id,
                'id2label': id2label
            }
            self.results['BERT'] = {
                'accuracy': accuracy,
                'eval_loss': eval_results['eval_loss'],
                'predictions': y_pred_bert,
                'classification_report': classification_report(self.y_test, y_pred_bert, output_dict=True)
            }
            
            print(f"BERT - Accuracy: {accuracy:.4f}, Eval Loss: {eval_results['eval_loss']:.4f}")
            
        except Exception as e:
            print(f"BERT training failed: {e}")
            print("Continuing with classical models...")
    
    def generate_responses(self, model_name='Random Forest'):
        """Generate responses using trained models"""
        print(f"\n=== Response Generation using {model_name} ===")
        
        if model_name in self.models:
            model = self.models[model_name]
            
            # Sample some test cases
            sample_indices = np.random.choice(len(self.X_test), 5, replace=False)
            
            for idx in sample_indices:
                # Get original text
                original_text = self.response_data['Patient_cleaned'].iloc[len(self.y_train) + idx]
                
                # Predict intent
                if model_name == 'BERT':
                    # BERT prediction
                    inputs = model['tokenizer'](original_text, return_tensors="pt", truncation=True, padding=True, max_length=512)
                    with torch.no_grad():
                        outputs = model['model'](**inputs)
                        predicted_id = outputs.logits.argmax().item()
                        predicted_intent = model['id2label'][predicted_id]
                else:
                    # Classical model prediction
                    text_vector = self.vectorizer.transform([original_text])
                    predicted_intent = model.predict(text_vector)[0]
                
                # Get actual response
                actual_response = self.response_data['Doctor_cleaned'].iloc[len(self.y_train) + idx]
                
                print(f"\nPatient: {original_text[:100]}...")
                print(f"Predicted Intent: {predicted_intent}")
                print(f"Doctor Response: {actual_response[:100]}...")
    
    def create_visualizations(self):
        """Create visualization of results"""
        print("\n=== Creating Visualizations ===")
        
        # Accuracy comparison
        model_names = list(self.results.keys())
        accuracies = [self.results[name]['accuracy'] for name in model_names]
        
        plt.figure(figsize=(12, 8))
        
        # Accuracy bar plot
        plt.subplot(2, 2, 1)
        bars = plt.bar(model_names, accuracies, color=['skyblue', 'lightgreen', 'lightcoral', 'lightyellow', 'lightpink'])
        plt.title('Model Accuracy Comparison')
        plt.ylabel('Accuracy')
        plt.xticks(rotation=45)
        
        # Add value labels on bars
        for bar, acc in zip(bars, accuracies):
            plt.text(bar.get_x() + bar.get_width()/2, bar.get_height() + 0.01, 
                    f'{acc:.3f}', ha='center', va='bottom')
        
        # Confusion matrix for best model
        best_model = max(self.results.keys(), key=lambda x: self.results[x]['accuracy'])
        y_pred = self.results[best_model]['predictions']
        
        plt.subplot(2, 2, 2)
        cm = confusion_matrix(self.y_test, y_pred)
        sns.heatmap(cm, annot=True, fmt='d', cmap='Blues', 
                   xticklabels=self.intent_labels, yticklabels=self.intent_labels)
        plt.title(f'Confusion Matrix - {best_model}')
        plt.xlabel('Predicted')
        plt.ylabel('Actual')
        
        # CV Scores comparison
        plt.subplot(2, 2, 3)
        cv_means = [self.results[name].get('cv_mean', 0) for name in model_names if 'cv_mean' in self.results[name]]
        cv_stds = [self.results[name].get('cv_std', 0) for name in model_names if 'cv_std' in self.results[name]]
        cv_model_names = [name for name in model_names if 'cv_mean' in self.results[name]]
        
        if cv_means:
            plt.bar(cv_model_names, cv_means, yerr=cv_stds, capsize=5, color='lightgreen')
            plt.title('Cross-Validation Scores')
            plt.ylabel('CV Score')
            plt.xticks(rotation=45)
        
        # Intent distribution
        plt.subplot(2, 2, 4)
        intent_counts = pd.Series(self.y_test).value_counts()
        plt.pie(intent_counts.values, labels=intent_counts.index, autopct='%1.1f%%')
        plt.title('Test Set Intent Distribution')
        
        plt.tight_layout()
        plt.savefig('model_results.png', dpi=300, bbox_inches='tight')
        plt.show()
        
        print(f"Visualizations saved as 'model_results.png'")
    
    def save_models(self, output_dir="trained_models"):
        """Save trained models"""
        print(f"\n=== Saving Models to {output_dir} ===")
        
        os.makedirs(output_dir, exist_ok=True)
        
        for name, model in self.models.items():
            if name == 'BERT':
                # Save BERT model components
                model['model'].save_pretrained(f"{output_dir}/bert_model")
                model['tokenizer'].save_pretrained(f"{output_dir}/bert_tokenizer")
                with open(f"{output_dir}/bert_labels.pkl", 'wb') as f:
                    pickle.dump({'label2id': model['label2id'], 'id2label': model['id2label']}, f)
            else:
                # Save classical models
                with open(f"{output_dir}/{name.lower().replace(' ', '_')}.pkl", 'wb') as f:
                    pickle.dump(model, f)
        
        # Save vectorizer
        with open(f"{output_dir}/tfidf_vectorizer.pkl", 'wb') as f:
            pickle.dump(self.vectorizer, f)
        
        # Save results
        with open(f"{output_dir}/training_results.pkl", 'wb') as f:
            pickle.dump(self.results, f)
        
        print(f"All models saved to {output_dir}")
    
    def print_detailed_results(self):
        """Print detailed results"""
        print("\n" + "="*60)
        print("DETAILED TRAINING RESULTS")
        print("="*60)
        
        for model_name, result in self.results.items():
            print(f"\n{model_name.upper()}:")
            print(f"  Accuracy: {result['accuracy']:.4f}")
            
            if 'cv_mean' in result:
                print(f"  CV Score: {result['cv_mean']:.4f} (+/- {result['cv_std']*2:.4f})")
            
            if 'eval_loss' in result:
                print(f"  Eval Loss: {result['eval_loss']:.4f}")
            
            # Classification report
            report = result['classification_report']
            print(f"  Precision: {report['macro avg']['precision']:.4f}")
            print(f"  Recall: {report['macro avg']['recall']:.4f}")
            print(f"  F1-Score: {report['macro avg']['f1-score']:.4f}")
        
        # Best model
        best_model = max(self.results.keys(), key=lambda x: self.results[x]['accuracy'])
        print(f"\n🏆 BEST MODEL: {best_model} with accuracy {self.results[best_model]['accuracy']:.4f}")

def main():
    """Main training function"""
    print("🚀 Starting Medical Chatbot Training...")
    
    # Initialize trainer
    trainer = MedicalChatbotTrainer()
    
    # Load data
    trainer.load_preprocessed_data()
    
    # Train classical models
    trainer.train_classical_models()
    
    # Train BERT model (with more epochs for better results)
    trainer.train_bert_model(epochs=5)
    
    # Generate sample responses
    trainer.generate_responses('Random Forest')
    
    # Create visualizations
    trainer.create_visualizations()
    
    # Print detailed results
    trainer.print_detailed_results()
    
    # Save models
    trainer.save_models()
    
    print("\n✅ Training completed successfully!")
    print("📊 Check 'model_results.png' for visualizations")
    print("💾 Models saved in 'trained_models' directory")

if __name__ == "__main__":
    main()

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
import warnings
warnings.filterwarnings('ignore')

class SimpleMedicalTrainer:
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
    
    def train_models(self):
        """Train classical ML models for intent classification"""
        print("\n=== Training Classical ML Models ===")
        
        models = {
            'Random Forest': RandomForestClassifier(n_estimators=200, random_state=42, max_depth=20),
            'Gradient Boosting': GradientBoostingClassifier(n_estimators=200, random_state=42, max_depth=10),
            'SVM': SVC(kernel='linear', random_state=42, probability=True),
            'Logistic Regression': LogisticRegression(random_state=42, max_iter=2000, C=1.0),
            'Naive Bayes': MultinomialNB(alpha=0.1)
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
    
    def create_visualizations(self):
        """Create visualization of results"""
        print("\n=== Creating Visualizations ===")
        
        # Accuracy comparison
        model_names = list(self.results.keys())
        accuracies = [self.results[name]['accuracy'] for name in model_names]
        
        plt.figure(figsize=(15, 10))
        
        # Accuracy bar plot
        plt.subplot(2, 2, 1)
        bars = plt.bar(model_names, accuracies, color=['skyblue', 'lightgreen', 'lightcoral', 'lightyellow', 'lightpink'])
        plt.title('Model Accuracy Comparison', fontsize=14, fontweight='bold')
        plt.ylabel('Accuracy', fontsize=12)
        plt.xticks(rotation=45)
        plt.ylim(0, 1)
        
        # Add value labels on bars
        for bar, acc in zip(bars, accuracies):
            plt.text(bar.get_x() + bar.get_width()/2, bar.get_height() + 0.01, 
                    f'{acc:.3f}', ha='center', va='bottom', fontweight='bold')
        
        # Confusion matrix for best model
        best_model = max(self.results.keys(), key=lambda x: self.results[x]['accuracy'])
        y_pred = self.results[best_model]['predictions']
        
        plt.subplot(2, 2, 2)
        cm = confusion_matrix(self.y_test, y_pred)
        sns.heatmap(cm, annot=True, fmt='d', cmap='Blues', 
                   xticklabels=self.intent_labels, yticklabels=self.intent_labels)
        plt.title(f'Confusion Matrix - {best_model}', fontsize=14, fontweight='bold')
        plt.xlabel('Predicted', fontsize=12)
        plt.ylabel('Actual', fontsize=12)
        
        # CV Scores comparison
        plt.subplot(2, 2, 3)
        cv_means = [self.results[name].get('cv_mean', 0) for name in model_names if 'cv_mean' in self.results[name]]
        cv_stds = [self.results[name].get('cv_std', 0) for name in model_names if 'cv_std' in self.results[name]]
        cv_model_names = [name for name in model_names if 'cv_mean' in self.results[name]]
        
        if cv_means:
            bars = plt.bar(cv_model_names, cv_means, yerr=cv_stds, capsize=5, color='lightgreen')
            plt.title('Cross-Validation Scores', fontsize=14, fontweight='bold')
            plt.ylabel('CV Score', fontsize=12)
            plt.xticks(rotation=45)
            plt.ylim(0, 1)
            
            # Add value labels
            for bar, mean, std in zip(bars, cv_means, cv_stds):
                plt.text(bar.get_x() + bar.get_width()/2, bar.get_height() + 0.01, 
                        f'{mean:.3f}±{std:.3f}', ha='center', va='bottom', fontweight='bold')
        
        # Intent distribution
        plt.subplot(2, 2, 4)
        intent_counts = pd.Series(self.y_test).value_counts()
        colors = plt.cm.Set3(np.linspace(0, 1, len(intent_counts)))
        wedges, texts, autotexts = plt.pie(intent_counts.values, labels=intent_counts.index, 
                                          autopct='%1.1f%%', colors=colors, startangle=90)
        plt.title('Test Set Intent Distribution', fontsize=14, fontweight='bold')
        
        # Make percentage text bold
        for autotext in autotexts:
            autotext.set_fontweight('bold')
        
        plt.tight_layout()
        plt.savefig('model_results.png', dpi=300, bbox_inches='tight')
        plt.show()
        
        print(f"Visualizations saved as 'model_results.png'")
    
    def save_models(self, output_dir="trained_models"):
        """Save trained models"""
        print(f"\n=== Saving Models to {output_dir} ===")
        
        os.makedirs(output_dir, exist_ok=True)
        
        for name, model in self.models.items():
            with open(f"{output_dir}/{name.lower().replace(' ', '_')}.pkl", 'wb') as f:
                pickle.dump(model, f)
            print(f"✅ Saved {name}")
        
        # Save vectorizer
        with open(f"{output_dir}/tfidf_vectorizer.pkl", 'wb') as f:
            pickle.dump(self.vectorizer, f)
        print("✅ Saved TF-IDF vectorizer")
        
        # Save results
        with open(f"{output_dir}/training_results.pkl", 'wb') as f:
            pickle.dump(self.results, f)
        print("✅ Saved training results")
        
        print(f"\nAll models saved to {output_dir}")
    
    def print_detailed_results(self):
        """Print detailed results"""
        print("\n" + "="*80)
        print("🏥 MEDICAL CHATBOT TRAINING RESULTS")
        print("="*80)
        
        for model_name, result in self.results.items():
            print(f"\n📊 {model_name.upper()}:")
            print(f"   🎯 Accuracy: {result['accuracy']:.4f} ({result['accuracy']*100:.2f}%)")
            print(f"   📈 CV Score: {result['cv_mean']:.4f} ± {result['cv_std']:.4f}")
            
            # Classification report
            report = result['classification_report']
            print(f"   📋 Precision: {report['macro avg']['precision']:.4f}")
            print(f"   📋 Recall: {report['macro avg']['recall']:.4f}")
            print(f"   📋 F1-Score: {report['macro avg']['f1-score']:.4f}")
        
        # Best model
        best_model = max(self.results.keys(), key=lambda x: self.results[x]['accuracy'])
        best_accuracy = self.results[best_model]['accuracy']
        print(f"\n🏆 BEST MODEL: {best_model}")
        print(f"   🎯 Accuracy: {best_accuracy:.4f} ({best_accuracy*100:.2f}%)")
        print(f"   📊 This model correctly classifies {best_accuracy*100:.1f}% of medical intents!")
        
        # Performance analysis
        print(f"\n📈 PERFORMANCE ANALYSIS:")
        accuracies = [result['accuracy'] for result in self.results.values()]
        avg_accuracy = np.mean(accuracies)
        std_accuracy = np.std(accuracies)
        print(f"   📊 Average Accuracy: {avg_accuracy:.4f} ({avg_accuracy*100:.2f}%)")
        print(f"   📊 Standard Deviation: {std_accuracy:.4f}")
        print(f"   📊 Models above 80% accuracy: {sum(1 for acc in accuracies if acc > 0.8)}/{len(accuracies)}")
        
        # Intent analysis
        print(f"\n🏷️  INTENT CATEGORIES:")
        for i, intent in enumerate(self.intent_labels, 1):
            print(f"   {i}. {intent.replace('_', ' ').title()}")

def main():
    """Main training function"""
    print("🏥 Starting Medical Chatbot Training (Classical ML Models)...")
    print("="*60)
    
    # Initialize trainer
    trainer = SimpleMedicalTrainer()
    
    # Load data
    trainer.load_preprocessed_data()
    
    # Train models
    trainer.train_models()
    
    # Create visualizations
    trainer.create_visualizations()
    
    # Print detailed results
    trainer.print_detailed_results()
    
    # Save models
    trainer.save_models()
    
    print("\n✅ Training completed successfully!")
    print("📊 Check 'model_results.png' for visualizations")
    print("💾 Models saved in 'trained_models' directory")
    print("\n🚀 Ready to integrate with your medical chatbot!")

if __name__ == "__main__":
    main()

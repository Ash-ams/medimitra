#!/usr/bin/env python3
"""
Medical Chatbot Training Script
Trains multiple ML models on medical conversation data
"""

import os
import sys
import argparse
from data_preprocessing import MedicalDataPreprocessor
from model_training import MedicalChatbotTrainer

def main():
    parser = argparse.ArgumentParser(description='Train Medical Chatbot Models')
    parser.add_argument('--csv_path', type=str, default='../../ai-medical-chatbot.csv',
                       help='Path to the medical chatbot CSV file')
    parser.add_argument('--sample_size', type=int, default=50000,
                       help='Number of samples to use for training (default: 50000)')
    parser.add_argument('--epochs', type=int, default=5,
                       help='Number of epochs for BERT training (default: 5)')
    parser.add_argument('--skip_preprocessing', action='store_true',
                       help='Skip data preprocessing if already done')
    
    args = parser.parse_args()
    
    print("🏥 Medical Chatbot Training Pipeline")
    print("="*50)
    
    # Step 1: Data Preprocessing
    if not args.skip_preprocessing:
        print("\n📊 Step 1: Data Preprocessing")
        preprocessor = MedicalDataPreprocessor()
        
        # Load and preprocess data
        df = preprocessor.load_and_preprocess_data(args.csv_path, args.sample_size)
        
        # Prepare training data
        training_data = preprocessor.prepare_training_data(df)
        
        # Save preprocessed data
        preprocessor.save_preprocessed_data(training_data, "preprocessed_data")
        print("✅ Data preprocessing completed!")
    else:
        print("⏭️  Skipping data preprocessing...")
    
    # Step 2: Model Training
    print("\n🤖 Step 2: Model Training")
    trainer = MedicalChatbotTrainer()
    
    # Load preprocessed data
    trainer.load_preprocessed_data()
    
    # Train classical models
    trainer.train_classical_models()
    
    # Train BERT model
    trainer.train_bert_model(epochs=args.epochs)
    
    # Generate sample responses
    trainer.generate_responses('Random Forest')
    
    # Create visualizations
    trainer.create_visualizations()
    
    # Print detailed results
    trainer.print_detailed_results()
    
    # Save models
    trainer.save_models()
    
    print("\n🎉 Training Pipeline Completed Successfully!")
    print("\n📈 Results Summary:")
    for model_name, result in trainer.results.items():
        print(f"  {model_name}: {result['accuracy']:.4f} accuracy")
    
    best_model = max(trainer.results.keys(), key=lambda x: trainer.results[x]['accuracy'])
    print(f"\n🏆 Best Model: {best_model} ({trainer.results[best_model]['accuracy']:.4f} accuracy)")

if __name__ == "__main__":
    main()

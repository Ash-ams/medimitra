#!/bin/bash

echo "🏥 Medical Chatbot ML Training Pipeline"
echo "========================================"

# Check if Python 3 is available
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is required but not installed."
    exit 1
fi

# Check if pip is available
if ! command -v pip3 &> /dev/null; then
    echo "❌ pip3 is required but not installed."
    exit 1
fi

echo "📦 Installing Python dependencies..."
pip3 install -r requirements.txt

echo "🔧 Setting up NLTK data..."
python3 -c "import nltk; nltk.download('punkt', quiet=True); nltk.download('stopwords', quiet=True); nltk.download('wordnet', quiet=True); nltk.download('omw-1.4', quiet=True)"

echo "📊 Starting data preprocessing..."
python3 data_preprocessing.py

echo "🤖 Starting model training..."
python3 train.py --epochs 5 --sample_size 50000

echo "✅ Training completed!"
echo "📈 Check the results in:"
echo "   - model_results.png (visualizations)"
echo "   - trained_models/ (saved models)"
echo "   - preprocessed_data/ (processed data)"

echo ""
echo "🚀 To test the models, run:"
echo "   python3 model_inference.py"

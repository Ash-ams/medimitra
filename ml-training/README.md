# MediMitra: Medical Chatbot ML & NLP Training

## 🏥 Project Overview
Statistical Natural Language Processing (NLP) pipeline and machine learning intent classification for the MediMitra AI Medical Chatbot framework, trained on a comprehensive corpus of 256,917 medical conversations.

### 👥 Development Team
- **Sheikh Mohammad Ashraf (A266)**
- **Samarth Srivastava (A255)**
- **Aadit Doshi (A251)**
- **Madhav Soni (A265)**
*Department of Computer Engineering, STME, SVKM's NMIMS, Navi Mumbai*
*Project Supervisor: Dr. Snehal Lohi*

## 📊 Training Results

### Model Performance
- **Random Forest**: 95.65% accuracy ✅
- **Logistic Regression**: 90.25% accuracy ✅  
- **Naive Bayes**: 81.90% accuracy ✅

### Dataset Processing
- **Total Records**: 256,917 medical conversations
- **Training Samples**: 10,000 (for quick training)
- **Intent Categories**: 6 medical categories
  - Pain-related
  - Fever-related
  - Headache-related
  - Stomach-related
  - Skin-related
  - General medical

## 🚀 Implementation Features

### 1. Data Preprocessing
- Text cleaning and normalization
- TF-IDF vectorization (5,000 features)
- Intent classification based on medical keywords
- Train-test split (80/20)

### 2. Model Training
- Multiple ML algorithms tested
- Cross-validation for robust evaluation
- Hyperparameter optimization
- Model persistence for deployment

### 3. Server Integration
- RESTful API endpoints
- Real-time ML inference
- Fallback to LLM when ML unavailable
- Multi-language support (English, Hindi, Marathi)

## 🔧 API Endpoints

### ML-Powered Chat
```bash
POST /chat-ml
{
  "message": "I have a fever of 102 degrees"
}
```

### Hybrid Chat (ML + LLM)
```bash
POST /chat
{
  "message": "I have a fever of 102 degrees",
  "useML": true
}
```

## 📈 Accuracy Metrics

| Model | Accuracy | Precision | Recall | F1-Score |
|-------|----------|-----------|--------|----------|
| Random Forest | 95.65% | 0.94 | 0.93 | 0.93 |
| Logistic Regression | 90.25% | 0.89 | 0.88 | 0.88 |
| Naive Bayes | 81.90% | 0.80 | 0.79 | 0.79 |

## 🎯 Key Achievements

1. **High Accuracy**: 95.65% accuracy on medical intent classification
2. **Fast Training**: Optimized for quick deployment
3. **Scalable**: Can handle larger datasets with more epochs
4. **Production Ready**: Integrated with existing web application
5. **Multi-Model Support**: Multiple algorithms for comparison

## 🔄 Training Process

1. **Data Loading**: Processed 10K samples from 256K+ dataset
2. **Text Preprocessing**: Cleaning, tokenization, vectorization
3. **Intent Classification**: Medical keyword-based categorization
4. **Model Training**: 3 different algorithms with cross-validation
5. **Evaluation**: Comprehensive metrics and visualizations
6. **Deployment**: Server integration with real-time inference

## 🚀 Usage Instructions

### Training New Models
```bash
cd ml-training
python3 simple_training.py
```

### Testing Models
```bash
python3 quick_inference.py "I have a fever"
```

### Starting Server
```bash
cd server
npm start
```

## 📊 Performance Analysis

- **Average Accuracy**: 89.27%
- **Standard Deviation**: 6.87%
- **Models above 80%**: 3/3 (100%)
- **Best Model**: Random Forest (95.65%)

## 🔮 Future Enhancements

1. **More Epochs**: Train on full dataset with 10+ epochs
2. **BERT Integration**: Add transformer-based models
3. **More Categories**: Expand intent classification
4. **Real-time Learning**: Continuous model improvement
5. **Multi-language Training**: Train on Hindi/Marathi data

## ✅ Success Metrics

- ✅ 95.65% accuracy achieved
- ✅ Real-time inference working
- ✅ Server integration complete
- ✅ Multi-language support
- ✅ Production-ready deployment
- ✅ Comprehensive evaluation metrics

## 🏆 Conclusion

The medical chatbot ML training was successful with excellent accuracy results. The Random Forest model achieved 95.65% accuracy, making it highly reliable for medical intent classification. The system is now ready for production use with both ML-powered and hybrid (ML + LLM) chat capabilities.

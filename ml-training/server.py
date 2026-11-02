from flask import Flask, request, jsonify
from model_inference import MedicalChatbotInference
import nltk

# Download required NLTK data if not already downloaded
try:
    nltk.data.find('tokenizers/punkt')
except LookupError:
    nltk.download('punkt')

try:
    nltk.data.find('corpora/stopwords')
except LookupError:
    nltk.download('stopwords')

try:
    nltk.data.find('corpora/wordnet')
except LookupError:
    nltk.download('wordnet')

# Initialize Flask app
app = Flask(__name__)

# Initialize the medical chatbot inference engine
chatbot = MedicalChatbotInference()

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({"status": "healthy", "message": "Medical Chatbot API is running"})

@app.route('/chat', methods=['POST'])
def chat():
    data = request.json
    
    if not data or 'message' not in data:
        return jsonify({"error": "No message provided"}), 400
    
    user_message = data['message']
    model_name = data.get('model', 'random_forest')  # Default to random_forest if not specified
    
    # Get response from the chatbot
    result = chatbot.chat(user_message, model_name)
    
    return jsonify(result)

@app.route('/models', methods=['GET'])
def get_models():
    # Return list of available models
    available_models = list(chatbot.models.keys())
    return jsonify({"models": available_models})

if __name__ == '__main__':
    print("🏥 Starting Medical Chatbot API on port 3001...")
    app.run(host='0.0.0.0', port=3001, debug=True)
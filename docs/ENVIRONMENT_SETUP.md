# Environment Variables Setup

## Required API Keys

To run this application, you need to set up the following environment variables:

### 1. Server Environment Variables
Create a `.env` file in the `server/` directory (or copy from `server/.env.example`):

```bash
# Groq API Key (for LLM)
GROQ_API_KEY=your_groq_api_key_here

# OpenAI API Key (if using OpenAI)
OPENAI_API_KEY=your_openai_api_key_here

# Google AI API Key (if using Google AI)
GOOGLE_AI_API_KEY=your_google_ai_key_here

# Firebase Configuration
FIREBASE_API_KEY=your_firebase_api_key
FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_STORAGE_BUCKET=your_project.appspot.com
FIREBASE_MESSAGING_SENDER_ID=your_sender_id
FIREBASE_APP_ID=your_app_id

# D-ID API Key (for avatar streaming)
D_ID_API_KEY=your_d_id_api_key

# Email Configuration (for notifications)
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password

# Server Configuration
PORT=5051
NODE_ENV=development
```

### 2. D-ID Streaming Environment
Create an `api.json` file in the `did-streaming/` directory:

```json
{
  "d_id_api_key": "your_d_id_api_key_here",
  "openai_api_key": "your_openai_api_key_here"
}
```

## How to Get API Keys

### Groq API Key
1. Go to https://console.groq.com/
2. Sign up/Login
3. Go to API Keys section
4. Create a new API key

### OpenAI API Key
1. Go to https://platform.openai.com/
2. Sign up/Login
3. Go to API Keys section
4. Create a new API key

### D-ID API Key
1. Go to https://www.d-id.com/
2. Sign up/Login
3. Go to API section
4. Generate an API key

### Firebase Configuration
1. Go to https://console.firebase.google.com/
2. Create a new project
3. Go to Project Settings > General
4. Add a web app
5. Copy the configuration values

## Security Notes

- **NEVER** commit API keys to Git
- Use environment variables for all sensitive data
- The `.gitignore` file is configured to exclude `.env` files
- Always use `.env.example` as a template

## Setup Instructions

1. Copy the environment variables to your respective `.env` files
2. Replace placeholder values with your actual API keys
3. Make sure `.env` files are in your `.gitignore`
4. Test your setup by running the applications

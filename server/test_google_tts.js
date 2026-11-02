const axios = require('axios');

async function testGoogleTTS() {
  const apiKey = "AlzASyAaAeDgYiUsmUqLTNvE43VBZVwZoJBg9j8";
  
  console.log("Testing Google TTS API key...");
  console.log("API Key:", apiKey);
  console.log("API Key length:", apiKey.length);
  
  try {
    const response = await axios.post(
      `https://texttospeech.googleapis.com/v1/text:synthesize?key=${apiKey}`,
      {
        input: { text: "नमस्ते" },
        voice: {
          languageCode: "hi-IN",
          name: "hi-IN-Wavenet-A",
          ssmlGender: "MALE"
        },
        audioConfig: {
          audioEncoding: "MP3"
        }
      },
      {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 10000
      }
    );
    
    console.log("✅ Success! Response received");
    console.log("Audio content length:", response.data.audioContent ? response.data.audioContent.length : "No audio content");
    
  } catch (error) {
    console.log("❌ Error occurred:");
    console.log("Status:", error.response?.status);
    console.log("Error message:", error.response?.data?.error?.message || error.message);
    console.log("Full error:", error.response?.data);
  }
}

testGoogleTTS();

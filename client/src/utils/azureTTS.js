// Azure Cognitive Services TTS for regional languages
export class AzureTTS {
  constructor() {
    // Get these from Azure Cognitive Services
    this.subscriptionKey = process.env.REACT_APP_AZURE_SPEECH_KEY || "YOUR_AZURE_SPEECH_KEY";
    this.region = process.env.REACT_APP_AZURE_SPEECH_REGION || "eastus";
    this.baseUrl = `https://${this.region}.tts.speech.microsoft.com/cognitiveservices/v1`;
  }

  // Get SSML for different languages
  getSSML(text, language) {
    const voiceMap = {
      'hi': 'hi-IN-SwaraNeural', // Hindi female
      'mr': 'mr-IN-AarohiNeural', // Marathi female
      'en': 'en-US-AriaNeural' // English female
    };

    const voice = voiceMap[language] || voiceMap['en'];
    
    return `
      <speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="${language === 'hi' ? 'hi-IN' : language === 'mr' ? 'mr-IN' : 'en-US'}">
        <voice name="${voice}">
          <prosody rate="0.9" pitch="0.8">
            ${text}
          </prosody>
        </voice>
      </speak>
    `;
  }

  // Convert text to speech using Azure
  async speak(text, language = 'en') {
    try {
      const ssml = this.getSSML(text, language);
      
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Ocp-Apim-Subscription-Key': this.subscriptionKey,
          'Content-Type': 'application/ssml+xml',
          'X-Microsoft-OutputFormat': 'audio-16khz-128kbitrate-mono-mp3'
        },
        body: ssml
      });

      if (!response.ok) {
        throw new Error(`Azure TTS failed: ${response.status}`);
      }

      const audioBlob = await response.blob();
      return audioBlob;

    } catch (error) {
      console.error('Azure TTS error:', error);
      throw error;
    }
  }

  // Play audio from blob
  playAudio(audioBlob, onEnd = null) {
    return new Promise((resolve, reject) => {
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      
      audio.onended = () => {
        URL.revokeObjectURL(audioUrl);
        if (onEnd) onEnd();
        resolve();
      };
      
      audio.onerror = (error) => {
        URL.revokeObjectURL(audioUrl);
        reject(error);
      };
      
      audio.play().catch(reject);
    });
  }
}

// Export singleton instance
export const azureTTS = new AzureTTS();

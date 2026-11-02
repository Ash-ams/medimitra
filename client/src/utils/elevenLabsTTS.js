// ElevenLabs TTS for better regional pronunciation
export class ElevenLabsTTS {
  constructor() {
    // You can get a free API key from https://elevenlabs.io
    this.apiKey = process.env.REACT_APP_ELEVENLABS_API_KEY || "YOUR_ELEVENLABS_API_KEY";
    this.baseUrl = "https://api.elevenlabs.io/v1";
  }

  // Get available voices
  async getVoices() {
    try {
      const response = await fetch(`${this.baseUrl}/voices`, {
        headers: {
          'xi-api-key': this.apiKey
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data.voices;
    } catch (error) {
      console.error('Error fetching voices:', error);
      return [];
    }
  }

  // Find best voice for language
  findBestVoice(voices, language) {
    const languageMap = {
      'hi': ['hindi', 'indian', 'india'],
      'mr': ['marathi', 'indian', 'india'],
      'en': ['english', 'american', 'british']
    };

    const searchTerms = languageMap[language] || languageMap['en'];
    
    // Look for exact language match first
    for (const term of searchTerms) {
      const voice = voices.find(v => 
        v.name.toLowerCase().includes(term) ||
        v.labels?.language?.toLowerCase().includes(term)
      );
      if (voice) {
        console.log(`Found ${language} voice:`, voice.name);
        return voice;
      }
    }

    // Fallback to any available voice
    return voices[0];
  }

  // Convert text to speech
  async speak(text, language = 'en', voiceId = null) {
    try {
      // Get voices if not provided
      const voices = await this.getVoices();
      if (voices.length === 0) {
        throw new Error('No voices available');
      }

      // Find best voice
      const voice = voiceId ? 
        voices.find(v => v.voice_id === voiceId) : 
        this.findBestVoice(voices, language);

      if (!voice) {
        throw new Error('No suitable voice found');
      }

      console.log(`Using voice: ${voice.name} for ${language}`);

      // Make TTS request
      const response = await fetch(`${this.baseUrl}/text-to-speech/${voice.voice_id}`, {
        method: 'POST',
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': this.apiKey
        },
        body: JSON.stringify({
          text: text,
          model_id: 'eleven_multilingual_v2', // Best for multiple languages
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.5,
            style: 0.0,
            use_speaker_boost: true
          }
        })
      });

      if (!response.ok) {
        throw new Error(`TTS request failed: ${response.status}`);
      }

      // Return audio blob
      const audioBlob = await response.blob();
      return audioBlob;

    } catch (error) {
      console.error('ElevenLabs TTS error:', error);
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
export const elevenLabsTTS = new ElevenLabsTTS();

// Regional TTS utility for better Hindi and Marathi pronunciation
export class RegionalTTS {
  constructor() {
    this.voices = [];
    this.loadVoices();
  }

  loadVoices() {
    // Load voices when they become available
    if (window.speechSynthesis.getVoices().length > 0) {
      this.voices = window.speechSynthesis.getVoices();
    } else {
      window.speechSynthesis.addEventListener('voiceschanged', () => {
        this.voices = window.speechSynthesis.getVoices();
        console.log('Voices loaded:', this.voices.length);
      });
    }
  }

  // Find the best voice for regional languages
  findBestVoice(language, gender = 'male') {
    const voices = window.speechSynthesis.getVoices();
    
    // Priority order for voice selection
    const priorities = {
      hi: [
        // Hindi-specific voices
        v => v.lang.startsWith('hi') && v.name.toLowerCase().includes('hindi'),
        v => v.lang.startsWith('hi'),
        v => v.name.toLowerCase().includes('hindi'),
        v => v.name.toLowerCase().includes('india'),
        v => v.lang.includes('IN')
      ],
      mr: [
        // Marathi-specific voices
        v => v.lang.startsWith('mr') && v.name.toLowerCase().includes('marathi'),
        v => v.lang.startsWith('mr'),
        v => v.name.toLowerCase().includes('marathi'),
        v => v.name.toLowerCase().includes('india'),
        v => v.lang.includes('IN')
      ]
    };

    const langPriorities = priorities[language] || [];
    
    for (const priority of langPriorities) {
      const voice = voices.find(priority);
      if (voice) {
        console.log(`Found ${language} voice:`, voice.name, voice.lang);
        return voice;
      }
    }

    // Fallback to any Indian voice
    const indianVoice = voices.find(v => 
      v.name.toLowerCase().includes('india') || 
      v.lang.includes('IN')
    );
    
    if (indianVoice) {
      console.log(`Using Indian fallback voice:`, indianVoice.name);
      return indianVoice;
    }

    console.log('No regional voice found, using default');
    return null;
  }

  // Speak with enhanced regional pronunciation
  speak(text, language, gender = 'male', onEnd = null) {
    return new Promise((resolve, reject) => {
      const utterance = new SpeechSynthesisUtterance(text);
      
      // Set language
      utterance.lang = language === 'hi' ? 'hi-IN' : language === 'mr' ? 'mr-IN' : 'en-IN';
      
      // Find best voice
      const voice = this.findBestVoice(language, gender);
      if (voice) {
        utterance.voice = voice;
      }
      
      // Optimized settings for regional languages
      utterance.pitch = language === 'hi' || language === 'mr' ? 0.9 : 1.0;
      utterance.rate = language === 'hi' || language === 'mr' ? 0.8 : 0.9;
      utterance.volume = 1.0;
      
      // Event handlers
      utterance.onend = () => {
        console.log('TTS completed');
        if (onEnd) onEnd();
        resolve();
      };
      
      utterance.onerror = (event) => {
        console.error('TTS error:', event.error);
        reject(event.error);
      };
      
      // Speak
      console.log(`Speaking ${language}:`, text.substring(0, 50) + '...');
      window.speechSynthesis.speak(utterance);
    });
  }

  // Stop current speech
  stop() {
    window.speechSynthesis.cancel();
  }

  // Check if voices are available
  isReady() {
    return this.voices.length > 0;
  }
}

// Export singleton instance
export const regionalTTS = new RegionalTTS();

/**
 * Enhanced Browser TTS for Hindi and Marathi
 * Uses browser's built-in SpeechSynthesis with optimized settings
 */

class BrowserTTS {
  constructor() {
    this.isAvailable = 'speechSynthesis' in window;
    this.voices = [];
    this.loadVoices();
  }

  /**
   * Load available voices
   */
  loadVoices() {
    if (!this.isAvailable) return;
    
    this.voices = speechSynthesis.getVoices();
    
    // Reload voices when they change
    speechSynthesis.onvoiceschanged = () => {
      this.voices = speechSynthesis.getVoices();
    };
  }

  /**
   * Find the best voice for the language
   * @param {string} language - Language code (hi/mr)
   * @returns {SpeechSynthesisVoice|null} Best voice or null
   */
  findBestVoice(language) {
    if (!this.isAvailable || !this.voices.length) return null;

    const langCode = language === 'hi' ? 'hi-IN' : 'mr-IN';
    
    // Try to find exact language match
    let voice = this.voices.find(v => v.lang === langCode);
    if (voice) return voice;
    
    // Try to find Hindi/Marathi voices
    if (language === 'hi') {
      voice = this.voices.find(v => v.lang.includes('hi') || v.name.toLowerCase().includes('hindi'));
    } else if (language === 'mr') {
      voice = this.voices.find(v => v.lang.includes('mr') || v.name.toLowerCase().includes('marathi'));
    }
    
    if (voice) return voice;
    
    // Fallback to any Indian voice
    voice = this.voices.find(v => 
      v.lang.includes('IN') || 
      v.name.toLowerCase().includes('india') ||
      v.name.toLowerCase().includes('indian')
    );
    
    return voice || this.voices[0]; // Final fallback
  }

  /**
   * Convert text to speech using browser TTS
   * @param {string} text - Text to convert
   * @param {string} language - Language code (hi/mr)
   * @param {string} gender - Gender (male/female)
   * @returns {Promise<void>}
   */
  async speak(text, language = 'hi', gender = 'male') {
    if (!this.isAvailable) {
      throw new Error('Speech synthesis not available');
    }

    return new Promise((resolve, reject) => {
      // Stop any current speech
      speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(text);
      
      // Find best voice
      const voice = this.findBestVoice(language);
      if (voice) {
        utterance.voice = voice;
        console.log(`🎤 Using voice: ${voice.name} (${voice.lang})`);
      }
      
      // Set language
      utterance.lang = language === 'hi' ? 'hi-IN' : 'mr-IN';
      
      // Optimize settings for regional pronunciation
      utterance.rate = 0.8;  // Slightly slower for clarity
      utterance.pitch = 1.0;  // Normal pitch
      utterance.volume = 1.0; // Full volume
      
      // Event handlers
      utterance.onend = () => {
        console.log('✅ Browser TTS: Speech completed');
        resolve();
      };
      
      utterance.onerror = (error) => {
        console.error('❌ Browser TTS Error:', error);
        reject(error);
      };
      
      utterance.onstart = () => {
        console.log('🎵 Browser TTS: Speech started');
      };
      
      // Start speaking
      speechSynthesis.speak(utterance);
    });
  }

  /**
   * Stop current speech
   */
  stop() {
    if (this.isAvailable) {
      speechSynthesis.cancel();
    }
  }

  /**
   * Pause current speech
   */
  pause() {
    if (this.isAvailable) {
      speechSynthesis.pause();
    }
  }

  /**
   * Resume paused speech
   */
  resume() {
    if (this.isAvailable) {
      speechSynthesis.resume();
    }
  }

  /**
   * Get available voices
   * @returns {Array} List of available voices
   */
  getAvailableVoices() {
    return this.voices.map(voice => ({
      name: voice.name,
      lang: voice.lang,
      gender: voice.name.toLowerCase().includes('female') ? 'female' : 'male'
    }));
  }

  /**
   * Check if service is available
   * @returns {boolean} Service availability
   */
  isServiceAvailable() {
    return this.isAvailable;
  }
}

// Export singleton instance
export const browserTTS = new BrowserTTS();

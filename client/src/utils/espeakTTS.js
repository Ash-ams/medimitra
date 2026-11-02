/**
 * eSpeak TTS Service for Hindi and Marathi
 * Local TTS using eSpeak-ng (open source)
 * Fallback option when other services fail
 */

class ESpeakTTS {
  constructor() {
    this.isAvailable = this.checkAvailability();
    this.voices = {
      hi: {
        male: 'hi',
        female: 'hi+f3'  // Higher pitch for female
      },
      mr: {
        male: 'mr',
        female: 'mr+f3'  // Higher pitch for female
      }
    };
  }

  /**
   * Check if eSpeak is available
   * @returns {boolean} Availability status
   */
  checkAvailability() {
    // Check if running in browser (eSpeak is server-side)
    if (typeof window !== 'undefined') {
      return false; // Browser can't run eSpeak directly
    }
    
    // For server-side usage, we'll implement a proxy endpoint
    return true;
  }

  /**
   * Convert text to speech using eSpeak
   * @param {string} text - Text to convert
   * @param {string} language - Language code (hi/mr)
   * @param {string} gender - Gender (male/female)
   * @returns {Promise<Blob>} Audio blob
   */
  async speak(text, language = 'hi', gender = 'male') {
    try {
      console.log(`🎤 eSpeak TTS: Converting "${text}" to ${language}-${gender}`);
      
      // Clean and prepare text
      const cleanedText = this.cleanText(text);
      
      // Get voice parameters
      const voice = this.voices[language]?.[gender] || this.voices.hi.male;
      
      // Create request to server-side eSpeak endpoint
      const response = await fetch('/api/espeak-tts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          text: cleanedText,
          voice: voice,
          language: language,
          gender: gender
        })
      });

      if (!response.ok) {
        throw new Error(`eSpeak API error: ${response.status} ${response.statusText}`);
      }

      const audioBlob = await response.blob();
      console.log(`✅ eSpeak TTS: Generated audio (${audioBlob.size} bytes)`);
      
      return audioBlob;

    } catch (error) {
      console.error('❌ eSpeak TTS Error:', error);
      throw error;
    }
  }

  /**
   * Play audio blob
   * @param {Blob} audioBlob - Audio blob to play
   * @param {Function} onEnd - Callback when audio ends
   */
  async playAudio(audioBlob, onEnd) {
    try {
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      
      audio.onended = () => {
        URL.revokeObjectURL(audioUrl);
        if (onEnd) onEnd();
      };
      
      audio.onerror = (error) => {
        console.error('Audio playback error:', error);
        URL.revokeObjectURL(audioUrl);
        if (onEnd) onEnd();
      };

      await audio.play();
      console.log('🎵 eSpeak TTS: Audio playing');
      
    } catch (error) {
      console.error('❌ eSpeak TTS Playback Error:', error);
      throw error;
    }
  }

  /**
   * Clean text for better pronunciation
   * @param {string} text - Input text
   * @returns {string} Cleaned text
   */
  cleanText(text) {
    if (!text) return '';
    
    // Remove extra whitespace
    let cleaned = text.trim().replace(/\s+/g, ' ');
    
    // Add phonetic hints for better pronunciation
    cleaned = cleaned
      .replace(/।/g, '. ')  // Hindi full stop
      .replace(/॥/g, '. ')  // Hindi double full stop
      .replace(/\./g, '. ')  // English full stop
      .replace(/,/g, ', ')   // Comma
      .replace(/;/g, '; ')   // Semicolon
      .replace(/:/g, ': ')   // Colon
      .replace(/\?/g, '? ')   // Question
      .replace(/!/g, '! ');   // Exclamation
    
    return cleaned;
  }

  /**
   * Get available voices for language
   * @param {string} language - Language code
   * @returns {Object} Available voices
   */
  getVoices(language) {
    return this.voices[language] || this.voices.hi;
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
export const espeakTTS = new ESpeakTTS();

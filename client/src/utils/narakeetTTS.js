/**
 * Narakeet TTS Service for Hindi and Marathi
 * Free service with good regional pronunciation
 */

class NarakeetTTS {
  constructor() {
    this.baseUrl = 'https://api.narakeet.com';
    this.apiKey = process.env.REACT_APP_NARAKEET_API_KEY || null;
    this.voices = {
      hi: {
        male: 'hi-IN-Male',
        female: 'hi-IN-Female'
      },
      mr: {
        male: 'mr-IN-Male', 
        female: 'mr-IN-Female'
      }
    };
  }

  /**
   * Convert text to speech using Narakeet API
   * @param {string} text - Text to convert
   * @param {string} language - Language code (hi/mr)
   * @param {string} gender - Gender (male/female)
   * @returns {Promise<Blob>} Audio blob
   */
  async speak(text, language = 'hi', gender = 'male') {
    try {
      console.log(`🎤 Narakeet TTS: Converting "${text}" to ${language}-${gender}`);
      
      // Clean and prepare text
      const cleanedText = this.cleanText(text);
      
      // Get voice ID
      const voiceId = this.voices[language]?.[gender] || this.voices.hi.male;
      
      // Create request payload
      const payload = {
        text: cleanedText,
        voice: voiceId,
        format: 'mp3',
        speed: 1.0,
        pitch: 1.0
      };

      // Make API request
      const response = await fetch(`${this.baseUrl}/text-to-speech`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
          'Accept': 'audio/mpeg'
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`Narakeet API error: ${response.status} ${response.statusText}`);
      }

      const audioBlob = await response.blob();
      console.log(`✅ Narakeet TTS: Generated audio (${audioBlob.size} bytes)`);
      
      return audioBlob;

    } catch (error) {
      console.error('❌ Narakeet TTS Error:', error);
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
      console.log('🎵 Narakeet TTS: Audio playing');
      
    } catch (error) {
      console.error('❌ Narakeet TTS Playback Error:', error);
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
    
    // Add pauses for better pronunciation
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
  isAvailable() {
    return this.apiKey !== null;
  }
}

// Export singleton instance
export const narakeetTTS = new NarakeetTTS();

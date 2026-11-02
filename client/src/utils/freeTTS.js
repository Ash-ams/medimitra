/**
 * Free TTS Service Aggregator
 * Combines multiple free TTS services with fallback options
 */

import { narakeetTTS } from './narakeetTTS';
import { espeakTTS } from './espeakTTS';

class FreeTTSService {
  constructor() {
    this.services = [
      { name: 'Narakeet', service: narakeetTTS, priority: 1 },
      { name: 'eSpeak', service: espeakTTS, priority: 2 }
    ];
    
    this.currentService = null;
  }

  /**
   * Convert text to speech using the best available free service
   * @param {string} text - Text to convert
   * @param {string} language - Language code (hi/mr)
   * @param {string} gender - Gender (male/female)
   * @returns {Promise<Blob>} Audio blob
   */
  async speak(text, language = 'hi', gender = 'male') {
    console.log(`🎤 Free TTS: Attempting to convert "${text}" to ${language}-${gender}`);
    
    // Try services in order of priority
    for (const { name, service } of this.services) {
      try {
        console.log(`🔄 Trying ${name} TTS...`);
        
        if (service.isAvailable && !service.isAvailable()) {
          console.log(`⏭️ ${name} TTS not available, skipping`);
          continue;
        }
        
        const audioBlob = await service.speak(text, language, gender);
        this.currentService = name;
        console.log(`✅ ${name} TTS: Successfully generated audio`);
        return audioBlob;
        
      } catch (error) {
        console.log(`❌ ${name} TTS failed:`, error.message);
        continue;
      }
    }
    
    // If all services fail, throw error
    throw new Error('All free TTS services failed');
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
      console.log(`🎵 Free TTS (${this.currentService}): Audio playing`);
      
    } catch (error) {
      console.error('❌ Free TTS Playback Error:', error);
      throw error;
    }
  }

  /**
   * Get service status
   * @returns {Object} Service status information
   */
  getServiceStatus() {
    const status = {};
    
    this.services.forEach(({ name, service }) => {
      status[name] = {
        available: service.isAvailable ? service.isAvailable() : true,
        priority: this.services.find(s => s.name === name)?.priority || 0
      };
    });
    
    return status;
  }

  /**
   * Get current active service
   * @returns {string|null} Current service name
   */
  getCurrentService() {
    return this.currentService;
  }

  /**
   * Test all services with sample text
   * @param {string} text - Sample text to test
   * @param {string} language - Language code
   * @returns {Promise<Object>} Test results
   */
  async testServices(text = 'नमस्ते', language = 'hi') {
    const results = {};
    
    for (const { name, service } of this.services) {
      try {
        console.log(`🧪 Testing ${name} TTS...`);
        const startTime = Date.now();
        
        if (service.isAvailable && !service.isAvailable()) {
          results[name] = { status: 'unavailable', error: 'Service not available' };
          continue;
        }
        
        const audioBlob = await service.speak(text, language, 'male');
        const duration = Date.now() - startTime;
        
        results[name] = {
          status: 'success',
          duration: duration,
          size: audioBlob.size,
          type: audioBlob.type
        };
        
        console.log(`✅ ${name} TTS test successful (${duration}ms, ${audioBlob.size} bytes)`);
        
      } catch (error) {
        results[name] = {
          status: 'failed',
          error: error.message
        };
        console.log(`❌ ${name} TTS test failed:`, error.message);
      }
    }
    
    return results;
  }
}

// Export singleton instance
export const freeTTS = new FreeTTSService();

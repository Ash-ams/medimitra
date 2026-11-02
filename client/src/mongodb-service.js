// MongoDB Service for Client-side operations
// This service handles communication with the backend MongoDB endpoints

class MongoDBService {
  constructor() {
    this.baseURL = 'http://localhost:5051';
  }

  // Medical Reports
  async uploadMedicalReport(file, userId) {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('userId', userId);

      const response = await fetch(`${this.baseURL}/upload-report`, {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error('Failed to upload report');
      }

      return await response.json();
    } catch (error) {
      console.error('Error uploading medical report:', error);
      throw error;
    }
  }

  async getMedicalReports(userId) {
    try {
      const response = await fetch(`${this.baseURL}/medical-reports/${userId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch medical reports');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching medical reports:', error);
      throw error;
    }
  }

  async deleteMedicalReport(reportId) {
    try {
      const response = await fetch(`${this.baseURL}/medical-reports/${reportId}`, {
        method: 'DELETE'
      });
      if (!response.ok) {
        throw new Error('Failed to delete report');
      }
      return await response.json();
    } catch (error) {
      console.error('Error deleting medical report:', error);
      throw error;
    }
  }

  // Chat History
  async saveChatMessage(chatData) {
    try {
      const response = await fetch(`${this.baseURL}/save-chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(chatData)
      });

      if (!response.ok) {
        throw new Error('Failed to save chat message');
      }

      return await response.json();
    } catch (error) {
      console.error('Error saving chat message:', error);
      throw error;
    }
  }

  async getChatHistory(userId, type = 'all') {
    try {
      const response = await fetch(`${this.baseURL}/chat-history/${userId}?type=${type}`);
      if (!response.ok) {
        throw new Error('Failed to fetch chat history');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching chat history:', error);
      throw error;
    }
  }

  // User Management
  async saveUser(userData) {
    try {
      const response = await fetch(`${this.baseURL}/save-user`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData)
      });

      if (!response.ok) {
        throw new Error('Failed to save user');
      }

      return await response.json();
    } catch (error) {
      console.error('Error saving user:', error);
      throw error;
    }
  }

  async getUser(userId) {
    try {
      const response = await fetch(`${this.baseURL}/user/${userId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch user');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching user:', error);
      throw error;
    }
  }

  // Health Check
  async healthCheck() {
    try {
      const response = await fetch(`${this.baseURL}/health`);
      if (!response.ok) {
        throw new Error('Health check failed');
      }
      return await response.json();
    } catch (error) {
      console.error('Health check failed:', error);
      return { status: 'error', message: error.message };
    }
  }
}

// Create singleton instance
const mongoService = new MongoDBService();

export default mongoService;

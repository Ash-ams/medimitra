// MongoDB Configuration
const { MongoClient } = require('mongodb');

class MongoDBService {
  constructor() {
    this.client = null;
    this.db = null;
    this.isConnected = false;
  }

  async connect() {
    try {
      // MongoDB connection string - you'll provide this
      const connectionString = process.env.MONGODB_URI || 'mongodb+srv://username:password@cluster.mongodb.net/ai-doctor-db';
      
      this.client = new MongoClient(connectionString, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });

      await this.client.connect();
      this.db = this.client.db('ai-doctor-db');
      this.isConnected = true;
      
      console.log('✅ Connected to MongoDB successfully');
      return true;
    } catch (error) {
      console.error('❌ MongoDB connection failed:', error);
      return false;
    }
  }

  async disconnect() {
    if (this.client) {
      await this.client.close();
      this.isConnected = false;
      console.log('📤 Disconnected from MongoDB');
    }
  }

  // Medical Reports Collection - REMOVED

  // Chat History Collection
  async saveChatMessage(chatData) {
    try {
      const collection = this.db.collection('chat_history');
      const result = await collection.insertOne(chatData);
      console.log('💬 Chat message saved:', result.insertedId);
      return result.insertedId;
    } catch (error) {
      console.error('Error saving chat message:', error);
      throw error;
    }
  }

  async getChatHistory(userId, type = 'all') {
    try {
      const collection = this.db.collection('chat_history');
      let query = { userId };
      
      if (type !== 'all') {
        query.type = type;
      }
      
      const chats = await collection.find(query).sort({ timestamp: -1 }).toArray();
      return chats;
    } catch (error) {
      console.error('Error fetching chat history:', error);
      throw error;
    }
  }

  // File Storage (using MongoDB GridFS)
  async saveFile(fileBuffer, filename, metadata = {}) {
    try {
      const bucket = new this.db.collection('fs.files');
      const chunks = this.db.collection('fs.chunks');
      
      // For now, we'll store file metadata and return a file ID
      // In production, you'd use GridFS for large files
      const fileData = {
        filename,
        metadata,
        uploadDate: new Date(),
        length: fileBuffer.length
      };
      
      const result = await bucket.insertOne(fileData);
      return result.insertedId;
    } catch (error) {
      console.error('Error saving file:', error);
      throw error;
    }
  }

  async getFile(fileId) {
    try {
      const bucket = this.db.collection('fs.files');
      const file = await bucket.findOne({ _id: fileId });
      return file;
    } catch (error) {
      console.error('Error fetching file:', error);
      throw error;
    }
  }

  // User Management
  async saveUser(userData) {
    try {
      const collection = this.db.collection('users');
      const result = await collection.insertOne(userData);
      return result.insertedId;
    } catch (error) {
      console.error('Error saving user:', error);
      throw error;
    }
  }

  async getUser(userId) {
    try {
      const collection = this.db.collection('users');
      const user = await collection.findOne({ userId });
      return user;
    } catch (error) {
      console.error('Error fetching user:', error);
      throw error;
    }
  }

  // Health Check
  async healthCheck() {
    try {
      if (!this.isConnected) {
        return { status: 'disconnected', message: 'Not connected to MongoDB' };
      }
      
      await this.db.admin().ping();
      return { status: 'connected', message: 'MongoDB is healthy' };
    } catch (error) {
      return { status: 'error', message: error.message };
    }
  }
}

// Create singleton instance
const mongoService = new MongoDBService();

module.exports = mongoService;

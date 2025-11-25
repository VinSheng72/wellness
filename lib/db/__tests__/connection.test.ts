import mongoose from 'mongoose';
import { connectDB, disconnectDB, getConnectionStatus } from '../connection';

describe('Database Connection', () => {
  afterEach(async () => {
    // Clean up connections after each test
    if (mongoose.connection.readyState !== 0) {
      await disconnectDB();
    }
  });

  describe('connectDB', () => {
    it('should establish a connection to MongoDB', async () => {
      const result = await connectDB();
      
      expect(result).toBe(mongoose);
      expect(mongoose.connection.readyState).toBe(1); // 1 = connected
      
      const status = getConnectionStatus();
      expect(status.isConnected).toBe(true);
      expect(status.readyStateString).toBe('connected');
    });

    it('should reuse existing connection', async () => {
      // First connection
      await connectDB();
      const firstConnectionId = mongoose.connection.id;
      
      // Second connection attempt should reuse
      await connectDB();
      const secondConnectionId = mongoose.connection.id;
      
      expect(firstConnectionId).toBe(secondConnectionId);
    });

    it('should throw error if MONGODB_URI is not defined', async () => {
      const originalUri = process.env.MONGODB_URI;
      delete process.env.MONGODB_URI;
      
      // Disconnect first to reset state
      if (mongoose.connection.readyState !== 0) {
        await disconnectDB();
      }
      
      await expect(connectDB()).rejects.toThrow('MONGODB_URI environment variable is not defined');
      
      // Restore
      process.env.MONGODB_URI = originalUri;
    });
  });

  describe('disconnectDB', () => {
    it('should disconnect from MongoDB', async () => {
      await connectDB();
      expect(mongoose.connection.readyState).toBe(1);
      
      await disconnectDB();
      expect(mongoose.connection.readyState).toBe(0); // 0 = disconnected
      
      const status = getConnectionStatus();
      expect(status.isConnected).toBe(false);
      expect(status.readyStateString).toBe('disconnected');
    });

    it('should handle disconnect when not connected', async () => {
      await expect(disconnectDB()).resolves.not.toThrow();
    });
  });

  describe('getConnectionStatus', () => {
    it('should return correct status when connected', async () => {
      await connectDB();
      
      const status = getConnectionStatus();
      expect(status.isConnected).toBe(true);
      expect(status.readyState).toBe(1);
      expect(status.readyStateString).toBe('connected');
    });

    it('should return correct status when disconnected', async () => {
      const status = getConnectionStatus();
      expect(status.readyState).toBe(0);
      expect(status.readyStateString).toBe('disconnected');
    });
  });
});

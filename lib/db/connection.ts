import mongoose from 'mongoose';

// Track connection state
interface ConnectionState {
  isConnected: boolean;
  connectionPromise: Promise<typeof mongoose> | null;
}

const connection: ConnectionState = {
  isConnected: false,
  connectionPromise: null,
};

/**
 * Connect to MongoDB with connection pooling and error handling
 * Uses singleton pattern to reuse connections across serverless function invocations
 */
export async function connectDB(): Promise<typeof mongoose> {
  // Return existing connection if already connected
  if (connection.isConnected && mongoose.connection.readyState === 1) {
    console.log('Using existing MongoDB connection');
    return mongoose;
  }

  // Return existing connection promise if connection is in progress
  if (connection.connectionPromise) {
    console.log('Waiting for existing MongoDB connection attempt');
    return connection.connectionPromise;
  }

  // Validate MongoDB URI
  const MONGODB_URI = process.env.MONGODB_URI;
  if (!MONGODB_URI) {
    throw new Error('MONGODB_URI environment variable is not defined');
  }

  try {
    console.log('Establishing new MongoDB connection...');

    // Create new connection promise
    connection.connectionPromise = mongoose.connect(MONGODB_URI, {
      // Connection pool settings
      maxPoolSize: 10,
      minPoolSize: 2,
      socketTimeoutMS: 45000,
      serverSelectionTimeoutMS: 5000,
      
      // Buffering settings
      bufferCommands: false,
    });

    const mongooseInstance = await connection.connectionPromise;
    connection.isConnected = true;
    
    console.log('MongoDB connected successfully');
    
    return mongooseInstance;
  } catch (error) {
    // Reset connection state on error
    connection.isConnected = false;
    connection.connectionPromise = null;
    
    console.error('MongoDB connection error:', error);
    throw new Error(`Failed to connect to MongoDB: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Disconnect from MongoDB
 * Useful for cleanup in tests or graceful shutdown
 */
export async function disconnectDB(): Promise<void> {
  if (!connection.isConnected) {
    return;
  }

  try {
    await mongoose.disconnect();
    connection.isConnected = false;
    connection.connectionPromise = null;
    console.log('MongoDB disconnected successfully');
  } catch (error) {
    console.error('Error disconnecting from MongoDB:', error);
    throw error;
  }
}

/**
 * Get current connection status
 */
export function getConnectionStatus(): {
  isConnected: boolean;
  readyState: number;
  readyStateString: string;
} {
  const readyStateMap: Record<number, string> = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting',
  };

  return {
    isConnected: connection.isConnected,
    readyState: mongoose.connection.readyState,
    readyStateString: readyStateMap[mongoose.connection.readyState] || 'unknown',
  };
}

// Connection event handlers for monitoring
mongoose.connection.on('connected', () => {
  console.log('Mongoose connected to MongoDB');
});

mongoose.connection.on('error', (err) => {
  console.error('Mongoose connection error:', err);
  connection.isConnected = false;
});

mongoose.connection.on('disconnected', () => {
  console.log('Mongoose disconnected from MongoDB');
  connection.isConnected = false;
});

// Graceful shutdown handlers
if (process.env.NODE_ENV !== 'test') {
  process.on('SIGINT', async () => {
    await disconnectDB();
    process.exit(0);
  });

  process.on('SIGTERM', async () => {
    await disconnectDB();
    process.exit(0);
  });
}

# Database Connection Module

This module provides MongoDB connection utilities with connection pooling, error handling, and lifecycle management for the Wellness Event Booking application.

## Features

- **Connection Pooling**: Configured with min/max pool sizes for optimal performance
- **Singleton Pattern**: Reuses connections across serverless function invocations
- **Error Handling**: Comprehensive error handling with detailed error messages
- **Lifecycle Management**: Graceful connection and disconnection with event monitoring
- **Environment Validation**: Validates required environment variables before connecting

## Usage

### Basic Connection

```typescript
import { connectDB } from '@/lib/db';

// Connect to MongoDB
await connectDB();

// Use mongoose models...
const users = await User.find();
```

### In Next.js API Routes

```typescript
import { connectDB } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    await connectDB();
    
    // Your database operations here
    
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: 'Database connection failed' },
      { status: 500 }
    );
  }
}
```

### Connection Status

```typescript
import { getConnectionStatus } from '@/lib/db';

const status = getConnectionStatus();
console.log(status.isConnected); // true/false
console.log(status.readyStateString); // 'connected', 'disconnected', etc.
```

### Disconnection (for tests or cleanup)

```typescript
import { disconnectDB } from '@/lib/db';

await disconnectDB();
```

## Configuration

Set the following environment variable in your `.env` file:

```bash
MONGODB_URI=mongodb://root:password@localhost:27017/wellness-events?authSource=admin
```

## Connection Pool Settings

- **maxPoolSize**: 10 connections
- **minPoolSize**: 2 connections
- **socketTimeoutMS**: 45000ms
- **serverSelectionTimeoutMS**: 5000ms

## Event Monitoring

The module automatically logs connection events:
- Connection established
- Connection errors
- Disconnection events

## Graceful Shutdown

The module handles SIGINT and SIGTERM signals to gracefully close database connections before process termination.

## Testing

Run the connection tests:

```bash
npm test -- lib/db/__tests__/connection.test.ts
```

Or use the verification script:

```bash
npx tsx scripts/test-db-connection.ts
```

## Requirements

Validates: Requirements 7.1, 7.2, 7.3 from the design specification

// Jest setup file for global test configuration
import '@testing-library/jest-dom';
import { TextEncoder, TextDecoder } from 'util';

// Polyfill TextEncoder/TextDecoder for jose library
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// Set test environment variables
process.env.MONGODB_URI = process.env.MONGODB_URI || 'mongodb://root:password@localhost:27017/wellness-events-test?authSource=admin';
process.env.JWT_SECRET = 'test-secret-key';
process.env.NODE_ENV = 'test';

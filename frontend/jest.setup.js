import '@testing-library/jest-dom';
import { TextEncoder, TextDecoder } from 'util';

global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

process.env.MONGODB_URI = process.env.MONGODB_URI || 'mongodb://root:password@localhost:27017/wellness-events-test?authSource=admin';
process.env.JWT_SECRET = 'test-secret-key';
process.env.NODE_ENV = 'test';

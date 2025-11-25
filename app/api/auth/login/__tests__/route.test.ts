import { POST } from '../route';
import { NextRequest } from 'next/server';
import AuthService from '@/lib/services/AuthService';
import { connectDB, disconnectDB } from '@/lib/db';
import User from '@/lib/models/User';
import Company from '@/lib/models/Company';
import Vendor from '@/lib/models/Vendor';

describe('POST /api/auth/login', () => {
  beforeAll(async () => {
    await connectDB();
  });

  afterAll(async () => {
    await disconnectDB();
  });

  beforeEach(async () => {
    // Clean up database before each test
    await User.deleteMany({});
    await Company.deleteMany({});
    await Vendor.deleteMany({});
  });

  describe('successful login', () => {
    it('should authenticate HR Admin with valid credentials and set session cookie', async () => {
      // Create test company and user
      const company = await Company.create({ name: 'Test Company' });
      // Use plain text password - the User model will hash it automatically
      const user = await User.create({
        username: 'hradmin',
        password: 'password123',
        role: 'HR_ADMIN',
        companyId: company._id,
      });

      // Create request
      const request = new NextRequest('http://localhost:3000/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          username: 'hradmin',
          password: 'password123',
        }),
      });

      // Call API route
      const response = await POST(request);
      const data = await response.json();

      // Verify response
      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.user.username).toBe('hradmin');
      expect(data.user.role).toBe('HR_ADMIN');
      expect(data.user.companyId).toBe(company._id.toString());

      // Verify session cookie is set
      const cookies = response.cookies;
      const sessionCookie = cookies.get('session');
      expect(sessionCookie).toBeDefined();
      expect(sessionCookie?.value).toBeTruthy();
      expect(sessionCookie?.httpOnly).toBe(true);
    });

    it('should authenticate Vendor Admin with valid credentials', async () => {
      // Create test vendor and user
      const vendor = await Vendor.create({
        name: 'Test Vendor',
        contactEmail: 'vendor@test.com',
      });
      // Use plain text password - the User model will hash it automatically
      const user = await User.create({
        username: 'vendoradmin',
        password: 'vendorpass',
        role: 'VENDOR_ADMIN',
        vendorId: vendor._id,
      });

      // Create request
      const request = new NextRequest('http://localhost:3000/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          username: 'vendoradmin',
          password: 'vendorpass',
        }),
      });

      // Call API route
      const response = await POST(request);
      const data = await response.json();

      // Verify response
      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.user.username).toBe('vendoradmin');
      expect(data.user.role).toBe('VENDOR_ADMIN');
      expect(data.user.vendorId).toBe(vendor._id.toString());
    });
  });

  describe('failed login', () => {
    it('should reject login with invalid username', async () => {
      // Create request with non-existent username
      const request = new NextRequest('http://localhost:3000/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          username: 'nonexistent',
          password: 'password123',
        }),
      });

      // Call API route
      const response = await POST(request);
      const data = await response.json();

      // Verify response
      expect(response.status).toBe(401);
      expect(data.error.code).toBe('AUTHENTICATION_ERROR');
      expect(data.error.message).toBe('Invalid username or password');
    });

    it('should reject login with invalid password', async () => {
      // Create test user
      const company = await Company.create({ name: 'Test Company' });
      // Use plain text password - the User model will hash it automatically
      await User.create({
        username: 'testuser',
        password: 'correctpassword',
        role: 'HR_ADMIN',
        companyId: company._id,
      });

      // Create request with wrong password
      const request = new NextRequest('http://localhost:3000/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          username: 'testuser',
          password: 'wrongpassword',
        }),
      });

      // Call API route
      const response = await POST(request);
      const data = await response.json();

      // Verify response
      expect(response.status).toBe(401);
      expect(data.error.code).toBe('AUTHENTICATION_ERROR');
      expect(data.error.message).toBe('Invalid username or password');
    });

    it('should reject login with missing username', async () => {
      // Create request without username
      const request = new NextRequest('http://localhost:3000/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          password: 'password123',
        }),
      });

      // Call API route
      const response = await POST(request);
      const data = await response.json();

      // Verify response
      expect(response.status).toBe(400);
      expect(data.error.code).toBe('VALIDATION_ERROR');
      expect(data.error.message).toBe('Username and password are required');
    });

    it('should reject login with missing password', async () => {
      // Create request without password
      const request = new NextRequest('http://localhost:3000/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          username: 'testuser',
        }),
      });

      // Call API route
      const response = await POST(request);
      const data = await response.json();

      // Verify response
      expect(response.status).toBe(400);
      expect(data.error.code).toBe('VALIDATION_ERROR');
      expect(data.error.message).toBe('Username and password are required');
    });
  });

  describe('cookie setting', () => {
    it('should set HTTP-only cookie with correct attributes', async () => {
      // Create test user
      const company = await Company.create({ name: 'Test Company' });
      // Use plain text password - the User model will hash it automatically
      await User.create({
        username: 'testuser',
        password: 'password123',
        role: 'HR_ADMIN',
        companyId: company._id,
      });

      // Create request
      const request = new NextRequest('http://localhost:3000/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          username: 'testuser',
          password: 'password123',
        }),
      });

      // Call API route
      const response = await POST(request);

      // Verify cookie attributes
      const sessionCookie = response.cookies.get('session');
      expect(sessionCookie).toBeDefined();
      expect(sessionCookie?.httpOnly).toBe(true);
      expect(sessionCookie?.path).toBe('/');
      expect(sessionCookie?.sameSite).toBe('lax');
    });
  });
});

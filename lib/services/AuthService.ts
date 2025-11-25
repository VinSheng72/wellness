import bcrypt from 'bcrypt';
import * as jose from 'jose';
import { IUser } from '../models/User';
import UserRepository from '../repositories/UserRepository';

/**
 * Authentication service for user login and session management
 */
export class AuthService {
  private readonly jwtSecret: string;
  private readonly jwtExpiresIn;

  constructor() {
    this.jwtSecret = process.env.JWT_SECRET || 'default-secret-key-change-in-production';
    this.jwtExpiresIn = process.env.JWT_EXPIRES_IN  || '7d';
  }

  /**
   * Authenticate user with username and password
   * @param username - The username to authenticate
   * @param password - The plain text password
   * @returns User object if authentication successful
   * @throws Error if credentials are invalid
   */
  async login(username: string, password: string): Promise<{ user: IUser }> {
    // Find user by username
    const user = await UserRepository.findByUsername(username);
    
    if (!user) {
      throw new Error('Invalid username or password');
    }

    // Compare password with hashed password
    const isPasswordValid = await this.comparePassword(password, user.password);
    
    if (!isPasswordValid) {
      throw new Error('Invalid username or password');
    }

    return { user };
  }

  /**
   * Create a JWT session token for authenticated user
   * @param user - The authenticated user
   * @returns JWT token string
   */
  async createSessionToken(user: IUser): Promise<string> {
    const payload = {
      userId: user._id.toString(),
      username: user.username,
      role: user.role,
      companyId: user.companyId?.toString(),
      vendorId: user.vendorId?.toString(),
    };

    const token = await new jose.SignJWT(payload)
      .setProtectedHeader({ alg: 'HS256' })
      .setExpirationTime('1h')
      .sign(new TextEncoder().encode(this.jwtSecret));

    return token;
  }

  /**
   * Verify and decode a JWT session token
   * @param token - The JWT token to verify
   * @returns Decoded user information or null if invalid
   */
  async verifySession(token: string): Promise<{
    userId: string;
    username: string;
    role: string;
    companyId?: string;
    vendorId?: string;
  } | null> {
    try {
      const { payload } = await jose.jwtVerify(
        token,
        new TextEncoder().encode(this.jwtSecret)
      );
      
      return {
        userId: payload.userId as string,
        username: payload.username as string,
        role: payload.role as string,
        companyId: payload.companyId as string | undefined,
        vendorId: payload.vendorId as string | undefined,
      };
    } catch (error) {
      // Token is invalid or expired
      return null;
    }
  }

  /**
   * Hash a plain text password
   * @param password - The plain text password
   * @returns Hashed password
   */
  async hashPassword(password: string): Promise<string> {
    const saltRounds = 10;
    return await bcrypt.hash(password, saltRounds);
  }

  /**
   * Compare a plain text password with a hashed password
   * @param password - The plain text password
   * @param hash - The hashed password
   * @returns True if passwords match, false otherwise
   */
  async comparePassword(password: string, hash: string): Promise<boolean> {
    return await bcrypt.compare(password, hash);
  }
}

export default new AuthService();

import mongoose from 'mongoose';
import User, { IUser } from '../models/User';

/**
 * UserRepository provides data access methods for User model
 */
export class UserRepository {
  /**
   * Find a user by username
   * @param username - The username to search for
   * @returns The user document or null if not found
   */
  async findByUsername(username: string): Promise<IUser | null> {
    console.log("inside")
    return await User.findOne({ username }).exec();
  }

  /**
   * Find a user by ID
   * @param id - The user ID to search for
   * @returns The user document or null if not found
   */
  async findById(id: string | mongoose.Types.ObjectId): Promise<IUser | null> {
    return await User.findById(id).exec();
  }

  /**
   * Create a new user
   * @param userData - The user data to create
   * @returns The created user document
   */
  async create(userData: {
    username: string;
    password: string;
    role: string;
    companyId?: mongoose.Types.ObjectId;
    vendorId?: mongoose.Types.ObjectId;
  }): Promise<IUser> {
    const user = new User(userData);
    return await user.save();
  }
}

export default new UserRepository();

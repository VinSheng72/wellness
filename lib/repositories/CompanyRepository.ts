import mongoose from 'mongoose';
import Company, { ICompany } from '../models/Company';

/**
 * CompanyRepository provides data access methods for Company model
 */
export class CompanyRepository {
  /**
   * Find a company by ID
   * @param id - The company ID to search for
   * @returns The company document or null if not found
   */
  async findById(id: string | mongoose.Types.ObjectId): Promise<ICompany | null> {
    return await Company.findById(id).exec();
  }
}

export default new CompanyRepository();

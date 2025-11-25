import mongoose from 'mongoose';
import Vendor, { IVendor } from '../models/Vendor';

/**
 * VendorRepository provides data access methods for Vendor model
 */
export class VendorRepository {
  /**
   * Find a vendor by ID
   * @param id - The vendor ID to search for
   * @returns The vendor document or null if not found
   */
  async findById(id: string | mongoose.Types.ObjectId): Promise<IVendor | null> {
    return await Vendor.findById(id).exec();
  }
}

export default new VendorRepository();

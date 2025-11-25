import mongoose from 'mongoose';
import EventItem, { IEventItem } from '../models/EventItem';

/**
 * EventItemRepository provides data access methods for EventItem model
 */
export class EventItemRepository {
  /**
   * Find all event items
   * @returns Array of all event items with vendor information
   */
  async findAll(): Promise<IEventItem[]> {
    return await EventItem.find()
      .populate('vendorId', 'name contactEmail')
      .sort({ name: 1 })
      .exec();
  }

  /**
   * Find all event items for a specific vendor
   * @param vendorId - The vendor ID to filter by
   * @returns Array of event items for the vendor
   */
  async findByVendor(vendorId: string | mongoose.Types.ObjectId): Promise<IEventItem[]> {
    return await EventItem.find({ vendorId })
      .populate('vendorId', 'name contactEmail')
      .sort({ name: 1 })
      .exec();
  }
}

export default new EventItemRepository();

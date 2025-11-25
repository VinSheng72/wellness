import mongoose from 'mongoose';
import Event, { IEvent, EventStatus, ILocation } from '../models/Event';

/**
 * EventRepository provides data access methods for Event model
 * Enforces data isolation for multi-tenancy
 */
export class EventRepository {
  /**
   * Create a new event
   * @param eventData - The event data to create
   * @returns The created event document
   */
  async create(eventData: {
    companyId: mongoose.Types.ObjectId;
    eventItemId: mongoose.Types.ObjectId;
    vendorId: mongoose.Types.ObjectId;
    proposedDates: Date[];
    location: ILocation;
    status?: EventStatus;
  }): Promise<IEvent> {
    const event = new Event({
      ...eventData,
      status: eventData.status || EventStatus.PENDING,
      dateCreated: new Date(),
      lastModified: new Date(),
    });
    return await event.save();
  }

  /**
   * Find an event by ID
   * @param id - The event ID to search for
   * @returns The event document or null if not found
   */
  async findById(id: string | mongoose.Types.ObjectId): Promise<IEvent | null> {
    return await Event.findById(id)
      .populate('companyId', 'name')
      .populate('eventItemId', 'name')
      .populate('vendorId', 'name')
      .exec();
  }

  /**
   * Find all events for a specific company (HR Admin data isolation)
   * @param companyId - The company ID to filter by
   * @returns Array of events for the company
   */
  async findByCompany(companyId: string | mongoose.Types.ObjectId): Promise<IEvent[]> {
    return await Event.find({ companyId })
      .populate('companyId', 'name')
      .populate('eventItemId', 'name')
      .populate('vendorId', 'name')
      .sort({ dateCreated: -1 })
      .exec();
  }

  /**
   * Find all events for a specific vendor (Vendor Admin data isolation)
   * @param vendorId - The vendor ID to filter by
   * @returns Array of events for the vendor
   */
  async findByVendor(vendorId: string | mongoose.Types.ObjectId): Promise<IEvent[]> {
    return await Event.find({ vendorId })
      .populate('companyId', 'name')
      .populate('eventItemId', 'name')
      .populate('vendorId', 'name')
      .sort({ dateCreated: -1 })
      .exec();
  }

  /**
   * Update an event
   * @param id - The event ID to update
   * @param updateData - The fields to update
   * @returns The updated event document or null if not found
   */
  async update(
    id: string | mongoose.Types.ObjectId,
    updateData: Partial<{
      status: EventStatus;
      confirmedDate: Date;
      remarks: string;
    }>
  ): Promise<IEvent | null> {
    return await Event.findByIdAndUpdate(
      id,
      {
        ...updateData,
        lastModified: new Date(),
      },
      { new: true, runValidators: true }
    )
      .populate('companyId', 'name')
      .populate('eventItemId', 'name')
      .populate('vendorId', 'name')
      .exec();
  }
}

export default new EventRepository();

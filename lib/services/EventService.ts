import mongoose from 'mongoose';
import { IEvent, EventStatus, ILocation } from '../models/Event';
import EventRepository from '../repositories/EventRepository';
import EventItemRepository from '../repositories/EventItemRepository';
import UserRepository from '../repositories/UserRepository';
import { UserRole } from '../models/User';

/**
 * Event service for business logic related to wellness events
 */
export class EventService {
  /**
   * Create a new wellness event
   * Automatically assigns vendor from the selected event item
   * @param eventData - The event creation data
   * @param companyId - The company ID creating the event
   * @returns The created event
   * @throws Error if event item not found or validation fails
   */
  async createEvent(
    eventData: {
      eventItemId: string;
      proposedDates: Date[];
      location: ILocation;
    },
    companyId: string
  ): Promise<IEvent> {
    // Fetch the event item to get the vendor assignment
    const eventItems = await EventItemRepository.findAll();
    const eventItem = eventItems.find(
      (item) => item._id.toString() === eventData.eventItemId
    );

    if (!eventItem) {
      throw new Error('Event item not found');
    }

    // Validate exactly 3 proposed dates
    if (!eventData.proposedDates || eventData.proposedDates.length !== 3) {
      throw new Error('Exactly 3 proposed dates are required');
    }

    // Validate location
    if (!eventData.location || !eventData.location.postalCode || !eventData.location.streetName) {
      throw new Error('Location with postal code and street name is required');
    }

    // Create event with vendor assigned from event item
    const event = await EventRepository.create({
      companyId: new mongoose.Types.ObjectId(companyId),
      eventItemId: new mongoose.Types.ObjectId(eventData.eventItemId),
      vendorId: eventItem.vendorId,
      proposedDates: eventData.proposedDates,
      location: eventData.location,
      status: EventStatus.PENDING,
    });

    return event;
  }

  /**
   * Get all events for a specific company (HR Admin view)
   * @param companyId - The company ID to filter by
   * @returns Array of events for the company
   */
  async getEventsByCompany(companyId: string): Promise<IEvent[]> {
    return await EventRepository.findByCompany(companyId);
  }

  /**
   * Get all events for a specific vendor (Vendor Admin view)
   * @param vendorId - The vendor ID to filter by
   * @returns Array of events for the vendor
   */
  async getEventsByVendor(vendorId: string): Promise<IEvent[]> {
    return await EventRepository.findByVendor(vendorId);
  }

  /**
   * Approve an event with a confirmed date
   * @param eventId - The event ID to approve
   * @param confirmedDate - The selected date from proposed dates
   * @param vendorId - The vendor ID performing the approval
   * @returns The updated event
   * @throws Error if event not found, not pending, or date invalid
   */
  async approveEvent(
    eventId: string,
    confirmedDate: Date,
    vendorId: string
  ): Promise<IEvent> {
    // Fetch the event
    const event = await EventRepository.findById(eventId);

    if (!event) {
      throw new Error('Event not found');
    }

    // Verify event belongs to this vendor
    const eventVendorId = (event.vendorId as any)?._id
      ? (event.vendorId as any)._id.toString()
      : event.vendorId.toString();
    
    if (eventVendorId !== vendorId) {
      throw new Error('Unauthorized: Event does not belong to this vendor');
    }

    // Verify event is in Pending status
    if (event.status !== EventStatus.PENDING) {
      throw new Error('Event is not in Pending status');
    }

    // Verify confirmed date is one of the proposed dates
    const confirmedDateTime = new Date(confirmedDate).getTime();
    const isValidDate = event.proposedDates.some(
      (proposedDate) => new Date(proposedDate).getTime() === confirmedDateTime
    );

    if (!isValidDate) {
      throw new Error('Confirmed date must be one of the proposed dates');
    }

    // Update event status and confirmed date
    const updatedEvent = await EventRepository.update(eventId, {
      status: EventStatus.APPROVED,
      confirmedDate: new Date(confirmedDate),
    });

    if (!updatedEvent) {
      throw new Error('Failed to update event');
    }

    return updatedEvent;
  }

  /**
   * Reject an event with remarks
   * @param eventId - The event ID to reject
   * @param remarks - The rejection reason
   * @param vendorId - The vendor ID performing the rejection
   * @returns The updated event
   * @throws Error if event not found, not pending, or remarks empty
   */
  async rejectEvent(
    eventId: string,
    remarks: string,
    vendorId: string
  ): Promise<IEvent> {
    // Validate remarks are not empty
    if (!remarks || remarks.trim().length === 0) {
      throw new Error('Rejection remarks cannot be empty');
    }

    // Fetch the event
    const event = await EventRepository.findById(eventId);

    if (!event) {
      throw new Error('Event not found');
    }

    // Verify event belongs to this vendor
    const eventVendorId = (event.vendorId as any)?._id
      ? (event.vendorId as any)._id.toString()
      : event.vendorId.toString();
    
    if (eventVendorId !== vendorId) {
      throw new Error('Unauthorized: Event does not belong to this vendor');
    }

    // Verify event is in Pending status
    if (event.status !== EventStatus.PENDING) {
      throw new Error('Event is not in Pending status');
    }

    // Update event status and remarks
    const updatedEvent = await EventRepository.update(eventId, {
      status: EventStatus.REJECTED,
      remarks: remarks.trim(),
    });

    if (!updatedEvent) {
      throw new Error('Failed to update event');
    }

    return updatedEvent;
  }

  /**
   * Validate if a user has access to view/modify an event
   * @param eventId - The event ID to check
   * @param userId - The user ID requesting access
   * @param role - The user's role
   * @returns True if user has access, false otherwise
   */
  async validateEventAccess(
    eventId: string,
    userId: string,
    role: string
  ): Promise<boolean> {
    const event = await EventRepository.findById(eventId);

    if (!event) {
      return false;
    }

    const user = await UserRepository.findById(userId);

    if (!user) {
      return false;
    }

    // HR Admin can access events from their company
    if (role === UserRole.HR_ADMIN && user.companyId) {
      return event.companyId.toString() === user.companyId.toString();
    }

    // Vendor Admin can access events assigned to their vendor
    if (role === UserRole.VENDOR_ADMIN && user.vendorId) {
      return event.vendorId.toString() === user.vendorId.toString();
    }

    return false;
  }
}

export default new EventService();

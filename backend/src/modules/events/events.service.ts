import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection, Types } from 'mongoose';
import { EventsRepository } from './events.repository';
import { EventItemsRepository } from '../event-items/event-items.repository';
import { Event, EventDocument } from './schemas/event.schema';
import { AuthenticatedUser } from '../../common/types/auth.types';
import { UserRole } from '../../common/enums/user-role.enum';
import { EventStatus } from '../../common/enums/event-status.enum';

interface CreateEventData {
  eventItemId: string;
  proposedDates: string[];
  location: {
    postalCode: string;
    streetName: string;
  };
}

interface ApproveEventData {
  confirmedDate: string;
}

interface RejectEventData {
  remarks: string;
}

interface UpdateEventData {
  eventItemId?: string;
  proposedDates?: string[];
  location?: {
    postalCode: string;
    streetName: string;
  };
}



@Injectable()
export class EventsService {
  private readonly logger = new Logger(EventsService.name);

  constructor(
    @InjectConnection() private connection: Connection,
    private eventsRepository: EventsRepository,
    private eventItemsRepository: EventItemsRepository,
  ) { }

  async create(
    createEventData: CreateEventData,
    companyId: string,
  ): Promise<EventDocument> {

    const eventItem = await this.eventItemsRepository.findById(
      createEventData.eventItemId,
    );

    if (!eventItem) {
      throw new NotFoundException('Event item not found');
    }

    const hasApprovedEvent = await this.eventsRepository.hasApprovedEventForItem(
      createEventData.eventItemId,
    );

    if (hasApprovedEvent) {
      throw new BadRequestException(
        'Cannot create event: An approved event already exists for this event item',
      );
    }

    const event = {
      companyId: new Types.ObjectId(companyId),
      eventItemId: new Types.ObjectId(createEventData.eventItemId),
      vendorId: eventItem.vendorId,
      proposedDates: createEventData.proposedDates.map(
        (date) => new Date(date),
      ),
      location: createEventData.location,
      status: EventStatus.PENDING,
      dateCreated: new Date(),
      lastModified: new Date(),
    };

    return this.eventsRepository.create(event);
  }

  async findByCompany(companyId: string): Promise<EventDocument[]> {
    return this.eventsRepository.findByCompany(companyId);
  }

  async findByVendor(vendorId: string): Promise<EventDocument[]> {
    return this.eventsRepository.findByVendor(vendorId);
  }

  async findById(id: string): Promise<EventDocument> {
    const event = await this.eventsRepository.findById(id);
    if (!event) {
      throw new NotFoundException('Event not found');
    }
    return event;
  }



  async approve(
    id: string,
    approveData: ApproveEventData,
    vendorId: string,
  ): Promise<EventDocument> {
    const event = await this.findById(id);

    if (event.vendorId.toString() !== vendorId) {
      throw new ForbiddenException('Not authorized to approve this event');
    }

    if (event.status !== EventStatus.PENDING) {
      throw new BadRequestException('Only pending events can be approved');
    }

    const confirmedDate = new Date(approveData.confirmedDate);
    const isValidDate = event.proposedDates.some(
      (proposedDate) =>
        proposedDate.toISOString().split('T')[0] ===
        confirmedDate.toISOString().split('T')[0],
    );

    if (!isValidDate) {
      throw new BadRequestException(
        'Confirmed date must be one of the proposed dates',
      );
    }

    const session = await this.connection.startSession();
    session.startTransaction();

    try {
      const updated = await this.eventsRepository.update(id, {
        status: EventStatus.APPROVED,
        confirmedDate: confirmedDate,
        lastModified: new Date(),
      });

      if (!updated) {
        throw new NotFoundException('Event not found');
      }

      const pendingEvents = await this.eventsRepository.findPendingByEventItem(
        event.eventItemId,
      );

      const eventsToReject = pendingEvents.filter(
        (e) => e._id.toString() !== id,
      );

      // Auto-reject all other pending events
      if (eventsToReject.length > 0) {
        const idsToReject = eventsToReject.map((e) => e._id.toString());
        await this.eventsRepository.bulkUpdateStatus(
          idsToReject,
          EventStatus.REJECTED,
          'Automatically rejected: Another event for this event item has been approved',
        );
      }

      await session.commitTransaction();
      return updated;
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  async reject(
    id: string,
    rejectData: RejectEventData,
    vendorId: string,
  ): Promise<EventDocument> {
    const event = await this.findById(id);

    if (event.vendorId.toString() !== vendorId) {
      throw new ForbiddenException('Not authorized to reject this event');
    }

    if (event.status !== EventStatus.PENDING) {
      throw new BadRequestException('Only pending events can be rejected');
    }

    const updated = await this.eventsRepository.update(id, {
      status: EventStatus.REJECTED,
      remarks: rejectData.remarks,
      lastModified: new Date(),
    });

    if (!updated) {
      throw new NotFoundException('Event not found');
    }

    return updated;
  }

  async validateAccess(event: EventDocument, user: AuthenticatedUser): Promise<void> {
    if (user.role === UserRole.HR_ADMIN) {
      this.validateHRAdminAccess(event, user);
      return;
    }

    if (user.role === UserRole.VENDOR_ADMIN) {
      this.validateVendorAdminAccess(event, user);
      return;
    }

    // Unknown role - deny access
    this.logger.warn('Unknown role attempting access', {
      userId: user.id,
      role: user.role,
      eventId: event._id.toString(),
    });
    throw new ForbiddenException('Not authorized to access this event');
  }

  private validateHRAdminAccess(event: EventDocument, user: AuthenticatedUser): void {
    if (!user.companyId) {
      this.logger.error('HR Admin user missing companyId', { userId: user.id });
      throw new ForbiddenException('Not authorized to access this event');
    }

    const eventCompanyId = event.companyId.toString();
    const userCompanyId = user.companyId;

    if (eventCompanyId !== userCompanyId) {
      this.logger.warn('CompanyId mismatch', {
        userId: user.id,
        userCompanyId,
        eventCompanyId,
        eventId: event._id.toString(),
      });
      throw new ForbiddenException('Not authorized to access this event');
    }

    this.logger.debug('HR Admin authorization successful', {
      userId: user.id,
      companyId: userCompanyId,
    });
  }

  private validateVendorAdminAccess(event: EventDocument, user: AuthenticatedUser): void {
    if (!user.vendorId) {
      this.logger.error('Vendor Admin user missing vendorId', { userId: user.id });
      throw new ForbiddenException('Not authorized to access this event');
    }

    const eventVendorId = event.vendorId.toString();
    const userVendorId = user.vendorId;

    if (eventVendorId !== userVendorId) {
      this.logger.warn('VendorId mismatch', {
        userId: user.id,
        userVendorId,
        eventVendorId,
        eventId: event._id.toString(),
      });
      throw new ForbiddenException('Not authorized to access this event');
    }

    this.logger.debug('Vendor Admin authorization successful', {
      userId: user.id,
      vendorId: userVendorId,
    });
  }

  async findByEventItem(eventItemId: string): Promise<EventDocument[]> {
    return this.eventsRepository.findByEventItem(eventItemId);
  }

  async update(
    id: string,
    updateEventData: UpdateEventData,
  ): Promise<EventDocument> {

    const event = await this.findById(id);

    if (event.status !== EventStatus.PENDING) {
      throw new BadRequestException(
        `Cannot edit event with status ${event.status}. Only pending events can be edited.`,
      );
    }


    const updateData: Partial<Event> = {
      lastModified: new Date(),
    };

    if (updateEventData.proposedDates) {
      updateData.proposedDates = updateEventData.proposedDates.map(
        (date) => new Date(date),
      );
    }

    if (updateEventData.location) {
      updateData.location = updateEventData.location;
    }

    const updated = await this.eventsRepository.update(id, updateData);

    if (!updated) {
      throw new NotFoundException('Event not found');
    }

    return updated;
  }
}

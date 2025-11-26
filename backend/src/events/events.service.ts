import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { EventsRepository } from './events.repository';
import { EventItemsRepository } from '../event-items/event-items.repository';
import { EventDocument } from './schemas/event.schema';
import { Types } from 'mongoose';

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

interface UserContext {
  id: string;
  role: string;
  companyId?: string;
  vendorId?: string;
}

@Injectable()
export class EventsService {
  constructor(
    private eventsRepository: EventsRepository,
    private eventItemsRepository: EventItemsRepository,
  ) {}

  async create(
    createEventData: CreateEventData,
    companyId: string,
  ): Promise<EventDocument> {
    // Get vendor from event item
    const eventItem = await this.eventItemsRepository.findById(
      createEventData.eventItemId,
    );

    if (!eventItem) {
      throw new NotFoundException('Event item not found');
    }

    const event = {
      companyId: new Types.ObjectId(companyId),
      eventItemId: new Types.ObjectId(createEventData.eventItemId),
      vendorId: eventItem.vendorId,
      proposedDates: createEventData.proposedDates.map((date) => new Date(date)),
      location: createEventData.location,
      status: 'Pending',
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

    if (event.status !== 'Pending') {
      throw new BadRequestException('Only pending events can be approved');
    }

    // Check if confirmed date is one of the proposed dates
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

    const updated = await this.eventsRepository.update(id, {
      status: 'Approved',
      confirmedDate: confirmedDate,
      lastModified: new Date(),
    });

    if (!updated) {
      throw new NotFoundException('Event not found');
    }

    return updated;
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

    if (event.status !== 'Pending') {
      throw new BadRequestException('Only pending events can be rejected');
    }

    const updated = await this.eventsRepository.update(id, {
      status: 'Rejected',
      remarks: rejectData.remarks,
      lastModified: new Date(),
    });

    if (!updated) {
      throw new NotFoundException('Event not found');
    }

    return updated;
  }

  async validateAccess(event: EventDocument, user: UserContext): Promise<void> {
    if (user.role === 'HR_ADMIN' && event.companyId.toString() !== user.companyId) {
      throw new ForbiddenException('Not authorized to access this event');
    }
    if (user.role === 'VENDOR_ADMIN' && event.vendorId.toString() !== user.vendorId) {
      throw new ForbiddenException('Not authorized to access this event');
    }
  }
}

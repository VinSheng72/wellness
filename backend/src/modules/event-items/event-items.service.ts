import { Injectable } from '@nestjs/common';
import { Types } from 'mongoose';
import { EventItemsRepository } from './event-items.repository';
import { EventsRepository } from '../events/events.repository';
import { EventItemDocument } from './schemas/event-item.schema';
import { CreateEventItemDto } from './dto/create-event-item.dto';

@Injectable()
export class EventItemsService {
  constructor(
    private readonly eventItemsRepository: EventItemsRepository,
    private readonly eventsRepository: EventsRepository,
  ) {}

  async findAll(): Promise<any[]> {
    const allItems = await this.eventItemsRepository.findAll();
    
    const itemsWithStatus = await Promise.all(
      allItems.map(async (item) => {
        const hasApprovedEvent = await this.eventsRepository.hasApprovedEventForItem(
          item._id.toString(),
        );
        const itemObj = typeof item.toObject === 'function' ? item.toObject() : item;
        return {
          ...itemObj,
          hasApprovedEvent,
        };
      }),
    );
    
    return itemsWithStatus;
  }

  async findById(id: string): Promise<EventItemDocument | null> {
    return this.eventItemsRepository.findById(id);
  }

  async create(
    data: CreateEventItemDto,
    vendorId: string,
  ): Promise<EventItemDocument> {
    const eventItemData = {
      ...data,
      vendorId: new Types.ObjectId(vendorId),
    };
    return this.eventItemsRepository.create(eventItemData);
  }

  async findByVendor(vendorId: string): Promise<EventItemDocument[]> {
    return this.eventItemsRepository.findByVendor(vendorId);
  }

  async validateOwnership(
    eventItemId: string,
    vendorId: string,
  ): Promise<boolean> {
    return this.eventItemsRepository.validateOwnership(eventItemId, vendorId);
  }


}

import { Injectable } from '@nestjs/common';
import { EventItemsRepository } from './event-items.repository';
import { EventItemDocument } from './schemas/event-item.schema';

@Injectable()
export class EventItemsService {
  constructor(private readonly eventItemsRepository: EventItemsRepository) {}

  async findAll(): Promise<EventItemDocument[]> {
    return this.eventItemsRepository.findAll();
  }

  async findById(id: string): Promise<EventItemDocument | null> {
    return this.eventItemsRepository.findById(id);
  }
}

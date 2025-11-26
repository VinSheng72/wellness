import { EventItemsRepository } from './event-items.repository';
import { EventItemDocument } from './schemas/event-item.schema';
export declare class EventItemsService {
    private readonly eventItemsRepository;
    constructor(eventItemsRepository: EventItemsRepository);
    findAll(): Promise<EventItemDocument[]>;
    findById(id: string): Promise<EventItemDocument | null>;
}

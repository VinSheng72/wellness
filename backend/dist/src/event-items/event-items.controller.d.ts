import { EventItemsService } from './event-items.service';
import { EventItemDocument } from './schemas/event-item.schema';
export declare class EventItemsController {
    private readonly eventItemsService;
    constructor(eventItemsService: EventItemsService);
    findAll(): Promise<EventItemDocument[]>;
}

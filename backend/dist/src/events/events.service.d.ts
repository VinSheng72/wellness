import { EventsRepository } from './events.repository';
import { EventItemsRepository } from '../event-items/event-items.repository';
import { EventDocument } from './schemas/event.schema';
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
export declare class EventsService {
    private eventsRepository;
    private eventItemsRepository;
    constructor(eventsRepository: EventsRepository, eventItemsRepository: EventItemsRepository);
    create(createEventData: CreateEventData, companyId: string): Promise<EventDocument>;
    findByCompany(companyId: string): Promise<EventDocument[]>;
    findByVendor(vendorId: string): Promise<EventDocument[]>;
    findById(id: string): Promise<EventDocument>;
    approve(id: string, approveData: ApproveEventData, vendorId: string): Promise<EventDocument>;
    reject(id: string, rejectData: RejectEventData, vendorId: string): Promise<EventDocument>;
    validateAccess(event: EventDocument, user: UserContext): Promise<void>;
}
export {};

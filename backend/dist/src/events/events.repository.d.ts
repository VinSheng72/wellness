import { Model, Types } from 'mongoose';
import { Event, EventDocument } from './schemas/event.schema';
export declare class EventsRepository {
    private eventModel;
    constructor(eventModel: Model<EventDocument>);
    create(eventData: Partial<Event>): Promise<EventDocument>;
    findById(id: string | Types.ObjectId): Promise<EventDocument | null>;
    findByCompany(companyId: string | Types.ObjectId): Promise<EventDocument[]>;
    findByVendor(vendorId: string | Types.ObjectId): Promise<EventDocument[]>;
    update(id: string | Types.ObjectId, updateData: Partial<Event>): Promise<EventDocument | null>;
}

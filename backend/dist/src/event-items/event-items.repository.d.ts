import { Model, Types } from 'mongoose';
import { EventItemDocument } from './schemas/event-item.schema';
export declare class EventItemsRepository {
    private eventItemModel;
    constructor(eventItemModel: Model<EventItemDocument>);
    findAll(): Promise<EventItemDocument[]>;
    findById(id: string | Types.ObjectId): Promise<EventItemDocument | null>;
}

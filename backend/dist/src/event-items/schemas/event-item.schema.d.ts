import { Document, Types } from 'mongoose';
export type EventItemDocument = EventItem & Document;
export declare class EventItem {
    name: string;
    description?: string;
    vendorId: Types.ObjectId;
    category?: string;
    price?: number;
    duration?: number;
}
export declare const EventItemSchema: import("mongoose").Schema<EventItem, import("mongoose").Model<EventItem, any, any, any, Document<unknown, any, EventItem, any, {}> & EventItem & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, EventItem, Document<unknown, {}, import("mongoose").FlatRecord<EventItem>, {}, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & import("mongoose").FlatRecord<EventItem> & {
    _id: Types.ObjectId;
} & {
    __v: number;
}>;

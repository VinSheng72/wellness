import { Document, Types } from 'mongoose';
export type EventDocument = Event & Document;
export declare class Event {
    companyId: Types.ObjectId;
    eventItemId: Types.ObjectId;
    vendorId: Types.ObjectId;
    proposedDates: Date[];
    location: {
        postalCode: string;
        streetName: string;
    };
    status: string;
    confirmedDate?: Date;
    remarks?: string;
    dateCreated: Date;
    lastModified: Date;
}
export declare const EventSchema: import("mongoose").Schema<Event, import("mongoose").Model<Event, any, any, any, Document<unknown, any, Event, any, {}> & Event & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Event, Document<unknown, {}, import("mongoose").FlatRecord<Event>, {}, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & import("mongoose").FlatRecord<Event> & {
    _id: Types.ObjectId;
} & {
    __v: number;
}>;

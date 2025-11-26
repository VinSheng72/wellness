import { Document } from 'mongoose';
export type VendorDocument = Vendor & Document;
export declare class Vendor {
    name: string;
    description?: string;
    contactEmail?: string;
    contactPhone?: string;
    address?: string;
}
export declare const VendorSchema: import("mongoose").Schema<Vendor, import("mongoose").Model<Vendor, any, any, any, Document<unknown, any, Vendor, any, {}> & Vendor & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Vendor, Document<unknown, {}, import("mongoose").FlatRecord<Vendor>, {}, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & import("mongoose").FlatRecord<Vendor> & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}>;

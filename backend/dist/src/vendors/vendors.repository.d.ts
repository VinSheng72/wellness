import { Model, Types } from 'mongoose';
import { VendorDocument } from './schemas/vendor.schema';
export declare class VendorsRepository {
    private vendorModel;
    constructor(vendorModel: Model<VendorDocument>);
    findById(id: string | Types.ObjectId): Promise<VendorDocument | null>;
}

import { VendorsRepository } from './vendors.repository';
import { VendorDocument } from './schemas/vendor.schema';
export declare class VendorsService {
    private readonly vendorsRepository;
    constructor(vendorsRepository: VendorsRepository);
    findById(id: string): Promise<VendorDocument | null>;
}

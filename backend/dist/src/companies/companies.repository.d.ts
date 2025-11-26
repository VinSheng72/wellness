import { Model, Types } from 'mongoose';
import { CompanyDocument } from './schemas/company.schema';
export declare class CompaniesRepository {
    private companyModel;
    constructor(companyModel: Model<CompanyDocument>);
    findById(id: string | Types.ObjectId): Promise<CompanyDocument | null>;
}

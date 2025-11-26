import { CompaniesRepository } from './companies.repository';
import { CompanyDocument } from './schemas/company.schema';
export declare class CompaniesService {
    private readonly companiesRepository;
    constructor(companiesRepository: CompaniesRepository);
    findById(id: string): Promise<CompanyDocument | null>;
}

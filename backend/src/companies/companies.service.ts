import { Injectable } from '@nestjs/common';
import { CompaniesRepository } from './companies.repository';
import { CompanyDocument } from './schemas/company.schema';

@Injectable()
export class CompaniesService {
  constructor(private readonly companiesRepository: CompaniesRepository) {}

  async findById(id: string): Promise<CompanyDocument | null> {
    return this.companiesRepository.findById(id);
  }
}

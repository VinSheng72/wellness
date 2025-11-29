import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Company, CompanyDocument } from './schemas/company.schema';

@Injectable()
export class CompaniesRepository {
  constructor(
    @InjectModel(Company.name) private companyModel: Model<CompanyDocument>,
  ) {}

  async findById(id: string | Types.ObjectId): Promise<CompanyDocument | null> {
    return this.companyModel.findById(id).exec();
  }
}

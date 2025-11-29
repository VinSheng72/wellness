import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Company, CompanySchema } from './schemas/company.schema';
import { CompaniesRepository } from './companies.repository';
import { CompaniesService } from './companies.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Company.name, schema: CompanySchema }]),
  ],
  providers: [CompaniesRepository, CompaniesService],
  exports: [CompaniesRepository, CompaniesService],
})
export class CompaniesModule {}

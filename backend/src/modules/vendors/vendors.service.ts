import { Injectable } from '@nestjs/common';
import { VendorsRepository } from './vendors.repository';
import { VendorDocument } from './schemas/vendor.schema';

@Injectable()
export class VendorsService {
  constructor(private readonly vendorsRepository: VendorsRepository) {}

  async findById(id: string): Promise<VendorDocument | null> {
    return this.vendorsRepository.findById(id);
  }
}

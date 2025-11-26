import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Vendor, VendorDocument } from './schemas/vendor.schema';

@Injectable()
export class VendorsRepository {
  constructor(
    @InjectModel(Vendor.name) private vendorModel: Model<VendorDocument>,
  ) {}

  async findById(id: string | Types.ObjectId): Promise<VendorDocument | null> {
    return this.vendorModel.findById(id).exec();
  }
}

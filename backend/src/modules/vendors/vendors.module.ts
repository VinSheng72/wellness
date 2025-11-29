import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Vendor, VendorSchema } from './schemas/vendor.schema';
import { VendorsRepository } from './vendors.repository';
import { VendorsService } from './vendors.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Vendor.name, schema: VendorSchema }]),
  ],
  providers: [VendorsRepository, VendorsService],
  exports: [VendorsRepository, VendorsService],
})
export class VendorsModule {}

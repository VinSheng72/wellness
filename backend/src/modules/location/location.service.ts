import { Injectable, NotFoundException } from '@nestjs/common';
import { PostalCodeResponseDto } from './dto/postal-code-response.dto';

@Injectable()
export class LocationService {

  async lookupPostalCode(code: string): Promise<PostalCodeResponseDto> {
    if (!code || code.trim().length === 0) {
      throw new NotFoundException('Postal code is required');
    }

    return {
      postalCode: code,
      streetName: 'Sample Street',
      area: 'Sample Area',
      district: 'Sample District',
    };
  }
}

import { Injectable, NotFoundException } from '@nestjs/common';
import { PostalCodeResponseDto } from './dto/postal-code-response.dto';

@Injectable()
export class LocationService {
  /**
   * Stub implementation for postal code lookup
   * In a real implementation, this would integrate with an external API
   * or database to fetch actual postal code information
   */
  async lookupPostalCode(code: string): Promise<PostalCodeResponseDto> {
    // Validate postal code format (basic validation)
    if (!code || code.trim().length === 0) {
      throw new NotFoundException('Postal code is required');
    }

    // Stub response - in production, this would call an external API
    // For now, return a mock response
    return {
      postalCode: code,
      streetName: 'Sample Street',
      area: 'Sample Area',
      district: 'Sample District',
    };
  }
}

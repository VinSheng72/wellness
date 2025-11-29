import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam } from '@nestjs/swagger';
import { LocationService } from './location.service';
import { PostalCodeResponseDto } from './dto/postal-code-response.dto';
import { ApiAuth } from '../../common/decorators/api-auth.decorator';
import { ApiGetByIdResponses } from '../../common/decorators/api-responses.decorator';

@ApiTags('location')
@Controller('postal-code')
@ApiAuth()
export class LocationController {
  constructor(private readonly locationService: LocationService) {}

  @Get(':code')
  @ApiOperation({ summary: 'Lookup postal code information' })
  @ApiParam({ name: 'code', description: 'Postal code to lookup', example: '123456' })
  @ApiGetByIdResponses(PostalCodeResponseDto)
  async lookupPostalCode(
    @Param('code') code: string,
  ): Promise<PostalCodeResponseDto> {
    return this.locationService.lookupPostalCode(code);
  }
}

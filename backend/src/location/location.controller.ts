import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { LocationService } from './location.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { PostalCodeResponseDto } from './dto/postal-code-response.dto';

@ApiTags('location')
@Controller('postal-code')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class LocationController {
  constructor(private readonly locationService: LocationService) {}

  @Get(':code')
  @ApiOperation({ summary: 'Lookup postal code information' })
  @ApiParam({
    name: 'code',
    description: 'Postal code to lookup',
    example: '123456',
  })
  @ApiResponse({
    status: 200,
    description: 'Returns postal code information',
    type: PostalCodeResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @ApiResponse({
    status: 404,
    description: 'Postal code not found',
  })
  async lookupPostalCode(
    @Param('code') code: string,
  ): Promise<PostalCodeResponseDto> {
    return this.locationService.lookupPostalCode(code);
  }
}

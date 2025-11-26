import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { EventItemsService } from './event-items.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { EventItemDocument } from './schemas/event-item.schema';

@ApiTags('event-items')
@Controller('event-items')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class EventItemsController {
  constructor(private readonly eventItemsService: EventItemsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all event items' })
  @ApiResponse({
    status: 200,
    description: 'Returns all event items',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  async findAll(): Promise<EventItemDocument[]> {
    return this.eventItemsService.findAll();
  }
}

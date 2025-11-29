import { Controller, Get, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { EventItemsService } from './event-items.service';
import { User } from '../../common/decorators/current-user.decorator';
import { UserRole } from '../../common/enums/user-role.enum';
import { EventItemDocument } from './schemas/event-item.schema';
import { CreateEventItemDto } from './dto/create-event-item.dto';
import { ApiAuth, ApiAuthWithRoles } from '../../common/decorators/api-auth.decorator';
import {
  ApiGetResponse,
  ApiCreateResponses,
} from '../../common/decorators/api-responses.decorator';

@ApiTags('event-items')
@Controller('event-items')
@ApiAuth()
export class EventItemsController {
  constructor(
    private readonly eventItemsService: EventItemsService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get all event items with approval status' })
  @ApiGetResponse([Object])
  async findAll(): Promise<any[]> {
    return this.eventItemsService.findAll();
  }

  @Post()
  @ApiAuthWithRoles(UserRole.VENDOR_ADMIN)
  @ApiOperation({ summary: 'Create a new event item (Vendor only)' })
  @ApiCreateResponses(Object)
  async create(
    @Body() createEventItemDto: CreateEventItemDto,
    @User() user: any,
  ): Promise<EventItemDocument> {
    return this.eventItemsService.create(createEventItemDto, user.vendorId);
  }

  @Get('my-items')
  @ApiAuthWithRoles(UserRole.VENDOR_ADMIN)
  @ApiOperation({ summary: 'Get all event items for the authenticated vendor' })
  @ApiGetResponse([Object])
  async findMyItems(@User() user: any): Promise<EventItemDocument[]> {
    return this.eventItemsService.findByVendor(user.vendorId);
  }
}

import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  HttpCode,
  HttpStatus,
  ForbiddenException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam } from '@nestjs/swagger';
import { EventsService } from './events.service';
import { EventItemsService } from '../event-items/event-items.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { ApproveEventDto } from './dto/approve-event.dto';
import { RejectEventDto } from './dto/reject-event.dto';
import { EventResponseDto } from './dto/event-response.dto';
import { User } from '../../common/decorators/current-user.decorator';
import { ApiAuth, ApiAuthWithRoles } from '../../common/decorators/api-auth.decorator';
import {
  ApiGetResponse,
  ApiCreateResponses,
  ApiUpdateResponses,
  ApiResourceErrors,
} from '../../common/decorators/api-responses.decorator';
import { UserRole } from '../../common/enums/user-role.enum';

@ApiTags('events')
@Controller('events')
@ApiAuth()
export class EventsController {
  constructor(
    private readonly eventsService: EventsService,
    private readonly eventItemsService: EventItemsService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get all events for the authenticated user' })
  @ApiGetResponse([EventResponseDto])
  async findAll(@User() user: any): Promise<any[]> {
    if (user.role === UserRole.HR_ADMIN) {
      return this.eventsService.findByCompany(user.companyId);
    } else {
      return this.eventsService.findByVendor(user.vendorId);
    }
  }

  @Post()
  @ApiAuthWithRoles(UserRole.HR_ADMIN)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new event (HR Admin only)' })
  @ApiCreateResponses(EventResponseDto)
  async create(
    @Body() createEventDto: CreateEventDto,
    @User() user: any,
  ): Promise<any> {
    return this.eventsService.create(createEventDto, user.companyId);
  }

  @Put(':id')
  @ApiAuthWithRoles(UserRole.HR_ADMIN)
  @ApiOperation({ summary: 'Update an event (HR Admin only)' })
  @ApiParam({ name: 'id', description: 'Event ID' })
  @ApiUpdateResponses(EventResponseDto)
  async update(
    @Param('id') id: string,
    @Body() updateEventDto: UpdateEventDto,
    @User() user: any,
  ): Promise<any> {
    const event = await this.eventsService.findById(id);
    await this.eventsService.validateAccess(event, user);
    return this.eventsService.update(id, updateEventDto);
  }

  @Post(':id/approve')
  @ApiAuthWithRoles(UserRole.VENDOR_ADMIN)
  @ApiOperation({ summary: 'Approve an event (Vendor Admin only)' })
  @ApiParam({ name: 'id', description: 'Event ID' })
  @ApiUpdateResponses(EventResponseDto)
  async approve(
    @Param('id') id: string,
    @Body() approveDto: ApproveEventDto,
    @User() user: any,
  ): Promise<any> {
    return this.eventsService.approve(id, approveDto, user.vendorId);
  }

  @Post(':id/reject')
  @ApiAuthWithRoles(UserRole.VENDOR_ADMIN)
  @ApiOperation({ summary: 'Reject an event (Vendor Admin only)' })
  @ApiParam({ name: 'id', description: 'Event ID' })
  @ApiUpdateResponses(EventResponseDto)
  async reject(
    @Param('id') id: string,
    @Body() rejectDto: RejectEventDto,
    @User() user: any,
  ): Promise<any> {
    return this.eventsService.reject(id, rejectDto, user.vendorId);
  }

  @Get('event-item/:eventItemId')
  @ApiAuthWithRoles(UserRole.VENDOR_ADMIN)
  @ApiOperation({ summary: 'Get all events for a specific event item (Vendor Admin only)' })
  @ApiParam({ name: 'eventItemId', description: 'Event Item ID' })
  @ApiGetResponse([EventResponseDto])
  @ApiResourceErrors()
  async getEventsForItem(
    @Param('eventItemId') eventItemId: string,
    @User() user: any,
  ): Promise<any[]> {
    // Validate ownership
    const isOwner = await this.eventItemsService.validateOwnership(
      eventItemId,
      user.vendorId,
    );
    if (!isOwner) {
      throw new ForbiddenException(
        'Not authorized to access this event item',
      );
    }

    return this.eventsService.findByEventItem(eventItemId);
  }
}

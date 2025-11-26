import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { EventsService } from './events.service';
import { CreateEventDto } from './dto/create-event.dto';
import { ApproveEventDto } from './dto/approve-event.dto';
import { RejectEventDto } from './dto/reject-event.dto';
import { EventResponseDto } from './dto/event-response.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('events')
@Controller('events')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all events for the authenticated user' })
  @ApiResponse({
    status: 200,
    description: 'Returns events filtered by user role and organization',
    type: [EventResponseDto],
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async findAll(@CurrentUser() user: any): Promise<any[]> {
    if (user.role === 'HR_ADMIN') {
      return this.eventsService.findByCompany(user.companyId);
    } else {
      return this.eventsService.findByVendor(user.vendorId);
    }
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single event by ID' })
  @ApiParam({ name: 'id', description: 'Event ID' })
  @ApiResponse({
    status: 200,
    description: 'Returns the event details',
    type: EventResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Not authorized to access this event' })
  @ApiResponse({ status: 404, description: 'Event not found' })
  async findOne(
    @Param('id') id: string,
    @CurrentUser() user: any,
  ): Promise<any> {
    const event = await this.eventsService.findById(id);
    await this.eventsService.validateAccess(event, user);
    return event;
  }

  @Post()
  @Roles('HR_ADMIN')
  @UseGuards(RolesGuard)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new event (HR Admin only)' })
  @ApiResponse({
    status: 201,
    description: 'Event created successfully',
    type: EventResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad Request - Validation failed' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Requires HR_ADMIN role' })
  @ApiResponse({ status: 404, description: 'Event item not found' })
  async create(
    @Body() createEventDto: CreateEventDto,
    @CurrentUser() user: any,
  ): Promise<any> {
    return this.eventsService.create(createEventDto, user.companyId);
  }

  @Post(':id/approve')
  @Roles('VENDOR_ADMIN')
  @UseGuards(RolesGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Approve an event (Vendor Admin only)' })
  @ApiParam({ name: 'id', description: 'Event ID' })
  @ApiResponse({
    status: 200,
    description: 'Event approved successfully',
    type: EventResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad Request - Event cannot be approved' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Not authorized or requires VENDOR_ADMIN role' })
  @ApiResponse({ status: 404, description: 'Event not found' })
  async approve(
    @Param('id') id: string,
    @Body() approveDto: ApproveEventDto,
    @CurrentUser() user: any,
  ): Promise<any> {
    return this.eventsService.approve(id, approveDto, user.vendorId);
  }

  @Post(':id/reject')
  @Roles('VENDOR_ADMIN')
  @UseGuards(RolesGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reject an event (Vendor Admin only)' })
  @ApiParam({ name: 'id', description: 'Event ID' })
  @ApiResponse({
    status: 200,
    description: 'Event rejected successfully',
    type: EventResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad Request - Event cannot be rejected' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Not authorized or requires VENDOR_ADMIN role' })
  @ApiResponse({ status: 404, description: 'Event not found' })
  async reject(
    @Param('id') id: string,
    @Body() rejectDto: RejectEventDto,
    @CurrentUser() user: any,
  ): Promise<any> {
    return this.eventsService.reject(id, rejectDto, user.vendorId);
  }
}

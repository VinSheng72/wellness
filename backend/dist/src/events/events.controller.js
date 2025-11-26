"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const events_service_1 = require("./events.service");
const create_event_dto_1 = require("./dto/create-event.dto");
const approve_event_dto_1 = require("./dto/approve-event.dto");
const reject_event_dto_1 = require("./dto/reject-event.dto");
const event_response_dto_1 = require("./dto/event-response.dto");
const jwt_auth_guard_1 = require("../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../common/guards/roles.guard");
const roles_decorator_1 = require("../common/decorators/roles.decorator");
const current_user_decorator_1 = require("../common/decorators/current-user.decorator");
let EventsController = class EventsController {
    eventsService;
    constructor(eventsService) {
        this.eventsService = eventsService;
    }
    async findAll(user) {
        if (user.role === 'HR_ADMIN') {
            return this.eventsService.findByCompany(user.companyId);
        }
        else {
            return this.eventsService.findByVendor(user.vendorId);
        }
    }
    async findOne(id, user) {
        const event = await this.eventsService.findById(id);
        await this.eventsService.validateAccess(event, user);
        return event;
    }
    async create(createEventDto, user) {
        return this.eventsService.create(createEventDto, user.companyId);
    }
    async approve(id, approveDto, user) {
        return this.eventsService.approve(id, approveDto, user.vendorId);
    }
    async reject(id, rejectDto, user) {
        return this.eventsService.reject(id, rejectDto, user.vendorId);
    }
};
exports.EventsController = EventsController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get all events for the authenticated user' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Returns events filtered by user role and organization',
        type: [event_response_dto_1.EventResponseDto],
    }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], EventsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get a single event by ID' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Event ID' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Returns the event details',
        type: event_response_dto_1.EventResponseDto,
    }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Forbidden - Not authorized to access this event' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Event not found' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], EventsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(),
    (0, roles_decorator_1.Roles)('HR_ADMIN'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new event (HR Admin only)' }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: 'Event created successfully',
        type: event_response_dto_1.EventResponseDto,
    }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Bad Request - Validation failed' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Forbidden - Requires HR_ADMIN role' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Event item not found' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_event_dto_1.CreateEventDto, Object]),
    __metadata("design:returntype", Promise)
], EventsController.prototype, "create", null);
__decorate([
    (0, common_1.Post)(':id/approve'),
    (0, roles_decorator_1.Roles)('VENDOR_ADMIN'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Approve an event (Vendor Admin only)' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Event ID' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Event approved successfully',
        type: event_response_dto_1.EventResponseDto,
    }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Bad Request - Event cannot be approved' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Forbidden - Not authorized or requires VENDOR_ADMIN role' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Event not found' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, approve_event_dto_1.ApproveEventDto, Object]),
    __metadata("design:returntype", Promise)
], EventsController.prototype, "approve", null);
__decorate([
    (0, common_1.Post)(':id/reject'),
    (0, roles_decorator_1.Roles)('VENDOR_ADMIN'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Reject an event (Vendor Admin only)' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Event ID' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Event rejected successfully',
        type: event_response_dto_1.EventResponseDto,
    }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Bad Request - Event cannot be rejected' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Forbidden - Not authorized or requires VENDOR_ADMIN role' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Event not found' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, reject_event_dto_1.RejectEventDto, Object]),
    __metadata("design:returntype", Promise)
], EventsController.prototype, "reject", null);
exports.EventsController = EventsController = __decorate([
    (0, swagger_1.ApiTags)('events'),
    (0, common_1.Controller)('events'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    __metadata("design:paramtypes", [events_service_1.EventsService])
], EventsController);
//# sourceMappingURL=events.controller.js.map
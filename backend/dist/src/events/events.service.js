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
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventsService = void 0;
const common_1 = require("@nestjs/common");
const events_repository_1 = require("./events.repository");
const event_items_repository_1 = require("../event-items/event-items.repository");
const mongoose_1 = require("mongoose");
let EventsService = class EventsService {
    eventsRepository;
    eventItemsRepository;
    constructor(eventsRepository, eventItemsRepository) {
        this.eventsRepository = eventsRepository;
        this.eventItemsRepository = eventItemsRepository;
    }
    async create(createEventData, companyId) {
        const eventItem = await this.eventItemsRepository.findById(createEventData.eventItemId);
        if (!eventItem) {
            throw new common_1.NotFoundException('Event item not found');
        }
        const event = {
            companyId: new mongoose_1.Types.ObjectId(companyId),
            eventItemId: new mongoose_1.Types.ObjectId(createEventData.eventItemId),
            vendorId: eventItem.vendorId,
            proposedDates: createEventData.proposedDates.map((date) => new Date(date)),
            location: createEventData.location,
            status: 'Pending',
            dateCreated: new Date(),
            lastModified: new Date(),
        };
        return this.eventsRepository.create(event);
    }
    async findByCompany(companyId) {
        return this.eventsRepository.findByCompany(companyId);
    }
    async findByVendor(vendorId) {
        return this.eventsRepository.findByVendor(vendorId);
    }
    async findById(id) {
        const event = await this.eventsRepository.findById(id);
        if (!event) {
            throw new common_1.NotFoundException('Event not found');
        }
        return event;
    }
    async approve(id, approveData, vendorId) {
        const event = await this.findById(id);
        if (event.vendorId.toString() !== vendorId) {
            throw new common_1.ForbiddenException('Not authorized to approve this event');
        }
        if (event.status !== 'Pending') {
            throw new common_1.BadRequestException('Only pending events can be approved');
        }
        const confirmedDate = new Date(approveData.confirmedDate);
        const isValidDate = event.proposedDates.some((proposedDate) => proposedDate.toISOString().split('T')[0] ===
            confirmedDate.toISOString().split('T')[0]);
        if (!isValidDate) {
            throw new common_1.BadRequestException('Confirmed date must be one of the proposed dates');
        }
        const updated = await this.eventsRepository.update(id, {
            status: 'Approved',
            confirmedDate: confirmedDate,
            lastModified: new Date(),
        });
        if (!updated) {
            throw new common_1.NotFoundException('Event not found');
        }
        return updated;
    }
    async reject(id, rejectData, vendorId) {
        const event = await this.findById(id);
        if (event.vendorId.toString() !== vendorId) {
            throw new common_1.ForbiddenException('Not authorized to reject this event');
        }
        if (event.status !== 'Pending') {
            throw new common_1.BadRequestException('Only pending events can be rejected');
        }
        const updated = await this.eventsRepository.update(id, {
            status: 'Rejected',
            remarks: rejectData.remarks,
            lastModified: new Date(),
        });
        if (!updated) {
            throw new common_1.NotFoundException('Event not found');
        }
        return updated;
    }
    async validateAccess(event, user) {
        if (user.role === 'HR_ADMIN' && event.companyId.toString() !== user.companyId) {
            throw new common_1.ForbiddenException('Not authorized to access this event');
        }
        if (user.role === 'VENDOR_ADMIN' && event.vendorId.toString() !== user.vendorId) {
            throw new common_1.ForbiddenException('Not authorized to access this event');
        }
    }
};
exports.EventsService = EventsService;
exports.EventsService = EventsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [events_repository_1.EventsRepository,
        event_items_repository_1.EventItemsRepository])
], EventsService);
//# sourceMappingURL=events.service.js.map
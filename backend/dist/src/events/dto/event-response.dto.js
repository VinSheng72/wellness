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
exports.EventResponseDto = void 0;
const swagger_1 = require("@nestjs/swagger");
class EventResponseDto {
    id;
    companyId;
    eventItemId;
    vendorId;
    proposedDates;
    location;
    status;
    confirmedDate;
    remarks;
    dateCreated;
    lastModified;
}
exports.EventResponseDto = EventResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: '507f1f77bcf86cd799439011' }),
    __metadata("design:type", String)
], EventResponseDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '507f1f77bcf86cd799439012' }),
    __metadata("design:type", String)
], EventResponseDto.prototype, "companyId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '507f1f77bcf86cd799439013' }),
    __metadata("design:type", String)
], EventResponseDto.prototype, "eventItemId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '507f1f77bcf86cd799439014' }),
    __metadata("design:type", String)
], EventResponseDto.prototype, "vendorId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        type: [String],
        example: ['2024-01-15T00:00:00.000Z', '2024-01-16T00:00:00.000Z', '2024-01-17T00:00:00.000Z'],
    }),
    __metadata("design:type", Array)
], EventResponseDto.prototype, "proposedDates", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: { postalCode: '123456', streetName: 'Main Street' },
    }),
    __metadata("design:type", Object)
], EventResponseDto.prototype, "location", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Pending', enum: ['Pending', 'Approved', 'Rejected'] }),
    __metadata("design:type", String)
], EventResponseDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '2024-01-15T00:00:00.000Z', required: false }),
    __metadata("design:type", Date)
], EventResponseDto.prototype, "confirmedDate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Unable to accommodate', required: false }),
    __metadata("design:type", String)
], EventResponseDto.prototype, "remarks", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '2024-01-10T00:00:00.000Z' }),
    __metadata("design:type", Date)
], EventResponseDto.prototype, "dateCreated", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '2024-01-10T00:00:00.000Z' }),
    __metadata("design:type", Date)
], EventResponseDto.prototype, "lastModified", void 0);
//# sourceMappingURL=event-response.dto.js.map
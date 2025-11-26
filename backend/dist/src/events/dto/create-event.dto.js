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
exports.CreateEventDto = exports.LocationDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const swagger_1 = require("@nestjs/swagger");
class LocationDto {
    postalCode;
    streetName;
}
exports.LocationDto = LocationDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, swagger_1.ApiProperty)({ example: '123456', description: 'Postal code' }),
    __metadata("design:type", String)
], LocationDto.prototype, "postalCode", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, swagger_1.ApiProperty)({ example: 'Main Street', description: 'Street name' }),
    __metadata("design:type", String)
], LocationDto.prototype, "streetName", void 0);
class CreateEventDto {
    eventItemId;
    proposedDates;
    location;
}
exports.CreateEventDto = CreateEventDto;
__decorate([
    (0, class_validator_1.IsMongoId)(),
    (0, swagger_1.ApiProperty)({
        example: '507f1f77bcf86cd799439011',
        description: 'Event item ID',
    }),
    __metadata("design:type", String)
], CreateEventDto.prototype, "eventItemId", void 0);
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ArrayMinSize)(3),
    (0, class_validator_1.ArrayMaxSize)(3),
    (0, class_validator_1.IsDateString)({}, { each: true }),
    (0, swagger_1.ApiProperty)({
        type: [String],
        example: ['2024-01-15', '2024-01-16', '2024-01-17'],
        description: 'Exactly 3 proposed dates in ISO format',
    }),
    __metadata("design:type", Array)
], CreateEventDto.prototype, "proposedDates", void 0);
__decorate([
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => LocationDto),
    (0, swagger_1.ApiProperty)({ type: LocationDto, description: 'Event location' }),
    __metadata("design:type", LocationDto)
], CreateEventDto.prototype, "location", void 0);
//# sourceMappingURL=create-event.dto.js.map
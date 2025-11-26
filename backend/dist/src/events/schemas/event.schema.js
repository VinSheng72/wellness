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
exports.EventSchema = exports.Event = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
let Event = class Event {
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
};
exports.Event = Event;
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: 'Company', required: true }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], Event.prototype, "companyId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: 'EventItem', required: true }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], Event.prototype, "eventItemId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: 'Vendor', required: true }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], Event.prototype, "vendorId", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: [Date],
        required: true,
        validate: {
            validator: function (val) {
                return val.length === 3;
            },
            message: 'Must have exactly 3 proposed dates',
        },
    }),
    __metadata("design:type", Array)
], Event.prototype, "proposedDates", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: {
            postalCode: { type: String, required: true },
            streetName: { type: String, required: true },
        },
        required: true,
        _id: false,
    }),
    __metadata("design:type", Object)
], Event.prototype, "location", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        required: true,
        enum: ['Pending', 'Approved', 'Rejected'],
        default: 'Pending',
    }),
    __metadata("design:type", String)
], Event.prototype, "status", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Date }),
    __metadata("design:type", Date)
], Event.prototype, "confirmedDate", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], Event.prototype, "remarks", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: Date.now }),
    __metadata("design:type", Date)
], Event.prototype, "dateCreated", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: Date.now }),
    __metadata("design:type", Date)
], Event.prototype, "lastModified", void 0);
exports.Event = Event = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], Event);
exports.EventSchema = mongoose_1.SchemaFactory.createForClass(Event);
exports.EventSchema.index({ companyId: 1, dateCreated: -1 });
exports.EventSchema.index({ vendorId: 1, dateCreated: -1 });
//# sourceMappingURL=event.schema.js.map
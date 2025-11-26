"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventItemsModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const event_item_schema_1 = require("./schemas/event-item.schema");
const event_items_repository_1 = require("./event-items.repository");
const event_items_service_1 = require("./event-items.service");
const event_items_controller_1 = require("./event-items.controller");
let EventItemsModule = class EventItemsModule {
};
exports.EventItemsModule = EventItemsModule;
exports.EventItemsModule = EventItemsModule = __decorate([
    (0, common_1.Module)({
        imports: [
            mongoose_1.MongooseModule.forFeature([
                { name: event_item_schema_1.EventItem.name, schema: event_item_schema_1.EventItemSchema },
            ]),
        ],
        controllers: [event_items_controller_1.EventItemsController],
        providers: [event_items_repository_1.EventItemsRepository, event_items_service_1.EventItemsService],
        exports: [event_items_repository_1.EventItemsRepository, event_items_service_1.EventItemsService],
    })
], EventItemsModule);
//# sourceMappingURL=event-items.module.js.map
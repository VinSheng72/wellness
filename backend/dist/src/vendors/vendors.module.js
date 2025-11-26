"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.VendorsModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const vendor_schema_1 = require("./schemas/vendor.schema");
const vendors_repository_1 = require("./vendors.repository");
const vendors_service_1 = require("./vendors.service");
let VendorsModule = class VendorsModule {
};
exports.VendorsModule = VendorsModule;
exports.VendorsModule = VendorsModule = __decorate([
    (0, common_1.Module)({
        imports: [
            mongoose_1.MongooseModule.forFeature([{ name: vendor_schema_1.Vendor.name, schema: vendor_schema_1.VendorSchema }]),
        ],
        providers: [vendors_repository_1.VendorsRepository, vendors_service_1.VendorsService],
        exports: [vendors_repository_1.VendorsRepository, vendors_service_1.VendorsService],
    })
], VendorsModule);
//# sourceMappingURL=vendors.module.js.map
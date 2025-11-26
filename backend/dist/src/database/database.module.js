"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DatabaseModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const config_1 = require("@nestjs/config");
const common_2 = require("@nestjs/common");
let DatabaseModule = class DatabaseModule {
};
exports.DatabaseModule = DatabaseModule;
exports.DatabaseModule = DatabaseModule = __decorate([
    (0, common_1.Module)({
        imports: [
            mongoose_1.MongooseModule.forRootAsync({
                imports: [config_1.ConfigModule],
                useFactory: async (configService) => {
                    const logger = new common_2.Logger('DatabaseModule');
                    const uri = configService.get('DATABASE_URL');
                    logger.log('Initializing database connection...');
                    return {
                        uri,
                        connectionFactory: (connection) => {
                            connection.on('connected', () => {
                                logger.log('Database connected successfully');
                            });
                            connection.on('disconnected', () => {
                                logger.warn('Database disconnected');
                            });
                            connection.on('error', (error) => {
                                logger.error('Database connection error:', error);
                            });
                            connection.on('reconnected', () => {
                                logger.log('Database reconnected');
                            });
                            return connection;
                        },
                        maxPoolSize: 10,
                        minPoolSize: 2,
                        socketTimeoutMS: 45000,
                        serverSelectionTimeoutMS: 5000,
                        retryWrites: true,
                        retryReads: true,
                    };
                },
                inject: [config_1.ConfigService],
            }),
        ],
    })
], DatabaseModule);
//# sourceMappingURL=database.module.js.map
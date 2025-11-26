import { HealthCheckService, MongooseHealthIndicator, MemoryHealthIndicator, DiskHealthIndicator } from '@nestjs/terminus';
export declare class HealthController {
    private health;
    private db;
    private memory;
    private disk;
    constructor(health: HealthCheckService, db: MongooseHealthIndicator, memory: MemoryHealthIndicator, disk: DiskHealthIndicator);
    check(): Promise<{
        uptime: number;
        timestamp: string;
        status: import("@nestjs/terminus").HealthCheckStatus;
        info?: import("@nestjs/terminus").HealthIndicatorResult;
        error?: import("@nestjs/terminus").HealthIndicatorResult;
        details: import("@nestjs/terminus").HealthIndicatorResult;
    }>;
}

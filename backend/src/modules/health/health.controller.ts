import { Controller, Get } from '@nestjs/common';
import {
  HealthCheck,
  HealthCheckService,
  MongooseHealthIndicator,
  MemoryHealthIndicator,
  DiskHealthIndicator,
} from '@nestjs/terminus';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { ApiGetResponse } from '../../common/decorators/api-responses.decorator';

@ApiTags('health')
@Controller('health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private db: MongooseHealthIndicator,
    private memory: MemoryHealthIndicator,
    private disk: DiskHealthIndicator,
  ) {}

  @Get()
  @HealthCheck()
  @ApiOperation({ summary: 'Check application health status' })
  @ApiGetResponse(Object)
  async check() {
    const startTime = process.uptime();

    const healthCheck = await this.health.check([
      // Database health check
      () => this.db.pingCheck('database'),

      // Memory health check - heap should not exceed 150MB
      () => this.memory.checkHeap('memory_heap', 150 * 1024 * 1024),

      // Memory health check - RSS should not exceed 300MB
      () => this.memory.checkRSS('memory_rss', 300 * 1024 * 1024),
    ]);

    return {
      ...healthCheck,
      uptime: Math.floor(startTime),
      timestamp: new Date().toISOString(),
    };
  }
}

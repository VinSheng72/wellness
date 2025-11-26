import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from './config/config.module';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { CompaniesModule } from './companies/companies.module';
import { VendorsModule } from './vendors/vendors.module';
import { EventItemsModule } from './event-items/event-items.module';
import { EventsModule } from './events/events.module';
import { LocationModule } from './location/location.module';
import { HealthModule } from './health/health.module';

@Module({
  imports: [
    ConfigModule,
    DatabaseModule,
    AuthModule,
    UsersModule,
    CompaniesModule,
    VendorsModule,
    EventItemsModule,
    EventsModule,
    LocationModule,
    HealthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

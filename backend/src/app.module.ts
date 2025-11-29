import { Module } from '@nestjs/common';
import { ConfigModule } from './config/config.module';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { CompaniesModule } from './modules/companies/companies.module';
import { VendorsModule } from './modules/vendors/vendors.module';
import { BookingModule } from './modules/booking/booking.module';
import { LocationModule } from './modules/location/location.module';
import { HealthModule } from './modules/health/health.module';

@Module({
  imports: [
    ConfigModule,
    DatabaseModule,
    AuthModule,
    UsersModule,
    CompaniesModule,
    VendorsModule,
    BookingModule,
    LocationModule,
    HealthModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}

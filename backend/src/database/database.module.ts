import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Logger } from '@nestjs/common';

@Module({
  imports: [
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        const logger = new Logger('DatabaseModule');
        const uri = configService.get<string>('DATABASE_URL');

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

            connection.on('error', (error: Error) => {
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
      inject: [ConfigService],
    }),
  ],
})
export class DatabaseModule {}

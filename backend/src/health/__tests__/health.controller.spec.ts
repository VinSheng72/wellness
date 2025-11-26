import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { MongooseModule } from '@nestjs/mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { HealthModule } from '../health.module';

describe('HealthController (Integration)', () => {
  let app: INestApplication;
  let mongoServer: MongoMemoryServer;

  beforeAll(async () => {
    // Start in-memory MongoDB
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        MongooseModule.forRoot(mongoUri),
        HealthModule,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
    await mongoServer.stop();
  });

  describe('GET /health', () => {
    it('should return 200 OK when database is connected', async () => {
      const response = await request(app.getHttpServer())
        .get('/health')
        .expect(200);

      expect(response.body).toHaveProperty('status', 'ok');
      expect(response.body).toHaveProperty('info');
      expect(response.body).toHaveProperty('details');
      expect(response.body).toHaveProperty('uptime');
      expect(response.body).toHaveProperty('timestamp');
    });

    it('should include database health status', async () => {
      const response = await request(app.getHttpServer())
        .get('/health')
        .expect(200);

      expect(response.body.info).toHaveProperty('database');
      expect(response.body.info.database).toHaveProperty('status', 'up');
      expect(response.body.details).toHaveProperty('database');
      expect(response.body.details.database).toHaveProperty('status', 'up');
    });

    it('should include memory health indicators', async () => {
      const response = await request(app.getHttpServer())
        .get('/health')
        .expect(200);

      expect(response.body.info).toHaveProperty('memory_heap');
      expect(response.body.info).toHaveProperty('memory_rss');
      expect(response.body.details).toHaveProperty('memory_heap');
      expect(response.body.details).toHaveProperty('memory_rss');
    });

    it('should include uptime as a number', async () => {
      const response = await request(app.getHttpServer())
        .get('/health')
        .expect(200);

      expect(typeof response.body.uptime).toBe('number');
      expect(response.body.uptime).toBeGreaterThanOrEqual(0);
    });

    it('should include timestamp in ISO format', async () => {
      const response = await request(app.getHttpServer())
        .get('/health')
        .expect(200);

      expect(response.body.timestamp).toBeDefined();
      // Validate ISO 8601 format
      const timestamp = new Date(response.body.timestamp);
      expect(timestamp.toISOString()).toBe(response.body.timestamp);
    });

    it('should return consistent response format', async () => {
      const response = await request(app.getHttpServer())
        .get('/health')
        .expect(200);

      // Verify the response has all required fields
      expect(response.body).toMatchObject({
        status: expect.any(String),
        info: expect.any(Object),
        details: expect.any(Object),
        uptime: expect.any(Number),
        timestamp: expect.any(String),
      });
    });
  });
});

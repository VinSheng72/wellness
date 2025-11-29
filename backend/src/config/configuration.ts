import { registerAs } from '@nestjs/config';

export default registerAs('app', () => ({
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3001', 10),
  apiPrefix: process.env.API_PREFIX || 'api/v1',

  database: {
    url: process.env.DATABASE_URL,
  },

  jwt: {
    secret: process.env.JWT_SECRET,
    accessTokenExpiration: process.env.JWT_ACCESS_TOKEN_EXPIRATION || '15m',
    refreshTokenExpiration: process.env.JWT_REFRESH_TOKEN_EXPIRATION || '7d',
  },

  cors: {
    frontendUrl: process.env.FRONTEND_URL,
  },

  swagger: {
    enabled: process.env.SWAGGER_ENABLED === 'true',
    path: process.env.SWAGGER_PATH || 'api/docs',
  },

  logging: {
    level: process.env.LOG_LEVEL || 'info',
  },
}));

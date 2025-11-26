import { plainToInstance } from 'class-transformer';
import {
  IsEnum,
  IsNumber,
  IsString,
  IsNotEmpty,
  validateSync,
  IsOptional,
  IsBoolean,
} from 'class-validator';

enum Environment {
  Development = 'development',
  Production = 'production',
  Test = 'test',
}

class EnvironmentVariables {
  @IsEnum(Environment)
  @IsOptional()
  NODE_ENV: Environment = Environment.Development;

  @IsNumber()
  @IsOptional()
  PORT: number = 3001;

  @IsString()
  @IsNotEmpty()
  DATABASE_URL!: string;

  @IsString()
  @IsNotEmpty()
  JWT_SECRET!: string;

  @IsString()
  @IsNotEmpty()
  JWT_REFRESH_SECRET!: string;

  @IsString()
  @IsOptional()
  JWT_EXPIRATION: string = '15m';

  @IsString()
  @IsOptional()
  JWT_REFRESH_EXPIRATION: string = '7d';

  @IsString()
  @IsNotEmpty()
  FRONTEND_URL!: string;

  @IsString()
  @IsOptional()
  API_PREFIX: string = 'api/v1';

  @IsBoolean()
  @IsOptional()
  SWAGGER_ENABLED: boolean = true;

  @IsString()
  @IsOptional()
  SWAGGER_PATH: string = 'api/docs';

  @IsString()
  @IsOptional()
  LOG_LEVEL: string = 'info';
}

export function validate(config: Record<string, unknown>) {
  // Manually convert boolean strings to actual booleans
  const processedConfig = { ...config };
  if (typeof processedConfig.SWAGGER_ENABLED === 'string') {
    processedConfig.SWAGGER_ENABLED =
      processedConfig.SWAGGER_ENABLED.toLowerCase() === 'true';
  }

  const validatedConfig = plainToInstance(EnvironmentVariables, processedConfig, {
    enableImplicitConversion: true,
  });

  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
  });

  if (errors.length > 0) {
    const missingVars = errors
      .map((error) => {
        const constraints = Object.values(error.constraints || {});
        return `  - ${error.property}: ${constraints.join(', ')}`;
      })
      .join('\n');

    throw new Error(
      `Configuration validation failed. Please check your environment variables:\n${missingVars}`,
    );
  }

  return validatedConfig;
}

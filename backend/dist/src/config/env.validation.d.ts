declare enum Environment {
    Development = "development",
    Production = "production",
    Test = "test"
}
declare class EnvironmentVariables {
    NODE_ENV: Environment;
    PORT: number;
    DATABASE_URL: string;
    JWT_SECRET: string;
    JWT_REFRESH_SECRET: string;
    JWT_EXPIRATION: string;
    JWT_REFRESH_EXPIRATION: string;
    FRONTEND_URL: string;
    API_PREFIX: string;
    SWAGGER_ENABLED: boolean;
    SWAGGER_PATH: string;
    LOG_LEVEL: string;
}
export declare function validate(config: Record<string, unknown>): EnvironmentVariables;
export {};

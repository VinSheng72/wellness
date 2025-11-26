declare const _default: (() => {
    nodeEnv: string;
    port: number;
    apiPrefix: string;
    database: {
        url: string | undefined;
    };
    jwt: {
        secret: string | undefined;
        accessTokenExpiration: string;
        refreshTokenExpiration: string;
    };
    cors: {
        frontendUrl: string | undefined;
    };
    swagger: {
        enabled: boolean;
        path: string;
    };
    logging: {
        level: string;
    };
}) & import("@nestjs/config").ConfigFactoryKeyHost<{
    nodeEnv: string;
    port: number;
    apiPrefix: string;
    database: {
        url: string | undefined;
    };
    jwt: {
        secret: string | undefined;
        accessTokenExpiration: string;
        refreshTokenExpiration: string;
    };
    cors: {
        frontendUrl: string | undefined;
    };
    swagger: {
        enabled: boolean;
        path: string;
    };
    logging: {
        level: string;
    };
}>;
export default _default;

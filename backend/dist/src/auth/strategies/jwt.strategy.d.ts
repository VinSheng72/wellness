import { Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { UsersRepository } from '../../users/users.repository';
export interface JwtPayload {
    sub: string;
    username: string;
    role: string;
    companyId?: string;
    vendorId?: string;
}
declare const JwtStrategy_base: new (...args: [opt: import("passport-jwt").StrategyOptionsWithRequest] | [opt: import("passport-jwt").StrategyOptionsWithoutRequest]) => Strategy & {
    validate(...args: any[]): unknown;
};
export declare class JwtStrategy extends JwtStrategy_base {
    private configService;
    private usersRepository;
    constructor(configService: ConfigService, usersRepository: UsersRepository);
    validate(payload: JwtPayload): Promise<{
        id: string;
        username: string;
        role: string;
        companyId: string | undefined;
        vendorId: string | undefined;
    }>;
}
export {};

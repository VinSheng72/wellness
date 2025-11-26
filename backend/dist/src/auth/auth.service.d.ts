import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UsersRepository } from '../users/users.repository';
import { LoginDto } from './dto/login.dto';
import { AuthResponseDto } from './dto/auth-response.dto';
import { UserDocument } from '../users/schemas/user.schema';
export declare class AuthService {
    private usersRepository;
    private jwtService;
    private configService;
    constructor(usersRepository: UsersRepository, jwtService: JwtService, configService: ConfigService);
    login(loginDto: LoginDto): Promise<AuthResponseDto>;
    validateUser(username: string, password: string): Promise<UserDocument | null>;
    generateTokens(user: UserDocument): Promise<AuthResponseDto>;
    refreshToken(refreshToken: string): Promise<AuthResponseDto>;
    logout(userId: string): Promise<void>;
}

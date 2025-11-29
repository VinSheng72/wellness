import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { UsersRepository } from '../../users/users.repository';
import { JwtPayload, AuthenticatedUser } from '../../../common/types/auth.types';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private usersRepository: UsersRepository,
  ) {
    const secret = configService.get<string>('JWT_SECRET');
    if (!secret) {
      throw new Error('JWT_SECRET is not defined');
    }
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: secret,
    });
  }

  async validate(payload: JwtPayload): Promise<AuthenticatedUser> {
    const user = await this.usersRepository.findById(payload.sub);

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return {
      id: user._id.toString(),
      username: user.username,
      role: user.role,
      companyId: user.companyId?.toString(),
      vendorId: user.vendorId?.toString(),
    };
  }
}

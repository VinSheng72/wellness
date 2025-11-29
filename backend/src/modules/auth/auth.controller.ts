import { Controller, Post, Body, HttpCode } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { AuthResponseDto } from './dto/auth-response.dto';
import { User } from '../../common/decorators/current-user.decorator';
import { ApiAuth } from '../../common/decorators/api-auth.decorator';
import { ApiGetResponse } from '../../common/decorators/api-responses.decorator';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  @HttpCode(200)
  @ApiOperation({ summary: 'User login' })
  @ApiGetResponse(AuthResponseDto)
  async login(@Body() loginDto: LoginDto): Promise<AuthResponseDto> {
    return this.authService.login(loginDto);
  }

  @Post('refresh')
  @HttpCode(200)
  @ApiOperation({ summary: 'Refresh access token' })
  @ApiGetResponse(AuthResponseDto)
  async refresh(@Body() refreshDto: RefreshTokenDto): Promise<AuthResponseDto> {
    return this.authService.refreshToken(refreshDto.refreshToken);
  }

  @Post('logout')
  @ApiAuth()
  @HttpCode(204)
  @ApiOperation({ summary: 'User logout' })
  async logout(@User() user: any): Promise<void> {
    return this.authService.logout(user.id);
  }
}

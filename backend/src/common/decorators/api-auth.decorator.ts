import { applyDecorators, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from './roles.decorator';
import { UserRole } from '../enums/user-role.enum';

export function ApiAuth() {
  return applyDecorators(
    UseGuards(JwtAuthGuard),
    ApiBearerAuth('JWT-auth'),
    ApiUnauthorizedResponse({ description: 'Unauthorized' }),
  );
}

export function ApiAuthWithRoles(...roles: UserRole[]) {
  return applyDecorators(
    UseGuards(JwtAuthGuard, RolesGuard),
    Roles(...roles),
    ApiBearerAuth('JWT-auth'),
    ApiUnauthorizedResponse({ description: 'Unauthorized' }),
  );
}

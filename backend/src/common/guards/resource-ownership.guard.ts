import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole } from '../enums/user-role.enum';

@Injectable()
export class ResourceOwnershipGuard implements CanActivate {
  private readonly logger = new Logger(ResourceOwnershipGuard.name);

  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const resource = request.resource; // Resource should be set by controller/interceptor

    if (!user) {
      this.logger.error('No user found in request');
      throw new ForbiddenException('Authentication required');
    }

    if (!resource) {
      return true;
    }

    return this.validateOwnership(resource, user);
  }

  private validateOwnership(resource: any, user: any): boolean {
    if (user.role === UserRole.HR_ADMIN) {
      return this.validateHRAdminOwnership(resource, user);
    }

    if (user.role === UserRole.VENDOR_ADMIN) {
      return this.validateVendorAdminOwnership(resource, user);
    }

    this.logger.warn('Unknown role attempting access', {
      userId: user.id,
      role: user.role,
    });
    throw new ForbiddenException('Not authorized to access this resource');
  }

  private validateHRAdminOwnership(resource: any, user: any): boolean {
    if (!user.companyId) {
      this.logger.error('HR Admin user missing companyId', { userId: user.id });
      throw new ForbiddenException('Not authorized to access this resource');
    }

    const resourceCompanyId = resource.companyId?.toString();
    const userCompanyId = user.companyId;

    if (!resourceCompanyId || resourceCompanyId !== userCompanyId) {
      this.logger.warn('CompanyId mismatch', {
        userId: user.id,
        userCompanyId,
        resourceCompanyId,
      });
      throw new ForbiddenException('Not authorized to access this resource');
    }

    this.logger.debug('HR Admin authorization successful', {
      userId: user.id,
      companyId: userCompanyId,
    });
    return true;
  }

  private validateVendorAdminOwnership(resource: any, user: any): boolean {
    if (!user.vendorId) {
      this.logger.error('Vendor Admin user missing vendorId', { userId: user.id });
      throw new ForbiddenException('Not authorized to access this resource');
    }

    const resourceVendorId = resource.vendorId?.toString();
    const userVendorId = user.vendorId;

    if (!resourceVendorId || resourceVendorId !== userVendorId) {
      this.logger.warn('VendorId mismatch', {
        userId: user.id,
        userVendorId,
        resourceVendorId,
      });
      throw new ForbiddenException('Not authorized to access this resource');
    }

    this.logger.debug('Vendor Admin authorization successful', {
      userId: user.id,
      vendorId: userVendorId,
    });
    return true;
  }
}

import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // If no roles are specified, allow access (AuthGuard already verified authentication)
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user || !user.roles) {
      throw new ForbiddenException('Access denied: no roles assigned.');
    }

    const userRoles = (user.roles || []).map((r: string) => String(r).toUpperCase());
    const normalizedRequired = requiredRoles.map((r: string) => String(r).toUpperCase());

    const hasRole = normalizedRequired.some((role) => userRoles.includes(role));
    if (!hasRole) {
      throw new ForbiddenException(
        `Access denied: requires one of [${normalizedRequired.join(', ')}]. Your roles: [${userRoles.join(', ')}].`
      );
    }

    return true;
  }
}

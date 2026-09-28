import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Optional,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import * as jwt from 'jsonwebtoken';
import { PrismaService } from '../prisma/prisma.service';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

export interface JwtPayload {
  sub: string;
  email: string;
  roles: string[];
  organizationId: string;
  iat: number;
  exp: number;
}

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly prisma: PrismaService,
    @Optional() private readonly reflector?: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    if (this.reflector) {
      const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
        context.getHandler(),
        context.getClass(),
      ]);
      if (isPublic) {
        return true;
      }
    }
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers['authorization'];

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Missing or invalid Authorization header. Expected: Bearer <token>');
    }

    const token = authHeader.slice(7);
    const secret = process.env.JWT_SECRET || 'trusttrace-production-secure-jwt-key-2026';

    try {
      const payload = jwt.verify(token, secret) as JwtPayload;

      // Verify user still exists and is active
      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
        include: {
          organization: true,
          roles: { include: { role: true } },
        },
      });

      if (!user || user.status !== 'ACTIVE') {
        throw new UnauthorizedException('User account is inactive or not found.');
      }

      // Attach user to request for downstream use
      request.user = {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        organizationId: user.organizationId,
        organizationName: user.organization?.name,
        organizationCode: user.organization?.organizationCode,
        organizationType: user.organization?.organizationType,
        roles: user.roles.map((r) => r.role.name),
      };

      return true;
    } catch (err) {
      if (err instanceof UnauthorizedException) throw err;
      if ((err as any)?.name === 'TokenExpiredError') {
        throw new UnauthorizedException('Token has expired. Please log in again.');
      }
      throw new UnauthorizedException('Invalid or malformed token.');
    }
  }
}

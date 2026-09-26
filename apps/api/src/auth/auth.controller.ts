import { Body, Controller, Get, Post, UnauthorizedException, Headers } from '@nestjs/common';
import { sha256 } from '@trusttrace/crypto';
import { PrismaService } from '../common/prisma/prisma.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly prisma: PrismaService) {}

  @Post('login')
  async login(@Body() body: { email?: string; password?: string }) {
    const email = body.email || 'admin@trusttrace.local';
    const user = await this.prisma.user.findUnique({
      where: { email },
      include: {
        organization: true,
        roles: { include: { role: true } }
      }
    });

    if (!user) {
      throw new UnauthorizedException(`User with email '${email}' not found.`);
    }

    const tokenPayload = `${user.id}:${user.email}:${Date.now()}:${process.env.JWT_SECRET || 'trusttrace-secret'}`;
    const accessToken = `tt-jwt.${Buffer.from(JSON.stringify({ sub: user.id, email: user.email })).toString('base64url')}.${sha256(tokenPayload).slice(0, 32)}`;

    return {
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        name: `${user.firstName} ${user.lastName}`,
        organizationId: user.organizationId,
        organizationName: user.organization?.name,
        organizationCode: user.organization?.organizationCode,
        roles: user.roles.map((r) => r.role.name)
      }
    };
  }

  @Post('logout')
  logout() {
    return { ok: true, message: 'Logged out successfully' };
  }

  @Get('me')
  async me(@Headers('authorization') authHeader?: string) {
    // If bearer token provided with sub, parse it; otherwise default to primary admin
    let email = 'admin@trusttrace.local';
    if (authHeader && authHeader.startsWith('Bearer tt-jwt.')) {
      try {
        const parts = authHeader.split('.');
        if (parts[1]) {
          const payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString('utf-8'));
          if (payload.email) email = payload.email;
        }
      } catch {
        // fallback
      }
    }

    const user = await this.prisma.user.findUnique({
      where: { email },
      include: {
        organization: true,
        roles: { include: { role: true } }
      }
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return {
      id: user.id,
      email: user.email,
      name: `${user.firstName} ${user.lastName}`,
      organizationId: user.organizationId,
      organizationName: user.organization?.name,
      organizationCode: user.organization?.organizationCode,
      roles: user.roles.map((r) => r.role.name)
    };
  }
}

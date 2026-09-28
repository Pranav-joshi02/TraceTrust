import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from '../common/guards/auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Public } from '../common/decorators/public.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('register')
  register(@Body() body: { email: string; password: string; firstName: string; lastName: string; organizationCode?: string }) {
    return this.authService.register(body);
  }

  @Public()
  @Post('login')
  login(@Body() body: { email?: string; password?: string }) {
    return this.authService.login(body);
  }

  @Post('logout')
  @UseGuards(AuthGuard)
  logout() {
    return { ok: true, message: 'Logged out successfully. Token should be discarded by client.' };
  }

  @Get('me')
  @UseGuards(AuthGuard)
  me(@CurrentUser('id') userId: string) {
    return this.authService.me(userId);
  }
}

import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { EventsService } from './events.service';
import { TrustService } from '../trust/trust.service';
import { AuthGuard } from '../common/guards/auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('events')
@UseGuards(AuthGuard, RolesGuard)
export class EventsController {
  constructor(
    private readonly events: EventsService,
    private readonly trust: TrustService
  ) {}

  @Post()
  @Roles('ADMIN', 'OPERATOR')
  create(@Body() body: Record<string, unknown>, @CurrentUser() user: any) {
    return this.events.create(body, user);
  }

  @Get()
  list() {
    return this.events.list();
  }

  @Get(':id')
  show(@Param('id') id: string) {
    return this.events.show(id);
  }

  @Post(':id/verify')
  verify(@Param('id') id: string) {
    return this.trust.verifyEvent(id);
  }
}

import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { EventsService } from './events.service';
import { TrustService } from '../trust/trust.service';
import { AuthGuard } from '../common/guards/auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@Controller('events')
@UseGuards(AuthGuard, RolesGuard)
export class EventsController {
  constructor(
    private readonly events: EventsService,
    private readonly trust: TrustService
  ) {}

  @Post()
  @Roles('admin', 'operator')
  create(@Body() body: Record<string, unknown>) {
    return this.events.create(body);
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

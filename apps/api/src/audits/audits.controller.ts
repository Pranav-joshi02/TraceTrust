import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { AuditsService } from './audits.service';
import { AuthGuard } from '../common/guards/auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';

@Controller(['audits', 'audit'])
@UseGuards(AuthGuard, RolesGuard)
export class AuditsController {
  constructor(private readonly audits: AuditsService) {}

  @Get()
  list() {
    return this.audits.list();
  }

  @Get('batch/:batchId')
  forBatch(@Param('batchId') batchId: string) {
    return this.audits.forBatch(batchId);
  }

  @Get('event/:eventId')
  forEvent(@Param('eventId') eventId: string) {
    return this.audits.forEvent(eventId);
  }
}

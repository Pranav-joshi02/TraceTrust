import { Controller, Get, Param } from '@nestjs/common';
import { AuditsService } from './audits.service';

@Controller(['audits', 'audit'])
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

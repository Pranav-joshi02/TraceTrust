import { Controller, Get, Param } from '@nestjs/common';
import { TraceabilityService } from './traceability.service';

@Controller('trace')
export class TraceabilityController {
  constructor(private readonly traceability: TraceabilityService) {}

  @Get(':batchId')
  trace(@Param('batchId') batchId: string) {
    return this.traceability.trace(batchId);
  }

  @Get(':batchId/forward')
  forward(@Param('batchId') batchId: string) {
    return this.traceability.trace(batchId);
  }

  @Get(':batchId/backward')
  backward(@Param('batchId') batchId: string) {
    return this.traceability.trace(batchId, true);
  }
}

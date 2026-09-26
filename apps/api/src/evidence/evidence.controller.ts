import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { EvidenceService } from './evidence.service';

@Controller('evidence')
export class EvidenceController {
  constructor(private readonly evidence: EvidenceService) {}

  @Post()
  create(@Body() body: Record<string, unknown>) {
    return this.evidence.create(body);
  }

  @Get()
  list() {
    return this.evidence.list();
  }

  @Get(':id')
  show(@Param('id') id: string) {
    return this.evidence.show(id);
  }

  @Post(':id/verify')
  verify(@Param('id') id: string, @Body() body: Record<string, unknown>) {
    return this.evidence.verify(id, body);
  }
}

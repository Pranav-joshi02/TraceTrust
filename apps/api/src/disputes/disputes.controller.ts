import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { DisputesService } from './disputes.service';

@Controller('disputes')
export class DisputesController {
  constructor(private readonly disputes: DisputesService) {}

  @Post()
  create(@Body() body: Record<string, unknown>) {
    return this.disputes.create(body);
  }

  @Get()
  list() {
    return this.disputes.list();
  }

  @Get(':id')
  show(@Param('id') id: string) {
    return this.disputes.show(id);
  }
}

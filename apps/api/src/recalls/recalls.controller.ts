import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { RecallsService } from './recalls.service';

@Controller('recalls')
export class RecallsController {
  constructor(private readonly recalls: RecallsService) {}

  @Post()
  create(@Body() body: Record<string, unknown>) {
    return this.recalls.create(body);
  }

  @Get()
  list() {
    return this.recalls.list();
  }

  @Get(':id')
  show(@Param('id') id: string) {
    return this.recalls.show(id);
  }

  @Get(':id/impact')
  impact(@Param('id') id: string) {
    return this.recalls.impact(id);
  }
}

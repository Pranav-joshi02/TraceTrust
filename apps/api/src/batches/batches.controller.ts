import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { BatchesService } from './batches.service';

@Controller('batches')
export class BatchesController {
  constructor(private readonly batches: BatchesService) {}

  @Post()
  create(@Body() body: Record<string, unknown>) {
    return this.batches.create(body);
  }

  @Get()
  list() {
    return this.batches.list();
  }

  @Get(':id')
  show(@Param('id') id: string) {
    return this.batches.show(id);
  }
}

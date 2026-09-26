import { Body, Controller, Get, Post } from '@nestjs/common';
import { DocumentsService } from './documents.service';

@Controller('documents')
export class DocumentsController {
  constructor(private readonly documents: DocumentsService) {}

  @Post()
  create(@Body() body: Record<string, unknown>) {
    return this.documents.create(body);
  }

  @Get()
  list() {
    return this.documents.list();
  }
}

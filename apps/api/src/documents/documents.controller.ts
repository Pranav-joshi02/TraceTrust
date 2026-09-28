import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { DocumentsService } from './documents.service';
import { AuthGuard } from '../common/guards/auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';

@Controller('documents')
@UseGuards(AuthGuard, RolesGuard)
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

import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { CertificatesService } from './certificates.service';

@Controller('certificates')
export class CertificatesController {
  constructor(private readonly certificates: CertificatesService) {}

  @Post()
  create(@Body() body: Record<string, unknown>) {
    return this.certificates.create(body);
  }

  @Get()
  list() {
    return this.certificates.list();
  }

  @Get(':id')
  show(@Param('id') id: string) {
    return this.certificates.show(id);
  }
}

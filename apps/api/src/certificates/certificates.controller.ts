import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { CertificatesService } from './certificates.service';
import { AuthGuard } from '../common/guards/auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@Controller('certificates')
@UseGuards(AuthGuard, RolesGuard)
export class CertificatesController {
  constructor(private readonly certificates: CertificatesService) {}

  @Post()
  @Roles('admin', 'auditor')
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

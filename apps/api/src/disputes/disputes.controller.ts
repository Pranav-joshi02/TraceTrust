import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { DisputesService } from './disputes.service';
import { AuthGuard } from '../common/guards/auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@Controller('disputes')
@UseGuards(AuthGuard, RolesGuard)
export class DisputesController {
  constructor(private readonly disputes: DisputesService) {}

  @Post()
  @Roles('admin', 'operator', 'auditor')
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

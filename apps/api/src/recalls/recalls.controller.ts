import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { RecallsService } from './recalls.service';
import { AuthGuard } from '../common/guards/auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@Controller('recalls')
@UseGuards(AuthGuard, RolesGuard)
export class RecallsController {
  constructor(private readonly recalls: RecallsService) {}

  @Post()
  @Roles('admin', 'operator')
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

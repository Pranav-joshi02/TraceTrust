import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { BatchesService } from './batches.service';
import { AuthGuard } from '../common/guards/auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Public } from '../common/decorators/public.decorator';

@Controller('batches')
@UseGuards(AuthGuard, RolesGuard)
export class BatchesController {
  constructor(private readonly batches: BatchesService) {}

  @Post()
  @Roles('ADMIN', 'OPERATOR')
  create(@Body() body: Record<string, unknown>, @CurrentUser() user: any) {
    return this.batches.create(body, user);
  }

  @Get()
  @Public()
  list() {
    return this.batches.list();
  }

  @Get(':id')
  @Public()
  show(@Param('id') id: string) {
    return this.batches.show(id);
  }
}

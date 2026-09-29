import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { OrganizationsService } from './organizations.service';
import { AuthGuard } from '../common/guards/auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Public } from '../common/decorators/public.decorator';

@Controller('organizations')
@UseGuards(AuthGuard, RolesGuard)
export class OrganizationsController {
  constructor(private readonly organizations: OrganizationsService) {}

  @Post()
  @Roles('ADMIN')
  create(@Body() body: Record<string, unknown>) {
    return this.organizations.create(body);
  }

  @Get()
  @Public()
  list() {
    return this.organizations.list();
  }

  @Get(':id')
  @Public()
  show(@Param('id') id: string) {
    return this.organizations.show(id);
  }
}

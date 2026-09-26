import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { OrganizationsService } from './organizations.service';

@Controller('organizations')
export class OrganizationsController {
  constructor(private readonly organizations: OrganizationsService) {}

  @Post()
  create(@Body() body: Record<string, unknown>) {
    return this.organizations.create(body);
  }

  @Get()
  list() {
    return this.organizations.list();
  }

  @Get(':id')
  show(@Param('id') id: string) {
    return this.organizations.show(id);
  }
}

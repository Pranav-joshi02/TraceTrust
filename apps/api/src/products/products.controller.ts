import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ProductsService } from './products.service';
import { AuthGuard } from '../common/guards/auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('products')
@UseGuards(AuthGuard, RolesGuard)
export class ProductsController {
  constructor(private readonly products: ProductsService) {}

  @Post()
  @Roles('ADMIN', 'OPERATOR')
  create(@Body() body: Record<string, unknown>, @CurrentUser() user: any) {
    return this.products.create(body, user);
  }

  @Get()
  list() {
    return this.products.list();
  }

  @Get(':id')
  show(@Param('id') id: string) {
    return this.products.show(id);
  }
}

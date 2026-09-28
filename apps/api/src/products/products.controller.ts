import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ProductsService } from './products.service';
import { AuthGuard } from '../common/guards/auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@Controller('products')
@UseGuards(AuthGuard, RolesGuard)
export class ProductsController {
  constructor(private readonly products: ProductsService) {}

  @Post()
  @Roles('admin', 'operator')
  create(@Body() body: Record<string, unknown>) {
    return this.products.create(body);
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

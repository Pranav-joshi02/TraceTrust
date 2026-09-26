import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ProductsService } from './products.service';

@Controller('products')
export class ProductsController {
  constructor(private readonly products: ProductsService) {}

  @Post()
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

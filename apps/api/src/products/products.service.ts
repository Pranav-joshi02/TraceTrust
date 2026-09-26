import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(body: Record<string, unknown>) {
    const organization = await this.prisma.organization.findFirst({
      where: { OR: [{ id: String(body.organizationId ?? '') }, { organizationCode: String(body.organizationCode ?? 'SUPPLIER-001') }] }
    });
    if (!organization) throw new NotFoundException('Organization not found');

    return this.prisma.product.create({
      data: {
        organizationId: organization.id,
        productCode: String(body.productCode ?? `PROD-${Date.now()}`),
        sku: body.sku ? String(body.sku) : undefined,
        gtin: body.gtin ? String(body.gtin) : undefined,
        name: String(body.name ?? body.productName ?? 'Untitled Product'),
        description: body.description ? String(body.description) : undefined,
        category: body.category ? String(body.category) : undefined,
        unitOfMeasure: body.unitOfMeasure ? String(body.unitOfMeasure) : undefined,
        status: String(body.status ?? 'ACTIVE') as never,
        metadata: body.metadata as never
      }
    });
  }

  list() {
    return this.prisma.product.findMany({ include: { organization: true, batches: true }, orderBy: { createdAt: 'desc' } });
  }

  async show(id: string) {
    const product = await this.prisma.product.findFirst({
      where: { OR: [{ id }, { productCode: id }] },
      include: { organization: true, batches: { include: { events: true } } }
    });
    if (!product) throw new NotFoundException('Product not found');
    return product;
  }
}

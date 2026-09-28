import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';

@Injectable()
export class BatchesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(body: Record<string, unknown>, user?: any) {
    const product = await this.prisma.product.findFirst({
      where: { OR: [{ id: String(body.productId ?? '') }, { productCode: String(body.productCode ?? body.product ?? '') }] }
    });
    if (!product) throw new NotFoundException('Product not found');

    // Determine owner organization: non-admins are locked to their own org
    let ownerOrgId: string;
    const isAdmin = user?.roles?.includes('ADMIN');

    if (user?.organizationId && !isAdmin) {
      ownerOrgId = user.organizationId;
    } else {
      const owner = await this.prisma.organization.findFirst({
        where: { OR: [{ id: String(body.currentOwnerOrgId ?? '') }, { organizationCode: String(body.ownerCode ?? body.currentOwner ?? '') }] }
      });
      if (!owner) throw new NotFoundException('Owner organization not found');
      ownerOrgId = owner.id;
    }

    const owner = await this.prisma.organization.findUnique({ where: { id: ownerOrgId } });
    if (!owner) throw new NotFoundException('Owner organization not found');

    return this.prisma.batch.create({
      data: {
        productId: product.id,
        batchCode: String(body.batchCode ?? `BATCH-${Date.now()}`),
        quantity: Number(body.quantity ?? 0),
        unit: String(body.unit ?? product.unitOfMeasure ?? 'unit'),
        productionDate: body.productionDate ? new Date(String(body.productionDate)) : undefined,
        expiryDate: body.expiryDate ? new Date(String(body.expiryDate)) : undefined,
        currentOwnerOrgId: owner.id,
        status: String(body.status ?? 'CREATED') as never,
        originLocation: body.originLocation ? String(body.originLocation) : undefined,
        metadata: body.metadata as never
      }
    });
  }

  list() {
    return this.prisma.batch.findMany({ include: { product: true, currentOwner: true }, orderBy: { createdAt: 'desc' } });
  }

  async show(id: string) {
    const batch = await this.prisma.batch.findFirst({
      where: { OR: [{ id }, { batchCode: id }] },
      include: { product: true, currentOwner: true, events: { orderBy: { eventTime: 'asc' } } }
    });
    if (!batch) throw new NotFoundException('Batch not found');
    return batch;
  }
}

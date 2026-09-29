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

    // Determine owner organization: explicit override if provided (admins), otherwise user org or product org
    let ownerOrgId: string | undefined = undefined;
    const isAdmin = user?.roles?.includes('ADMIN');
    const explicitOwnerCodeOrId = body.currentOwnerOrgId || body.ownerCode || body.currentOwner;

    if (isAdmin && explicitOwnerCodeOrId) {
      const owner = await this.prisma.organization.findFirst({
        where: { OR: [{ id: String(explicitOwnerCodeOrId) }, { organizationCode: String(explicitOwnerCodeOrId) }] }
      });
      if (!owner) throw new NotFoundException(`Owner organization '${explicitOwnerCodeOrId}' not found`);
      ownerOrgId = owner.id;
    } else if (user?.organizationId) {
      ownerOrgId = user.organizationId;
    } else if (explicitOwnerCodeOrId) {
      const owner = await this.prisma.organization.findFirst({
        where: { OR: [{ id: String(explicitOwnerCodeOrId) }, { organizationCode: String(explicitOwnerCodeOrId) }] }
      });
      if (!owner) throw new NotFoundException(`Owner organization '${explicitOwnerCodeOrId}' not found`);
      ownerOrgId = owner.id;
    } else if (product.organizationId) {
      ownerOrgId = product.organizationId;
    } else {
      const firstOrg = await this.prisma.organization.findFirst();
      if (!firstOrg) throw new NotFoundException('Owner organization not found');
      ownerOrgId = firstOrg.id;
    }

    const owner = await this.prisma.organization.findUnique({ where: { id: ownerOrgId } });
    if (!owner) throw new NotFoundException('Owner organization not found');

    const batchCode = String(body.batchCode ?? `BATCH-${Date.now()}`);
    return this.prisma.batch.upsert({
      where: { batchCode },
      update: {
        productId: product.id,
        quantity: Number(body.quantity ?? 0),
        unit: String(body.unit ?? product.unitOfMeasure ?? 'unit'),
        productionDate: body.productionDate ? new Date(String(body.productionDate)) : undefined,
        expiryDate: body.expiryDate ? new Date(String(body.expiryDate)) : undefined,
        currentOwnerOrgId: owner.id,
        originLocation: body.originLocation ? String(body.originLocation) : undefined,
        metadata: body.metadata as never
      },
      create: {
        productId: product.id,
        batchCode,
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

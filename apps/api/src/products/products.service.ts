import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(body: Record<string, unknown>, user?: any) {
    // Determine organization: explicit override if provided (admins), otherwise fall back to user's org
    let orgId: string | undefined = undefined;
    const isAdmin = user?.roles?.includes('ADMIN');
    const explicitOrgCodeOrId = body.organizationId || body.organizationCode;

    if (isAdmin && explicitOrgCodeOrId) {
      const organization = await this.prisma.organization.findFirst({
        where: { OR: [{ id: String(explicitOrgCodeOrId) }, { organizationCode: String(explicitOrgCodeOrId) }] }
      });
      if (!organization) throw new NotFoundException(`Organization '${explicitOrgCodeOrId}' not found`);
      orgId = organization.id;
    } else if (user?.organizationId) {
      orgId = user.organizationId;
    } else if (explicitOrgCodeOrId) {
      const organization = await this.prisma.organization.findFirst({
        where: { OR: [{ id: String(explicitOrgCodeOrId) }, { organizationCode: String(explicitOrgCodeOrId) }] }
      });
      if (!organization) throw new NotFoundException(`Organization '${explicitOrgCodeOrId}' not found`);
      orgId = organization.id;
    } else {
      const firstOrg = await this.prisma.organization.findFirst();
      if (!firstOrg) throw new NotFoundException('No registered organization found');
      orgId = firstOrg.id;
    }

    const organization = await this.prisma.organization.findUnique({ where: { id: orgId } });
    if (!organization) throw new NotFoundException('Organization not found');

    const code = String(body.productCode ?? `PROD-${Date.now()}`);
    return this.prisma.product.upsert({
      where: { productCode: code },
      update: {
        sku: body.sku ? String(body.sku) : undefined,
        gtin: body.gtin ? String(body.gtin) : undefined,
        name: String(body.name ?? body.productName ?? 'Untitled Product'),
        description: body.description ? String(body.description) : undefined,
        category: body.category ? String(body.category) : undefined,
        unitOfMeasure: body.unitOfMeasure ? String(body.unitOfMeasure) : undefined,
        metadata: body.metadata as never
      },
      create: {
        organizationId: organization.id,
        productCode: code,
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

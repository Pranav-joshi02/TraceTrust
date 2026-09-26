import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';

@Injectable()
export class RecallsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(body: Record<string, unknown>) {
    const organization = await this.prisma.organization.findFirst({
      where: { OR: [{ id: String(body.initiatedByOrgId ?? '') }, { organizationCode: String(body.organizationCode ?? 'SUPPLIER-001') }] }
    });
    if (!organization) throw new NotFoundException('Organization not found');

    const recall = await this.prisma.recall.create({
      data: {
        recallCode: String(body.recallCode ?? `R-${Date.now()}`),
        initiatedByOrgId: organization.id,
        reason: String(body.reason ?? 'Recall investigation opened.'),
        severity: String(body.severity ?? 'MEDIUM') as never,
        status: String(body.status ?? 'OPEN') as never
      }
    });

    const batchCode = body.batchCode ?? body.batch;
    if (batchCode) {
      const batch = await this.prisma.batch.findFirst({ where: { OR: [{ id: String(batchCode) }, { batchCode: String(batchCode) }] } });
      if (batch) {
        await this.prisma.recallBatch.create({
          data: { recallId: recall.id, batchId: batch.id, affectedQuantity: body.affectedQuantity ? Number(body.affectedQuantity) : batch.quantity }
        });
      }
    }

    return this.show(recall.id);
  }

  list() {
    return this.prisma.recall.findMany({
      include: { initiatedByOrg: true, batches: { include: { batch: { include: { product: true } } } } },
      orderBy: { createdAt: 'desc' }
    });
  }

  async show(id: string) {
    const recall = await this.prisma.recall.findFirst({
      where: { OR: [{ id }, { recallCode: id }] },
      include: { initiatedByOrg: true, batches: { include: { batch: { include: { product: true } } } } }
    });
    if (!recall) throw new NotFoundException('Recall not found');
    return recall;
  }

  async impact(id: string) {
    const recall = await this.show(id);
    const batchIds = recall.batches.map((item) => item.batchId);
    const batches = recall.batches.map((item) => item.batch);

    // Find related events for the affected batches
    const relatedEvents = await this.prisma.traceEvent.findMany({
      where: { batchId: { in: batchIds } },
      include: { sourceOrg: true, destinationOrg: true }
    });

    const locations = new Set<string>();
    const warehouses = new Set<string>();
    const retailers = new Set<string>();

    for (const evt of relatedEvents) {
      if (evt.location) locations.add(evt.location);
      if (evt.sourceOrg?.organizationType === 'WAREHOUSE') warehouses.add(evt.sourceOrg.name);
      if (evt.destinationOrg?.organizationType === 'WAREHOUSE') warehouses.add(evt.destinationOrg.name);
      if (evt.sourceOrg?.organizationType === 'RETAILER') retailers.add(evt.sourceOrg.name);
      if (evt.destinationOrg?.organizationType === 'RETAILER') retailers.add(evt.destinationOrg.name);
    }

    const affectedUnits = recall.batches.reduce((sum, item) => sum + Number(item.affectedQuantity), 0);

    return {
      recallCode: recall.recallCode,
      status: recall.status,
      severity: recall.severity,
      affectedBatches: batches.length,
      affectedUnits,
      warehouses: warehouses.size > 0 ? warehouses.size : 1,
      retailers: retailers.size > 0 ? retailers.size : 1,
      warehouseList: Array.from(warehouses),
      retailerList: Array.from(retailers),
      locations: Array.from(locations),
      relatedEventsCount: relatedEvents.length,
      products: [...new Set(batches.map((batch) => batch.product?.name || 'Assigned Product'))],
      batchCodes: batches.map((batch) => batch.batchCode)
    };
  }
}

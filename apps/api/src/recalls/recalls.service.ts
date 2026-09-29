import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { sha256 } from '@trusttrace/crypto';
import { PrismaService } from '../common/prisma/prisma.service';

@Injectable()
export class RecallsService {
  constructor(private readonly prisma: PrismaService) { }

  async create(body: Record<string, unknown>, user?: any) {
    // Determine initiating organization: explicit override if provided (admins), otherwise user org
    let orgId: string | undefined = undefined;
    const isAdmin = user?.roles?.includes('ADMIN');
    const explicitOrgCodeOrId = body.initiatedByOrgId || body.organizationCode;

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
      if (!firstOrg) throw new NotFoundException('Organization not found');
      orgId = firstOrg.id;
    }

    const organization = await this.prisma.organization.findUnique({ where: { id: orgId } });
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
      if (!batch) {
        // Clean up the recall we just created and throw
        await this.prisma.recall.delete({ where: { id: recall.id } });
        throw new NotFoundException(`Batch '${batchCode}' not found. Cannot create recall for non-existent batch.`);
      }

      await this.prisma.recallBatch.create({
        data: { recallId: recall.id, batchId: batch.id, affectedQuantity: body.affectedQuantity ? Number(body.affectedQuantity) : batch.quantity }
      });

      // Mark the batch as RECALLED in the database
      await this.prisma.batch.update({
        where: { id: batch.id },
        data: { status: 'RECALLED' }
      });

      // Write audit log entry for the recall
      await this.prisma.auditLog.create({
        data: {
          action: 'RECALL_INITIATED',
          entityType: 'BATCH',
          entityId: batch.id,
          organizationId: organization.id,
          newValue: {
            recallId: recall.id,
            recallCode: recall.recallCode,
            batchCode: batch.batchCode,
            reason: recall.reason,
            severity: recall.severity,
          } as never,
        }
      });

      // Create blockchain transaction record for recall anchoring
      await this.prisma.blockchainTransaction.create({
        data: {
          eventId: undefined as never, // Recalls don't have a direct event
          networkName: 'trusttrace-fabric-network',
          channelName: 'traceability-channel',
          chaincodeName: 'trusttrace-cc',
          transactionId: `TX-RECALL-${sha256(recall.recallCode + batch.batchCode).slice(0, 12).toUpperCase()}`,
          blockNumber: BigInt(Math.floor(Date.now() / 1000)),
          blockHash: sha256(`block:recall:${recall.recallCode}:${Date.now()}`),
          transactionHash: sha256(JSON.stringify({ recallCode: recall.recallCode, batchCode: batch.batchCode, severity: recall.severity })),
          status: 'CONFIRMED',
          confirmedAt: new Date()
        }
      }).catch(() => {
        // blockchain tx for recall is best-effort (eventId constraint may prevent it)
      });
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
      warehouses: warehouses.size,  // Exact count, no minimum 1 fallback
      retailers: retailers.size,    // Exact count, no minimum 1 fallback
      warehouseList: Array.from(warehouses),
      retailerList: Array.from(retailers),
      locations: Array.from(locations),
      relatedEventsCount: relatedEvents.length,
      products: [...new Set(batches.map((batch) => batch.product?.name || 'Assigned Product'))],
      batchCodes: batches.map((batch) => batch.batchCode)
    };
  }
}

import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';

@Injectable()
export class TraceabilityService {
  constructor(private readonly prisma: PrismaService) {}

  async trace(batchId: string, reverse = false) {
    const batch = await this.prisma.batch.findFirst({
      where: { OR: [{ id: batchId }, { batchCode: batchId }] },
      include: {
        product: true,
        events: {
          include: { sourceOrg: true, destinationOrg: true, blockchainTx: true, trustChecks: true },
          orderBy: { eventTime: reverse ? 'desc' : 'asc' }
        }
      }
    });
    if (!batch) throw new NotFoundException('Batch not found');

    const nodeMap = new Map<string, { id: string; label: string; type: string; status: string }>();
    for (const event of batch.events) {
      nodeMap.set(event.sourceOrg.organizationCode, {
        id: event.sourceOrg.organizationCode,
        label: event.sourceOrg.name,
        type: event.sourceOrg.organizationType,
        status: event.trustStatus
      });
      if (event.destinationOrg) {
        nodeMap.set(event.destinationOrg.organizationCode, {
          id: event.destinationOrg.organizationCode,
          label: event.destinationOrg.name,
          type: event.destinationOrg.organizationType,
          status: event.trustStatus
        });
      }
    }

    // Sanitize org data in events to prevent leaking sensitive contact info
    const sanitizeOrg = (org: any) => org ? ({
      id: org.id,
      name: org.name,
      organizationCode: org.organizationCode,
      organizationType: org.organizationType,
      country: org.country,
      status: org.status,
    }) : null;

    const sanitizedEvents = batch.events.map((event) => ({
      ...event,
      sourceOrg: sanitizeOrg(event.sourceOrg),
      destinationOrg: sanitizeOrg(event.destinationOrg),
    }));

    return {
      batchCode: batch.batchCode,
      productName: batch.product.name,
      direction: reverse ? 'backward' : 'forward',
      nodes: Array.from(nodeMap.values()),
      edges: batch.events.map((event) => ({
        id: event.id,
        source: event.sourceOrg.organizationCode,
        target: event.destinationOrg?.organizationCode ?? event.sourceOrg.organizationCode,
        eventType: event.eventType,
        eventCode: event.eventCode,
        trustStatus: event.trustStatus,
        blockchainStatus: event.blockchainStatus,
        transactionId: event.blockchainTx?.transactionId,
        occurredAt: event.eventTime.toISOString()
      })),
      events: sanitizedEvents
    };
  }
}

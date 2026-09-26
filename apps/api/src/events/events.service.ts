import { Injectable, NotFoundException } from '@nestjs/common';
import { sha256 } from '@trusttrace/crypto';
import { buildObjectEvent } from '@trusttrace/epcis';
import { PrismaService } from '../common/prisma/prisma.service';

@Injectable()
export class EventsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(body: Record<string, unknown>) {
    const batch = await this.prisma.batch.findFirst({
      where: { OR: [{ id: String(body.batchId ?? '') }, { batchCode: String(body.batch ?? body.batchCode ?? '') }] },
      include: { product: true }
    });
    if (!batch) throw new NotFoundException('Batch not found');

    const source = await this.prisma.organization.findFirst({
      where: { OR: [{ id: String(body.sourceOrgId ?? '') }, { organizationCode: String(body.sourceOrganization ?? body.sourceOrgCode ?? 'SUPPLIER-001') }] }
    });
    if (!source) throw new NotFoundException('Source organization not found');

    const destinationCode = body.destinationOrganization ?? body.destinationOrgCode ?? body.destination;
    const destination = destinationCode
      ? await this.prisma.organization.findFirst({ where: { OR: [{ id: String(destinationCode) }, { organizationCode: String(destinationCode) }] } })
      : null;

    const eventCode = String(body.eventCode ?? `EVT-${Date.now().toString(36).toUpperCase()}`);
    const eventType = String(body.eventType ?? body.type ?? 'CREATED');
    const eventTime = body.eventTime ? new Date(String(body.eventTime)) : new Date();

    const epcisEvent = body.epcisEvent ?? buildObjectEvent({
      eventCode,
      eventType,
      batchCode: batch.batchCode,
      productCode: batch.product.productCode,
      eventTime: eventTime.toISOString(),
      sourceOrganization: source.organizationCode,
      destinationOrganization: destination?.organizationCode,
      evidenceHash: body.evidenceHash ? String(body.evidenceHash) : undefined
    });

    const signaturePayload = `${eventCode}:${batch.id}:${eventType}:${source.id}`;
    const signature = body.signature ? String(body.signature) : `SIG-${sha256(signaturePayload).slice(0, 16).toUpperCase()}`;

    return this.prisma.traceEvent.create({
      data: {
        eventCode,
        batchId: batch.id,
        productId: batch.productId,
        eventType: eventType as never,
        businessStep: body.businessStep ? String(body.businessStep) : undefined,
        disposition: body.disposition ? String(body.disposition) : undefined,
        sourceOrgId: source.id,
        destinationOrgId: destination?.id,
        location: body.location ? String(body.location) : undefined,
        eventTime,
        payload: (body.payload as never) ?? {},
        epcisEvent: epcisEvent as never,
        evidenceHash: body.evidenceHash ? String(body.evidenceHash) : undefined,
        signature,
        trustStatus: 'PENDING',
        blockchainStatus: 'NOT_SUBMITTED'
      }
    });
  }

  list() {
    return this.prisma.traceEvent.findMany({
      include: {
        batch: { include: { product: true } },
        product: true,
        sourceOrg: true,
        destinationOrg: true,
        trustChecks: true,
        endorsements: true,
        blockchainTx: true
      },
      orderBy: { eventTime: 'desc' }
    });
  }

  async show(id: string) {
    const event = await this.prisma.traceEvent.findFirst({
      where: { OR: [{ id }, { eventCode: id }] },
      include: {
        batch: true,
        product: true,
        sourceOrg: true,
        destinationOrg: true,
        trustChecks: true,
        endorsements: true,
        evidence: { include: { document: true } },
        blockchainTx: true
      }
    });
    if (!event) throw new NotFoundException('Event not found');
    return event;
  }
}

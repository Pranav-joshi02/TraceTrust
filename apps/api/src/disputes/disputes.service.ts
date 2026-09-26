import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';

@Injectable()
export class DisputesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(body: Record<string, unknown>) {
    const event = await this.prisma.traceEvent.findFirst({
      where: { OR: [{ id: String(body.eventId ?? '') }, { eventCode: String(body.eventCode ?? body.event ?? '') }] },
      include: { sourceOrg: true, destinationOrg: true }
    });
    if (!event) throw new NotFoundException('Event not found');

    const raisedBy = await this.prisma.organization.findFirst({
      where: { OR: [{ id: String(body.raisedByOrgId ?? '') }, { organizationCode: String(body.raisedBy ?? 'RET-001') }, { name: String(body.raisedBy ?? '') }] }
    });
    const against = await this.prisma.organization.findFirst({
      where: { OR: [{ id: String(body.againstOrgId ?? '') }, { organizationCode: String(body.againstOrg ?? 'SUPPLIER-001') }, { name: String(body.againstOrg ?? '') }] }
    });

    return this.prisma.dispute.create({
      data: {
        disputeCode: String(body.disputeCode ?? `DSP-${Date.now()}`),
        eventId: event.id,
        raisedByOrgId: raisedBy?.id ?? event.destinationOrgId ?? event.sourceOrgId,
        againstOrgId: against?.id ?? event.sourceOrgId,
        reason: String(body.reason ?? 'Provenance discrepancy detected'),
        status: String(body.status ?? 'OPEN') as never,
        resolution: body.resolution ? String(body.resolution) : undefined
      },
      include: { event: true, raisedByOrg: true, againstOrg: true }
    });
  }

  list() {
    return this.prisma.dispute.findMany({
      include: { event: { include: { batch: true } }, raisedByOrg: true, againstOrg: true },
      orderBy: { raisedAt: 'desc' }
    });
  }

  async show(id: string) {
    const dispute = await this.prisma.dispute.findFirst({
      where: { OR: [{ id }, { disputeCode: id }] },
      include: { event: { include: { batch: true, product: true } }, raisedByOrg: true, againstOrg: true, resolvedBy: true }
    });
    if (!dispute) throw new NotFoundException('Dispute not found');
    return dispute;
  }
}

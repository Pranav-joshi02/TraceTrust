import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { sha256 } from '@trusttrace/crypto';
import { PrismaService } from '../common/prisma/prisma.service';

@Injectable()
export class EndorsementsService {
  constructor(private readonly prisma: PrismaService) {}

  async createEndorsement(eventId: string, body: Record<string, unknown>) {
    const event = await this.prisma.traceEvent.findFirst({
      where: { OR: [{ id: eventId }, { eventCode: eventId }] },
      include: { sourceOrg: true, destinationOrg: true }
    });
    if (!event) throw new NotFoundException('Event not found');

    const org = await this.prisma.organization.findFirst({
      where: {
        OR: [
          { id: String(body.organizationId ?? '') },
          { organizationCode: String(body.organizationCode ?? body.organization ?? '') }
        ]
      }
    });
    if (!org) throw new NotFoundException('Endorsing organization not found');

    // Prevent duplicate endorsements from the same org
    const existing = await this.prisma.eventEndorsement.findFirst({
      where: { eventId: event.id, organizationId: org.id }
    });
    if (existing) {
      throw new BadRequestException(`Organization '${org.name}' has already submitted an endorsement for this event.`);
    }

    const decision = String(body.decision ?? 'APPROVED') as 'PENDING' | 'APPROVED' | 'REJECTED' | 'ABSTAINED';
    const signature = sha256(`${event.eventCode}:${org.organizationCode}:${decision}:${Date.now()}`);

    const endorsement = await this.prisma.eventEndorsement.create({
      data: {
        eventId: event.id,
        organizationId: org.id,
        userId: body.userId ? String(body.userId) : undefined,
        endorsementType: String(body.endorsementType ?? 'REQUIRED') as 'REQUIRED' | 'OPTIONAL',
        decision,
        signature: `SIG-${signature.slice(0, 16).toUpperCase()}`,
        comment: body.comment ? String(body.comment) : undefined,
        signedAt: decision !== 'PENDING' ? new Date() : undefined
      },
      include: { organization: true, user: true, event: true }
    });

    return this.buildEndorsementResponse(event.id, endorsement);
  }

  /**
   * Update an existing endorsement decision — this is the interactive approval action.
   */
  async updateEndorsement(eventId: string, endorsementId: string, body: Record<string, unknown>) {
    const event = await this.prisma.traceEvent.findFirst({
      where: { OR: [{ id: eventId }, { eventCode: eventId }] },
    });
    if (!event) throw new NotFoundException('Event not found');

    const endorsement = await this.prisma.eventEndorsement.findFirst({
      where: { id: endorsementId, eventId: event.id },
    });
    if (!endorsement) throw new NotFoundException('Endorsement not found');

    const newDecision = String(body.decision ?? endorsement.decision) as 'PENDING' | 'APPROVED' | 'REJECTED' | 'ABSTAINED';

    if (!['PENDING', 'APPROVED', 'REJECTED', 'ABSTAINED'].includes(newDecision)) {
      throw new BadRequestException(`Invalid decision: ${newDecision}. Must be one of: PENDING, APPROVED, REJECTED, ABSTAINED.`);
    }

    const signature = sha256(`${event.eventCode}:${endorsement.organizationId}:${newDecision}:${Date.now()}`);

    const updated = await this.prisma.eventEndorsement.update({
      where: { id: endorsementId },
      data: {
        decision: newDecision,
        signature: `SIG-${signature.slice(0, 16).toUpperCase()}`,
        comment: body.comment ? String(body.comment) : endorsement.comment,
        signedAt: newDecision !== 'PENDING' ? new Date() : null,
      },
      include: { organization: true, user: true, event: true },
    });

    return this.buildEndorsementResponse(event.id, updated);
  }

  async listEndorsements(eventId: string) {
    const event = await this.prisma.traceEvent.findFirst({
      where: { OR: [{ id: eventId }, { eventCode: eventId }] }
    });
    if (!event) throw new NotFoundException('Event not found');

    const endorsements = await this.prisma.eventEndorsement.findMany({
      where: { eventId: event.id },
      include: { organization: true, user: true },
      orderBy: { createdAt: 'asc' }
    });

    const approved = endorsements.filter((e) => e.decision === 'APPROVED').length;

    return {
      eventCode: event.eventCode,
      endorsements,
      summary: {
        total: endorsements.length,
        approved,
        rejected: endorsements.filter((e) => e.decision === 'REJECTED').length,
        pending: endorsements.filter((e) => e.decision === 'PENDING').length,
        abstained: endorsements.filter((e) => e.decision === 'ABSTAINED').length,
        thresholdMet: approved >= 2,
        policy: '2-of-3 Multi-Party Endorsement'
      }
    };
  }

  private async buildEndorsementResponse(eventId: string, endorsement: any) {
    const allEndorsements = await this.prisma.eventEndorsement.findMany({
      where: { eventId },
      include: { organization: true }
    });

    const approved = allEndorsements.filter((e) => e.decision === 'APPROVED').length;
    const rejected = allEndorsements.filter((e) => e.decision === 'REJECTED').length;
    const total = allEndorsements.length;

    return {
      endorsement,
      endorsementPolicy: {
        policy: '2-of-3 Multi-Party Endorsement',
        totalEndorsements: total,
        approved,
        rejected,
        pending: total - approved - rejected,
        thresholdMet: approved >= 2,
        message: approved >= 2
          ? 'Endorsement threshold met: 2-of-3 approvals received.'
          : `Awaiting endorsements: ${2 - approved} more approval(s) needed.`
      }
    };
  }
}

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';

@Injectable()
export class AuditsService {
  constructor(private readonly prisma: PrismaService) {}

  list() {
    return this.prisma.auditLog.findMany({
      include: { organization: true, user: true },
      orderBy: { createdAt: 'desc' },
      take: 100
    });
  }

  async forBatch(batchId: string) {
    const batch = await this.prisma.batch.findFirst({
      where: { OR: [{ id: batchId }, { batchCode: batchId }] },
      include: { events: true }
    });

    const eventIds = batch ? batch.events.map((e) => e.id) : [];

    return this.prisma.auditLog.findMany({
      where: {
        OR: [
          { entityId: batch ? batch.id : batchId },
          { entityId: { in: eventIds } }
        ]
      },
      include: { organization: true, user: true },
      orderBy: { createdAt: 'desc' }
    });
  }

  async forEvent(eventId: string) {
    const event = await this.prisma.traceEvent.findFirst({
      where: { OR: [{ id: eventId }, { eventCode: eventId }] }
    });

    return this.prisma.auditLog.findMany({
      where: { entityId: event ? event.id : eventId },
      include: { organization: true, user: true },
      orderBy: { createdAt: 'desc' }
    });
  }
}

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getStats() {
    const [organizationsCount, productsCount, batchesCount, eventsCount, recallsCount, disputesCount] = await Promise.all([
      this.prisma.organization.count(),
      this.prisma.product.count(),
      this.prisma.batch.count(),
      this.prisma.traceEvent.count(),
      this.prisma.recall.count(),
      this.prisma.dispute.count()
    ]);

    const recentEvents = await this.prisma.traceEvent.findMany({
      take: 6,
      orderBy: { eventTime: 'desc' },
      include: { batch: true, product: true, sourceOrg: true }
    });

    return {
      organizationsCount,
      productsCount,
      batchesCount,
      eventsCount,
      recallsCount,
      disputesCount,
      recentEvents
    };
  }
}

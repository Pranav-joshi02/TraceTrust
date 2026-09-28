import { Injectable, NotFoundException } from '@nestjs/common';
import { sha256 } from '@trusttrace/crypto';
import { PrismaService } from '../common/prisma/prisma.service';

@Injectable()
export class QrCodesService {
  constructor(private readonly prisma: PrismaService) {}

  async generate(body: Record<string, unknown>) {
    const batch = await this.prisma.batch.findFirst({
      where: {
        OR: [
          { id: String(body.batchId ?? '') },
          { batchCode: String(body.batchCode ?? '') }
        ]
      },
      include: { product: true }
    });
    if (!batch) throw new NotFoundException('Batch not found');

    const publicCode = sha256(`qr:${batch.batchCode}:${Date.now()}`).slice(0, 12).toUpperCase();

    const qrCode = await this.prisma.qrCode.create({
      data: {
        batchId: batch.id,
        publicCode,
        status: 'ACTIVE'
      },
      include: { batch: { include: { product: true } } }
    });

    return {
      ...qrCode,
      verificationUrl: `/verify/${batch.batchCode}`,
      qrContent: `trusttrace://verify/${publicCode}`
    };
  }

  async resolve(code: string) {
    const qrCode = await this.prisma.qrCode.findFirst({
      where: { OR: [{ publicCode: code }, { id: code }] },
      include: { batch: { include: { product: true, currentOwner: true } } }
    });
    if (!qrCode) throw new NotFoundException('QR code not found');

    // Record the scan
    await this.prisma.qrCode.update({
      where: { id: qrCode.id },
      data: { scanCount: qrCode.scanCount + 1, lastScannedAt: new Date() }
    });

    // Get events for the batch
    const events = await this.prisma.traceEvent.findMany({
      where: { batchId: qrCode.batchId },
      include: { sourceOrg: true, destinationOrg: true, blockchainTx: true },
      orderBy: { eventTime: 'asc' }
    });

    // Sanitize sensitive data for public endpoint — strip email, phone, address, registrationNumber
    const sanitizeOrg = (org: any) => org ? {
      name: org.name,
      organizationCode: org.organizationCode,
      organizationType: org.organizationType,
      country: org.country,
      status: org.status,
    } : null;

    return {
      qrCode: { id: qrCode.id, publicCode: qrCode.publicCode, scanCount: qrCode.scanCount + 1, status: qrCode.status },
      batch: {
        id: qrCode.batch.id,
        batchCode: qrCode.batch.batchCode,
        quantity: qrCode.batch.quantity,
        unit: qrCode.batch.unit,
        productionDate: qrCode.batch.productionDate,
        expiryDate: qrCode.batch.expiryDate,
        status: qrCode.batch.status,
        originLocation: qrCode.batch.originLocation,
      },
      product: qrCode.batch.product ? {
        id: qrCode.batch.product.id,
        productCode: qrCode.batch.product.productCode,
        name: qrCode.batch.product.name,
        description: qrCode.batch.product.description,
        category: qrCode.batch.product.category,
        unitOfMeasure: qrCode.batch.product.unitOfMeasure,
        status: qrCode.batch.product.status,
      } : null,
      owner: sanitizeOrg(qrCode.batch.currentOwner),
      events: events.map((e) => ({
        eventCode: e.eventCode,
        eventType: e.eventType,
        sourceOrg: e.sourceOrg.name,
        destinationOrg: e.destinationOrg?.name,
        location: e.location,
        eventTime: e.eventTime.toISOString(),
        trustStatus: e.trustStatus,
        blockchainTxId: e.blockchainTx?.transactionId
      })),
      verified: qrCode.status === 'ACTIVE'
    };
  }

  async listForBatch(batchId: string) {
    const batch = await this.prisma.batch.findFirst({
      where: { OR: [{ id: batchId }, { batchCode: batchId }] }
    });
    if (!batch) throw new NotFoundException('Batch not found');

    return this.prisma.qrCode.findMany({
      where: { batchId: batch.id },
      orderBy: { createdAt: 'desc' }
    });
  }

  list() {
    return this.prisma.qrCode.findMany({
      include: { batch: { include: { product: true } } },
      orderBy: { createdAt: 'desc' }
    });
  }
}

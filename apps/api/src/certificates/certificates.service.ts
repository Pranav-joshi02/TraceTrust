import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';

@Injectable()
export class CertificatesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(body: Record<string, unknown>) {
    const org = await this.prisma.organization.findFirst({
      where: { OR: [{ id: String(body.organizationId ?? '') }, { organizationCode: String(body.organizationCode ?? 'SUPPLIER-001') }] }
    });
    if (!org) throw new NotFoundException('Organization not found');

    return this.prisma.certificate.create({
      data: {
        organizationId: org.id,
        certificateNumber: String(body.certificateNumber ?? `CERT-${Date.now()}`),
        certificateType: String(body.certificateType ?? 'Organic Compliance'),
        issuerName: String(body.issuerName ?? 'Accredited Verification Authority'),
        subject: String(body.subject ?? 'Compliance & Quality Standards'),
        issuedAt: body.issuedAt ? new Date(String(body.issuedAt)) : new Date(),
        expiresAt: body.expiresAt ? new Date(String(body.expiresAt)) : new Date(Date.now() + 365 * 24 * 3600 * 1000),
        status: String(body.status ?? 'VALID') as never,
        verificationData: (body.verificationData as never) ?? {}
      },
      include: { organization: true, document: true }
    });
  }

  list() {
    return this.prisma.certificate.findMany({
      include: { organization: true, document: true },
      orderBy: { createdAt: 'desc' }
    });
  }

  async show(id: string) {
    const cert = await this.prisma.certificate.findFirst({
      where: { OR: [{ id }, { certificateNumber: id }] },
      include: { organization: true, document: true }
    });
    if (!cert) throw new NotFoundException('Certificate not found');
    return cert;
  }
}

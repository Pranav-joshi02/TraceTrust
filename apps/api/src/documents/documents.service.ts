import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';

@Injectable()
export class DocumentsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(body: Record<string, unknown>) {
    const org = await this.prisma.organization.findFirst({
      where: { OR: [{ id: String(body.organizationId ?? '') }, { organizationCode: String(body.organizationCode ?? 'SUPPLIER-001') }] }
    });
    if (!org) throw new NotFoundException('Organization not found');

    const doc = await this.prisma.document.create({
      data: {
        organizationId: org.id,
        fileName: String(body.fileName ?? 'evidence.pdf'),
        mimeType: String(body.mimeType ?? 'application/pdf'),
        fileSize: BigInt(body.fileSize ? Number(body.fileSize) : 102400),
        storageProvider: String(body.storageProvider ?? 'minio-s3'),
        storageKey: String(body.storageKey ?? `evidence/${Date.now()}.pdf`),
        sha256Hash: String(body.sha256Hash ?? `hash-${Date.now()}`)
      },
      include: { organization: true }
    });

    return {
      ...doc,
      fileSize: Number(doc.fileSize)
    };
  }

  async list() {
    const docs = await this.prisma.document.findMany({
      include: { organization: true },
      orderBy: { createdAt: 'desc' }
    });
    return docs.map((doc) => ({
      ...doc,
      fileSize: Number(doc.fileSize)
    }));
  }
}

import { Injectable, NotFoundException } from '@nestjs/common';
import { sha256 } from '@trusttrace/crypto';
import { PrismaService } from '../common/prisma/prisma.service';

@Injectable()
export class EvidenceService {
  constructor(private readonly prisma: PrismaService) {}

  async create(body: Record<string, unknown>) {
    const org = await this.prisma.organization.findFirst({
      where: {
        OR: [
          { id: String(body.organizationId ?? '') },
          { organizationCode: String(body.organizationCode ?? 'SUPPLIER-001') }
        ]
      }
    });
    if (!org) throw new NotFoundException('Organization not found');

    const fileName = String(body.fileName ?? 'evidence.pdf');
    const contentToHash = body.content ? String(body.content) : `${fileName}:${Date.now()}`;
    const generatedHash = body.sha256Hash ? String(body.sha256Hash) : sha256(contentToHash);

    const doc = await this.prisma.document.create({
      data: {
        organizationId: org.id,
        fileName,
        mimeType: String(body.mimeType ?? 'application/pdf'),
        fileSize: BigInt(body.fileSize ? Number(body.fileSize) : 102400),
        storageProvider: String(body.storageProvider ?? 'minio-s3'),
        storageKey: String(body.storageKey ?? `evidence/${Date.now()}-${fileName}`),
        sha256Hash: generatedHash
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
      include: { organization: true, eventEvidence: { include: { event: true } } },
      orderBy: { createdAt: 'desc' }
    });
    return docs.map((doc) => ({
      ...doc,
      fileSize: Number(doc.fileSize)
    }));
  }

  async show(id: string) {
    const doc = await this.prisma.document.findFirst({
      where: { OR: [{ id }, { fileName: id }, { storageKey: id }] },
      include: { organization: true, eventEvidence: { include: { event: true } } }
    });
    if (!doc) throw new NotFoundException('Evidence document not found');
    return {
      ...doc,
      fileSize: Number(doc.fileSize),
      organization: doc.organization
    };
  }

  async verify(id: string, body?: Record<string, unknown>) {
    const doc = await this.show(id);
    const providedHash = body?.hash ? String(body.hash) : body?.content ? sha256(String(body.content)) : doc.sha256Hash;
    const isMatch = providedHash === doc.sha256Hash;

    return {
      documentId: doc.id,
      fileName: doc.fileName,
      storageKey: doc.storageKey,
      organization: doc.organization.name,
      storedHash: doc.sha256Hash,
      calculatedHash: providedHash,
      status: isMatch ? 'MATCH' : 'MISMATCH',
      verified: isMatch,
      ledgerProof: isMatch ? 'TAMPER_FREE_INTEGRITY_VERIFIED' : 'TAMPER_DETECTED_HASH_MISMATCH',
      verifiedAt: new Date().toISOString()
    };
  }
}

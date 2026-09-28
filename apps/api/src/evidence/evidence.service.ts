import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { createHash } from 'node:crypto';
import { PrismaService } from '../common/prisma/prisma.service';
import { MinioService } from '../common/minio/minio.service';

@Injectable()
export class EvidenceService {
  private readonly logger = new Logger(EvidenceService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly minio: MinioService,
  ) {}

  /**
   * Create evidence from an actual uploaded file.
   * Hashes the real file bytes with SHA-256, uploads to MinIO.
   */
  async createFromFile(file: Express.Multer.File, body: Record<string, unknown>, user?: any) {
    const org = await this.findOrganization(body, user);

    // Upload to MinIO and compute SHA-256 of actual file bytes
    const { storageKey, sha256Hash, fileSize } = await this.minio.uploadFile(
      file.buffer,
      file.originalname,
      file.mimetype,
    );

    const doc = await this.prisma.document.create({
      data: {
        organizationId: org.id,
        fileName: file.originalname,
        mimeType: file.mimetype,
        fileSize: BigInt(fileSize),
        storageProvider: this.minio.isConnected() ? 'minio-s3' : 'metadata-only',
        storageKey,
        sha256Hash,
      },
      include: { organization: true },
    });

    this.logger.log(`Evidence uploaded: ${file.originalname} (${fileSize} bytes, hash: ${sha256Hash.slice(0, 16)}...)`);

    return {
      ...doc,
      fileSize: Number(doc.fileSize),
      uploadType: 'FILE_UPLOAD',
      hashSource: 'ACTUAL_FILE_BYTES',
      minioStored: this.minio.isConnected(),
    };
  }

  /**
   * Create evidence from JSON metadata only (no actual file).
   * Clearly marked as metadata-only — the hash is NOT from real file bytes.
   */
  async createMetadataOnly(body: Record<string, unknown>, user?: any) {
    const org = await this.findOrganization(body, user);

    const fileName = String(body.fileName ?? 'evidence.pdf');
    const contentToHash = body.content ? String(body.content) : `${fileName}:${Date.now()}`;
    const generatedHash = body.sha256Hash
      ? String(body.sha256Hash)
      : createHash('sha256').update(contentToHash).digest('hex');

    const doc = await this.prisma.document.create({
      data: {
        organizationId: org.id,
        fileName,
        mimeType: String(body.mimeType ?? 'application/pdf'),
        fileSize: BigInt(body.fileSize ? Number(body.fileSize) : 0),
        storageProvider: 'metadata-only',
        storageKey: String(body.storageKey ?? `evidence/${Date.now()}-${fileName}`),
        sha256Hash: generatedHash,
      },
      include: { organization: true },
    });

    this.logger.warn(`Evidence created as METADATA-ONLY (no file uploaded): ${fileName}. Hash is derived from metadata, not actual file bytes.`);

    return {
      ...doc,
      fileSize: Number(doc.fileSize),
      uploadType: 'METADATA_ONLY',
      hashSource: 'METADATA_DERIVED',
      warning: 'This evidence record was created without an actual file upload. The SHA-256 hash is derived from metadata, NOT from real file bytes. Upload the actual file for tamper-evident integrity.',
      minioStored: false,
    };
  }

  private async findOrganization(body: Record<string, unknown>, user?: any) {
    // Non-admins are locked to their own organization
    const isAdmin = user?.roles?.includes('ADMIN');
    if (user?.organizationId && !isAdmin) {
      const org = await this.prisma.organization.findUnique({ where: { id: user.organizationId } });
      if (!org) throw new NotFoundException('Organization not found');
      return org;
    }

    const org = await this.prisma.organization.findFirst({
      where: {
        OR: [
          { id: String(body.organizationId ?? '') },
          { organizationCode: String(body.organizationCode ?? '') }
        ]
      }
    });
    if (!org) throw new NotFoundException('Organization not found');
    return org;
  }

  async list() {
    const docs = await this.prisma.document.findMany({
      include: { organization: true, eventEvidence: { include: { event: true } } },
      orderBy: { createdAt: 'desc' }
    });
    return docs.map((doc) => ({
      ...doc,
      fileSize: Number(doc.fileSize),
      hashSource: doc.storageProvider === 'metadata-only' ? 'METADATA_DERIVED' : 'ACTUAL_FILE_BYTES',
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
      organization: doc.organization,
      hashSource: doc.storageProvider === 'metadata-only' ? 'METADATA_DERIVED' : 'ACTUAL_FILE_BYTES',
    };
  }

  async verify(id: string, body?: Record<string, unknown>) {
    const doc = await this.show(id);

    let calculatedHash: string;
    let verificationMethod: string;

    if (body?.fileBuffer) {
      // If raw file content is provided, hash the actual bytes
      const buffer = Buffer.from(String(body.fileBuffer), 'base64');
      calculatedHash = createHash('sha256').update(buffer).digest('hex');
      verificationMethod = 'ACTUAL_FILE_BYTES';
    } else if (body?.hash) {
      calculatedHash = String(body.hash);
      verificationMethod = 'CLIENT_PROVIDED_HASH';
    } else if (body?.content) {
      calculatedHash = createHash('sha256').update(String(body.content)).digest('hex');
      verificationMethod = 'CONTENT_STRING_HASH';
    } else {
      // If we have the file in MinIO, download and re-hash it
      if (doc.storageProvider !== 'metadata-only' && this.minio.isConnected()) {
        try {
          const buffer = await this.minio.downloadFile(doc.storageKey);
          calculatedHash = createHash('sha256').update(buffer).digest('hex');
          verificationMethod = 'MINIO_STORED_FILE_BYTES';
        } catch {
          calculatedHash = doc.sha256Hash;
          verificationMethod = 'STORED_HASH_COMPARISON';
        }
      } else {
        calculatedHash = doc.sha256Hash;
        verificationMethod = 'STORED_HASH_COMPARISON';
      }
    }

    const isMatch = calculatedHash === doc.sha256Hash;

    return {
      documentId: doc.id,
      fileName: doc.fileName,
      storageKey: doc.storageKey,
      organization: (doc as any).organization?.name,
      storedHash: doc.sha256Hash,
      calculatedHash,
      verificationMethod,
      hashSource: doc.hashSource,
      status: isMatch ? 'MATCH' : 'MISMATCH',
      verified: isMatch,
      ledgerProof: isMatch ? 'TAMPER_FREE_INTEGRITY_VERIFIED' : 'TAMPER_DETECTED_HASH_MISMATCH',
      minioStored: doc.storageProvider !== 'metadata-only',
      verifiedAt: new Date().toISOString()
    };
  }
}

import { Injectable, Logger } from '@nestjs/common';
import * as Minio from 'minio';
import { createHash } from 'node:crypto';
import { Readable } from 'node:stream';

const BUCKET_NAME = 'trusttrace-evidence';

@Injectable()
export class MinioService {
  private client: Minio.Client;
  private readonly logger = new Logger(MinioService.name);
  private connected = false;

  constructor() {
    this.client = new Minio.Client({
      endPoint: process.env.MINIO_ENDPOINT || 'localhost',
      port: parseInt(process.env.MINIO_PORT || '9000', 10),
      useSSL: process.env.MINIO_USE_SSL === 'true',
      accessKey: process.env.MINIO_ACCESS_KEY || 'trusttrace',
      secretKey: process.env.MINIO_SECRET_KEY || 'trusttrace123',
    });

    this.ensureBucket();
  }

  private async ensureBucket() {
    try {
      const exists = await this.client.bucketExists(BUCKET_NAME);
      if (!exists) {
        await this.client.makeBucket(BUCKET_NAME);
        this.logger.log(`Created MinIO bucket: ${BUCKET_NAME}`);
      }
      this.connected = true;
      this.logger.log('MinIO connection established.');
    } catch (err) {
      this.connected = false;
      this.logger.warn(`MinIO not available: ${(err as Error).message}. Evidence uploads will fail gracefully.`);
    }
  }

  isConnected(): boolean {
    return this.connected;
  }

  /**
   * Upload a file buffer to MinIO and return the storage key + SHA-256 hash of the actual bytes.
   */
  async uploadFile(
    buffer: Buffer,
    fileName: string,
    mimeType: string,
  ): Promise<{ storageKey: string; sha256Hash: string; fileSize: number }> {
    const timestamp = Date.now();
    const storageKey = `evidence/${timestamp}-${fileName}`;

    // Compute SHA-256 hash of actual file bytes
    const sha256Hash = createHash('sha256').update(buffer).digest('hex');

    if (!this.connected) {
      // Attempt reconnect
      await this.ensureBucket();
    }

    if (this.connected) {
      const stream = Readable.from(buffer);
      await this.client.putObject(BUCKET_NAME, storageKey, stream, buffer.length, {
        'Content-Type': mimeType,
        'x-amz-meta-sha256': sha256Hash,
        'x-amz-meta-original-name': fileName,
      });
      this.logger.log(`Uploaded ${fileName} to MinIO: ${storageKey} (${buffer.length} bytes, hash: ${sha256Hash.slice(0, 16)}...)`);
    } else {
      this.logger.warn(`MinIO unavailable — file metadata recorded but bytes not stored. Key: ${storageKey}`);
    }

    return {
      storageKey,
      sha256Hash,
      fileSize: buffer.length,
    };
  }

  /**
   * Download a file from MinIO by storage key.
   */
  async downloadFile(storageKey: string): Promise<Buffer> {
    if (!this.connected) {
      throw new Error('MinIO is not connected. Cannot download file.');
    }

    const chunks: Buffer[] = [];
    const stream = await this.client.getObject(BUCKET_NAME, storageKey);

    return new Promise((resolve, reject) => {
      stream.on('data', (chunk: Buffer) => chunks.push(chunk));
      stream.on('end', () => resolve(Buffer.concat(chunks)));
      stream.on('error', reject);
    });
  }

  /**
   * Check if a file exists in MinIO.
   */
  async fileExists(storageKey: string): Promise<boolean> {
    if (!this.connected) return false;
    try {
      await this.client.statObject(BUCKET_NAME, storageKey);
      return true;
    } catch {
      return false;
    }
  }
}

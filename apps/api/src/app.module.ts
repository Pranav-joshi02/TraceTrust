import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { AuthModule } from './auth/auth.module';
import { BatchesModule } from './batches/batches.module';
import { EventsModule } from './events/events.module';
import { HealthModule } from './health/health.module';
import { OrganizationsModule } from './organizations/organizations.module';
import { ProductsModule } from './products/products.module';
import { RecallsModule } from './recalls/recalls.module';
import { TraceabilityModule } from './traceability/traceability.module';
import { TrustModule } from './trust/trust.module';
import { DisputesModule } from './disputes/disputes.module';
import { CertificatesModule } from './certificates/certificates.module';
import { DocumentsModule } from './documents/documents.module';
import { AuditsModule } from './audits/audits.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { EndorsementsModule } from './endorsements/endorsements.module';
import { QrCodesModule } from './qr-codes/qr-codes.module';
import { EvidenceModule } from './evidence/evidence.module';
import { BlockchainModule } from './blockchain/blockchain.module';
import { PrismaModule } from './common/prisma/prisma.module';
import { MinioModule } from './common/minio/minio.module';

@Module({
  imports: [
    PrismaModule,
    MinioModule,
    HealthModule,
    AuthModule,
    OrganizationsModule,
    ProductsModule,
    BatchesModule,
    EventsModule,
    TrustModule,
    TraceabilityModule,
    RecallsModule,
    DisputesModule,
    CertificatesModule,
    DocumentsModule,
    AuditsModule,
    DashboardModule,
    EndorsementsModule,
    QrCodesModule,
    EvidenceModule,
    BlockchainModule
  ]
})
export class AppModule {}

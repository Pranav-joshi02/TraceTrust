import { PrismaClient } from '@prisma/client';
import { createHash } from 'crypto';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const DEFAULT_PASSWORD = 'Password123!';
const SALT_ROUNDS = 10;

function getHash(data: string): string {
  return createHash('sha256').update(data).digest('hex');
}

async function main() {
  // Generate a real bcrypt hash for the default seed password
  const passwordHash = await bcrypt.hash(DEFAULT_PASSWORD, SALT_ROUNDS);
  console.log(`Default seed password: ${DEFAULT_PASSWORD}`);
  console.log(`Generated bcrypt hash: ${passwordHash.slice(0, 30)}...`);
  console.log('Seeding TrustTrace Supabase / PostgreSQL database...');

  // 1. Roles & Permissions
  const adminRole = await prisma.role.upsert({
    where: { name: 'ADMIN' },
    update: {},
    create: { name: 'ADMIN', description: 'System Administrator with full access' }
  });

  const auditorRole = await prisma.role.upsert({
    where: { name: 'AUDITOR' },
    update: {},
    create: { name: 'AUDITOR', description: 'Supply chain compliance and verification auditor' }
  });

  const operatorRole = await prisma.role.upsert({
    where: { name: 'OPERATOR' },
    update: {},
    create: { name: 'OPERATOR', description: 'Supply chain operations and event logger' }
  });

  // 2. Organizations
  const supplierOrg = await prisma.organization.upsert({
    where: { organizationCode: 'SUPPLIER-001' },
    update: {},
    create: {
      name: 'Highland Organics Estate',
      legalName: 'Highland Organics Plantation Co.',
      organizationCode: 'SUPPLIER-001',
      organizationType: 'SUPPLIER',
      registrationNumber: 'REG-IN-KA-8812',
      country: 'India',
      address: 'Coorg Valley, Karnataka, India',
      email: 'contact@highlandorganics.example',
      phone: '+91-8272-245100',
      status: 'VERIFIED',
      fabricMspId: 'HighlandMSP',
      fabricOrgName: 'highland-organics'
    }
  });

  const manufacturerOrg = await prisma.organization.upsert({
    where: { organizationCode: 'MANUF-001' },
    update: {},
    create: {
      name: 'Apex Artisan Roasters',
      legalName: 'Apex Roasting & Packaging Ltd',
      organizationCode: 'MANUF-001',
      organizationType: 'MANUFACTURER',
      registrationNumber: 'REG-IN-MH-4421',
      country: 'India',
      address: 'MIDC Phase II, Pune, Maharashtra',
      email: 'operations@apexroasters.example',
      phone: '+91-20-67123400',
      status: 'VERIFIED',
      fabricMspId: 'ApexMSP',
      fabricOrgName: 'apex-roasters'
    }
  });

  const logisticsOrg = await prisma.organization.upsert({
    where: { organizationCode: 'LOG-001' },
    update: {},
    create: {
      name: 'TransGlobal ColdChain',
      legalName: 'TransGlobal Express Logistics Ltd',
      organizationCode: 'LOG-001',
      organizationType: 'LOGISTICS',
      registrationNumber: 'REG-IN-DL-1994',
      country: 'India',
      address: 'Cargo Complex, New Delhi',
      email: 'dispatch@transglobal.example',
      phone: '+91-11-48220011',
      status: 'VERIFIED',
      fabricMspId: 'TransGlobalMSP',
      fabricOrgName: 'transglobal'
    }
  });

  const warehouseOrg = await prisma.organization.upsert({
    where: { organizationCode: 'WH-001' },
    update: {},
    create: {
      name: 'Bhiwandi Central Fulfillment',
      legalName: 'National Fulfillment Hubs Pvt Ltd',
      organizationCode: 'WH-001',
      organizationType: 'WAREHOUSE',
      registrationNumber: 'REG-IN-MH-7001',
      country: 'India',
      address: 'Logistics Park, Bhiwandi, Mumbai Outer',
      email: 'inbound@bhiwandicentral.example',
      phone: '+91-2522-892100',
      status: 'VERIFIED',
      fabricMspId: 'BhiwandiMSP',
      fabricOrgName: 'bhiwandi-wh'
    }
  });

  const retailerOrg = await prisma.organization.upsert({
    where: { organizationCode: 'RET-001' },
    update: {},
    create: {
      name: 'NatureFresh Markets',
      legalName: 'NatureFresh Organics Retail Ltd',
      organizationCode: 'RET-001',
      organizationType: 'RETAILER',
      registrationNumber: 'REG-IN-KA-3329',
      country: 'India',
      address: 'Indiranagar 100ft Rd, Bengaluru, Karnataka',
      email: 'store-lead@naturefresh.example',
      phone: '+91-80-25201100',
      status: 'VERIFIED',
      fabricMspId: 'NatureFreshMSP',
      fabricOrgName: 'naturefresh-retail'
    }
  });

  const auditorOrg = await prisma.organization.upsert({
    where: { organizationCode: 'AUD-001' },
    update: {},
    create: {
      name: 'SGS Quality Assurance Global',
      legalName: 'SGS India Testing & Verification Ltd',
      organizationCode: 'AUD-001',
      organizationType: 'AUDITOR',
      registrationNumber: 'REG-GLOBAL-SGS-99',
      country: 'India',
      address: 'Vikhroli West, Mumbai, India',
      email: 'audit-desk@sgs-verify.example',
      phone: '+91-22-61800000',
      status: 'VERIFIED',
      fabricMspId: 'SgsAuditMSP',
      fabricOrgName: 'sgs-audit'
    }
  });

  // 3. Admin & Operator Users
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@trusttrace.local' },
    update: { passwordHash },
    create: {
      organizationId: supplierOrg.id,
      email: 'admin@trusttrace.local',
      passwordHash,
      firstName: 'Pranav',
      lastName: 'Joshi',
      status: 'ACTIVE'
    }
  });

  await prisma.userRole.upsert({
    where: { userId_roleId: { userId: adminUser.id, roleId: adminRole.id } },
    update: {},
    create: { userId: adminUser.id, roleId: adminRole.id }
  });

  const operatorUser = await prisma.user.upsert({
    where: { email: 'operator@highlandorganics.example' },
    update: { passwordHash },
    create: {
      organizationId: supplierOrg.id,
      email: 'operator@highlandorganics.example',
      passwordHash,
      firstName: 'Rajesh',
      lastName: 'Kumar',
      status: 'ACTIVE'
    }
  });

  await prisma.userRole.upsert({
    where: { userId_roleId: { userId: operatorUser.id, roleId: operatorRole.id } },
    update: {},
    create: { userId: operatorUser.id, roleId: operatorRole.id }
  });

  const auditorUser = await prisma.user.upsert({
    where: { email: 'auditor@sgs-verify.example' },
    update: { passwordHash },
    create: {
      organizationId: auditorOrg.id,
      email: 'auditor@sgs-verify.example',
      passwordHash,
      firstName: 'Sarah',
      lastName: 'Chen',
      status: 'ACTIVE'
    }
  });

  await prisma.userRole.upsert({
    where: { userId_roleId: { userId: auditorUser.id, roleId: auditorRole.id } },
    update: {},
    create: { userId: auditorUser.id, roleId: auditorRole.id }
  });

  // 4. Products
  const coffeeProduct = await prisma.product.upsert({
    where: { productCode: 'PROD-0001' },
    update: {},
    create: {
      organizationId: supplierOrg.id,
      productCode: 'PROD-0001',
      sku: 'COF-1001',
      gtin: '08901234567890',
      name: 'Organic Arabica Coffee Reserve',
      description: 'Shade-grown organic arabica beans from Coorg high-altitude estates, single-origin certified.',
      category: 'Food & Beverage',
      unitOfMeasure: 'kg',
      status: 'ACTIVE',
      createdById: adminUser.id,
      metadata: { altitude: '1350m', varietal: 'Catimor & SLN9', processingMethod: 'Washed' }
    }
  });

  const cocoaProduct = await prisma.product.upsert({
    where: { productCode: 'PROD-0002' },
    update: {},
    create: {
      organizationId: supplierOrg.id,
      productCode: 'PROD-0002',
      sku: 'COC-2002',
      gtin: '08901234567891',
      name: 'Single-Origin Raw Cocoa',
      description: 'Fermented and solar-dried fine flavor organic cocoa beans.',
      category: 'Food & Beverage',
      unitOfMeasure: 'kg',
      status: 'ACTIVE',
      createdById: adminUser.id,
      metadata: { harvestSeason: '2026-Q1', fermentationDays: 6 }
    }
  });

  // 5. Batches
  const batch1 = await prisma.batch.upsert({
    where: { batchCode: 'BATCH-2026-001' },
    update: {},
    create: {
      productId: coffeeProduct.id,
      batchCode: 'BATCH-2026-001',
      quantity: 5000,
      unit: 'kg',
      productionDate: new Date('2026-09-12T00:00:00.000Z'),
      expiryDate: new Date('2027-09-12T00:00:00.000Z'),
      currentOwnerOrgId: warehouseOrg.id,
      status: 'AVAILABLE',
      originLocation: 'Coorg, Karnataka, India (12.4244° N, 75.7382° E)',
      createdById: adminUser.id,
      metadata: { grade: 'Grade AA Specialty', moistureContent: '10.8%' }
    }
  });

  const batch2 = await prisma.batch.upsert({
    where: { batchCode: 'BATCH-2026-002' },
    update: {},
    create: {
      productId: coffeeProduct.id,
      batchCode: 'BATCH-2026-002',
      quantity: 2500,
      unit: 'kg',
      productionDate: new Date('2026-09-18T00:00:00.000Z'),
      expiryDate: new Date('2027-09-18T00:00:00.000Z'),
      currentOwnerOrgId: logisticsOrg.id,
      status: 'IN_TRANSIT',
      originLocation: 'Coorg, Karnataka, India',
      createdById: adminUser.id,
      metadata: { grade: 'Grade A', transitRoute: 'Coorg -> Pune' }
    }
  });

  // 6. Documents & Evidence
  const certDoc = await prisma.document.upsert({
    where: { id: 'doc-organic-cert-001' },
    update: {},
    create: {
      id: 'doc-organic-cert-001',
      organizationId: supplierOrg.id,
      fileName: 'coorg-organic-certification-2026.pdf',
      mimeType: 'application/pdf',
      fileSize: BigInt(245760),
      storageProvider: 'minio-s3',
      storageKey: 'certificates/2026/coorg-organic-cert.pdf',
      sha256Hash: getHash('coorg-organic-certification-2026-pdf-verified-payload'),
      uploadedById: adminUser.id
    }
  });

  const qualityDoc = await prisma.document.upsert({
    where: { id: 'doc-quality-rep-001' },
    update: {},
    create: {
      id: 'doc-quality-rep-001',
      organizationId: supplierOrg.id,
      fileName: 'specialty-cupping-and-lab-analysis.pdf',
      mimeType: 'application/pdf',
      fileSize: BigInt(512000),
      storageProvider: 'minio-s3',
      storageKey: 'reports/batch-2026-001/quality-report.pdf',
      sha256Hash: getHash('quality-report-batch-001-lab-pass-94-score'),
      uploadedById: adminUser.id
    }
  });

  const shippingDoc = await prisma.document.upsert({
    where: { id: 'doc-shipping-001' },
    update: {},
    create: {
      id: 'doc-shipping-001',
      organizationId: logisticsOrg.id,
      fileName: 'bill-of-lading-transglobal-tr-4912.pdf',
      mimeType: 'application/pdf',
      fileSize: BigInt(189400),
      storageProvider: 'minio-s3',
      storageKey: 'shipping/tr-4912-bol.pdf',
      sha256Hash: getHash('bill-of-lading-bol-4912-transglobal-verified'),
      uploadedById: adminUser.id
    }
  });

  // 7. Certificates
  await prisma.certificate.upsert({
    where: { certificateNumber: 'CERT-ORG-2026-001' },
    update: {},
    create: {
      organizationId: supplierOrg.id,
      certificateNumber: 'CERT-ORG-2026-001',
      certificateType: 'USDA Organic / India Organic NPOP',
      issuerName: 'SGS Quality Assurance Global',
      subject: 'Highland Organics Plantation Co. Organic Compliance',
      issuedAt: new Date('2026-01-10T00:00:00.000Z'),
      expiresAt: new Date('2027-01-10T00:00:00.000Z'),
      documentId: certDoc.id,
      status: 'VALID',
      verificationData: { standard: 'ISO/IEC 17065', accreditation: 'NABCB', scope: 'Coffee Production' }
    }
  });

  await prisma.certificate.upsert({
    where: { certificateNumber: 'CERT-FT-2026-088' },
    update: {},
    create: {
      organizationId: supplierOrg.id,
      certificateNumber: 'CERT-FT-2026-088',
      certificateType: 'Fair Trade Certified',
      issuerName: 'Fairtrade International',
      subject: 'Living Wage & Community Welfare Standards',
      issuedAt: new Date('2026-02-01T00:00:00.000Z'),
      expiresAt: new Date('2027-02-01T00:00:00.000Z'),
      status: 'VALID',
      verificationData: { premiumFundPercent: '15%', fairWageVerified: true }
    }
  });

  // 8. Trace Events for BATCH-2026-001 (Complete Journey)
  const evt1 = await prisma.traceEvent.upsert({
    where: { eventCode: 'EVT-82A19-01' },
    update: {},
    create: {
      eventCode: 'EVT-82A19-01',
      batchId: batch1.id,
      productId: coffeeProduct.id,
      eventType: 'CREATED',
      businessStep: 'harvesting',
      disposition: 'in_progress',
      sourceOrgId: supplierOrg.id,
      location: 'Coorg Valley, Sector 4 Plantation',
      eventTime: new Date('2026-09-12T08:00:00.000Z'),
      payload: { quantity: 5000, unit: 'kg', moisture: '11.2%', pickingMethod: 'Hand-picked ripe cherries' },
      epcisEvent: {
        type: 'ObjectEvent',
        action: 'ADD',
        bizStep: 'urn:epcglobal:cbv:bizstep:commissioning',
        disposition: 'urn:epcglobal:cbv:disp:active'
      },
      evidenceHash: certDoc.sha256Hash,
      signature: 'SIG-ED25519-HIGH-ESTATE-HARVEST-VERIFIED',
      trustStatus: 'VERIFIED',
      trustScore: 99,
      verificationVersion: 'trusttrace-v1.0',
      blockchainStatus: 'CONFIRMED',
      createdById: adminUser.id
    }
  });

  const evt2 = await prisma.traceEvent.upsert({
    where: { eventCode: 'EVT-82A19-02' },
    update: {},
    create: {
      eventCode: 'EVT-82A19-02',
      batchId: batch1.id,
      productId: coffeeProduct.id,
      eventType: 'MANUFACTURED',
      businessStep: 'processing_and_milling',
      disposition: 'in_progress',
      sourceOrgId: supplierOrg.id,
      location: 'Highland Wet Mill Facility, Coorg',
      eventTime: new Date('2026-09-12T10:30:00.000Z'),
      payload: { washed: true, parchmentDryHours: 72, densityScore: 92 },
      epcisEvent: {
        type: 'TransformationEvent',
        action: 'OBSERVE',
        bizStep: 'urn:epcglobal:cbv:bizstep:transforming'
      },
      evidenceHash: qualityDoc.sha256Hash,
      signature: 'SIG-ED25519-MILL-OPERATOR-BATCH-001',
      trustStatus: 'VERIFIED',
      trustScore: 98,
      verificationVersion: 'trusttrace-v1.0',
      blockchainStatus: 'CONFIRMED',
      createdById: adminUser.id
    }
  });

  const evt3 = await prisma.traceEvent.upsert({
    where: { eventCode: 'EVT-82A19-03' },
    update: {},
    create: {
      eventCode: 'EVT-82A19-03',
      batchId: batch1.id,
      productId: coffeeProduct.id,
      eventType: 'QUALITY_CHECKED',
      businessStep: 'inspection',
      disposition: 'conforming',
      sourceOrgId: auditorOrg.id,
      location: 'SGS Quality Labs, Bengaluru Hub',
      eventTime: new Date('2026-09-13T11:45:00.000Z'),
      payload: { cuppingScore: 88.5, defectCount: 0, aflatoxinLevel: 'undetected', labCertified: true },
      epcisEvent: {
        type: 'ObjectEvent',
        action: 'OBSERVE',
        bizStep: 'urn:epcglobal:cbv:bizstep:inspecting'
      },
      evidenceHash: qualityDoc.sha256Hash,
      signature: 'SIG-ED25519-SGS-LEAD-INSPECTOR-VERIFIED',
      trustStatus: 'VERIFIED',
      trustScore: 100,
      verificationVersion: 'trusttrace-v1.0',
      blockchainStatus: 'CONFIRMED',
      createdById: adminUser.id
    }
  });

  const evt4 = await prisma.traceEvent.upsert({
    where: { eventCode: 'EVT-82A19-04' },
    update: {},
    create: {
      eventCode: 'EVT-82A19-04',
      batchId: batch1.id,
      productId: coffeeProduct.id,
      eventType: 'SHIPPED',
      businessStep: 'shipping',
      disposition: 'in_transit',
      sourceOrgId: supplierOrg.id,
      destinationOrgId: warehouseOrg.id,
      location: 'Coorg Outbound Depot',
      eventTime: new Date('2026-09-14T13:20:00.000Z'),
      payload: { carrier: 'TransGlobal ColdChain', waybill: 'TG-WB-90182', sealNumber: 'SL-88419' },
      epcisEvent: {
        type: 'ObjectEvent',
        action: 'OBSERVE',
        bizStep: 'urn:epcglobal:cbv:bizstep:shipping'
      },
      evidenceHash: shippingDoc.sha256Hash,
      signature: 'SIG-ED25519-LOGISTICS-DRIVER-DISPATCH',
      trustStatus: 'VERIFIED',
      trustScore: 96,
      verificationVersion: 'trusttrace-v1.0',
      blockchainStatus: 'CONFIRMED',
      createdById: adminUser.id
    }
  });

  const evt5 = await prisma.traceEvent.upsert({
    where: { eventCode: 'EVT-82A19-05' },
    update: {},
    create: {
      eventCode: 'EVT-82A19-05',
      batchId: batch1.id,
      productId: coffeeProduct.id,
      eventType: 'RECEIVED',
      businessStep: 'receiving',
      disposition: 'available',
      sourceOrgId: warehouseOrg.id,
      location: 'Bhiwandi Central Fulfillment, Bay 14',
      eventTime: new Date('2026-09-15T17:05:00.000Z'),
      payload: { temperatureLog: '21.4C', sealsIntact: true, acceptedQty: 5000 },
      epcisEvent: {
        type: 'ObjectEvent',
        action: 'OBSERVE',
        bizStep: 'urn:epcglobal:cbv:bizstep:receiving'
      },
      evidenceHash: shippingDoc.sha256Hash,
      signature: 'SIG-ED25519-WH-SUPERVISOR-INTAKE',
      trustStatus: 'VERIFIED',
      trustScore: 98,
      verificationVersion: 'trusttrace-v1.0',
      blockchainStatus: 'CONFIRMED',
      createdById: adminUser.id
    }
  });

  // Example Suspicious Event for EVT-82A19-99 (Negative Test Demo)
  await prisma.traceEvent.upsert({
    where: { eventCode: 'EVT-82A19-99' },
    update: {},
    create: {
      eventCode: 'EVT-82A19-99',
      batchId: batch1.id,
      productId: coffeeProduct.id,
      eventType: 'SHIPPED',
      businessStep: 'unauthorized_dispatch',
      disposition: 'flagged_quarantine',
      sourceOrgId: supplierOrg.id,
      destinationOrgId: retailerOrg.id,
      location: 'Unknown Terminal',
      eventTime: new Date('2026-09-16T04:12:00.000Z'),
      payload: { unauthorized: true, invalidCertificate: true, duplicate: true },
      evidenceHash: 'unmatched-hash-tampered-payload-39281a',
      signature: 'INVALID-UNAUTHORIZED-SIGNATURE',
      trustStatus: 'REJECTED',
      trustScore: 24,
      verificationVersion: 'trusttrace-v1.0',
      blockchainStatus: 'NOT_SUBMITTED',
      createdById: adminUser.id
    }
  });

  // 9. Trust Checks for EVT-82A19-04 (Shipped event explainability)
  const trustCheckItems = [
    { type: 'IDENTITY' as const, status: 'PASSED' as const, score: 20, reason: 'Source organization Highland Organics Estate identity verified via X.509 cert.' },
    { type: 'AUTHORIZATION' as const, status: 'PASSED' as const, score: 15, reason: 'Signer has valid role permissions for EVENT_CREATE and SHIPPED event type.' },
    { type: 'SIGNATURE' as const, status: 'PASSED' as const, score: 15, reason: 'Valid cryptographic digital signature SIG-ED25519 verified against consortium public key.' },
    { type: 'DOCUMENT' as const, status: 'PASSED' as const, score: 10, reason: 'Attached bill-of-lading PDF verified and intact.' },
    { type: 'CERTIFICATE' as const, status: 'PASSED' as const, score: 10, reason: 'Active USDA Organic certificate CERT-ORG-2026-001 confirmed non-expired.' },
    { type: 'EVENT_SEQUENCE' as const, status: 'PASSED' as const, score: 10, reason: 'Valid sequence: CREATED -> MANUFACTURED -> QUALITY_CHECKED -> SHIPPED.' },
    { type: 'DUPLICATE' as const, status: 'PASSED' as const, score: 10, reason: 'No duplicate shipment event recorded for BATCH-2026-001 at timestamp.' },
    { type: 'BUSINESS_RULE' as const, status: 'PASSED' as const, score: 5, reason: 'Quantity (5000 kg) does not exceed batch production capacity.' },
    { type: 'ANOMALY' as const, status: 'PASSED' as const, score: 5, reason: 'Velocity and transit routing within expected bounds for Coorg to Bhiwandi corridor.' },
    { type: 'EVIDENCE_HASH' as const, status: 'PASSED' as const, score: 10, reason: 'SHA-256 hash matches off-chain object store record exactly.' }
  ];

  await prisma.trustCheck.deleteMany({ where: { eventId: evt4.id } });
  for (const check of trustCheckItems) {
    await prisma.trustCheck.create({
      data: {
        eventId: evt4.id,
        checkType: check.type,
        status: check.status,
        score: check.score,
        reason: check.reason,
        executedBy: 'TrustTrace Core Engine v1.0',
        executionTimeMs: 14
      }
    });
  }

  // 10. Multi-Party Endorsements for EVT-82A19-04 (2 of 3 rule)
  await prisma.eventEndorsement.deleteMany({ where: { eventId: evt4.id } });
  await prisma.eventEndorsement.create({
    data: {
      eventId: evt4.id,
      organizationId: supplierOrg.id,
      userId: adminUser.id,
      endorsementType: 'REQUIRED',
      decision: 'APPROVED',
      signature: 'SIG-SUPPLIER-ENDORSEMENT-PASS',
      comment: 'Dispatched in good order with temperature sensors active.',
      signedAt: new Date('2026-09-14T13:22:00.000Z')
    }
  });

  await prisma.eventEndorsement.create({
    data: {
      eventId: evt4.id,
      organizationId: logisticsOrg.id,
      endorsementType: 'REQUIRED',
      decision: 'APPROVED',
      signature: 'SIG-LOGISTICS-ENDORSEMENT-PASS',
      comment: 'Container seals checked, temperature set to 20C.',
      signedAt: new Date('2026-09-14T13:25:00.000Z')
    }
  });

  await prisma.eventEndorsement.create({
    data: {
      eventId: evt4.id,
      organizationId: warehouseOrg.id,
      endorsementType: 'OPTIONAL',
      decision: 'APPROVED',
      signature: 'SIG-WAREHOUSE-INBOUND-NOTICE',
      comment: 'Dock slot reserved for ETA Sep 15.',
      signedAt: new Date('2026-09-14T14:00:00.000Z')
    }
  });

  // 11. Blockchain Transactions for Verified Events
  const txList = [
    { event: evt1, txId: 'TX-FABRIC-7801-COMMISSION', block: 1041 },
    { event: evt2, txId: 'TX-FABRIC-7802-TRANSFORM', block: 1042 },
    { event: evt3, txId: 'TX-FABRIC-7803-INSPECT', block: 1043 },
    { event: evt4, txId: 'TX-FABRIC-7804-DISPATCH', block: 1044 },
    { event: evt5, txId: 'TX-FABRIC-7805-INTAKE', block: 1045 }
  ];

  for (const item of txList) {
    await prisma.blockchainTransaction.upsert({
      where: { eventId: item.event.id },
      update: {},
      create: {
        eventId: item.event.id,
        networkName: 'trusttrace-hyperledger-fabric',
        channelName: 'provenance-channel',
        chaincodeName: 'trusttrace-cc',
        transactionId: item.txId,
        blockNumber: BigInt(item.block),
        blockHash: getHash(`block-${item.block}-provenance`),
        transactionHash: getHash(`tx-${item.txId}`),
        status: 'CONFIRMED',
        confirmedAt: new Date(item.event.eventTime.getTime() + 60000)
      }
    });
  }

  // 12. QR Code for public verification
  await prisma.qrCode.upsert({
    where: { publicCode: 'BATCH-2026-001' },
    update: {},
    create: {
      batchId: batch1.id,
      publicCode: 'BATCH-2026-001',
      status: 'ACTIVE',
      scanCount: 142
    }
  });

  // 13. Audit Logs
  await prisma.auditLog.createMany({
    data: [
      {
        organizationId: supplierOrg.id,
        userId: adminUser.id,
        action: 'PRODUCT_CREATED',
        entityType: 'Product',
        entityId: coffeeProduct.id,
        newValue: { productCode: 'PROD-0001', name: 'Organic Arabica Coffee Reserve' },
        createdAt: new Date('2026-09-12T07:45:00.000Z')
      },
      {
        organizationId: supplierOrg.id,
        userId: adminUser.id,
        action: 'BATCH_CREATED',
        entityType: 'Batch',
        entityId: batch1.id,
        newValue: { batchCode: 'BATCH-2026-001', quantity: 5000 },
        createdAt: new Date('2026-09-12T07:50:00.000Z')
      },
      {
        organizationId: auditorOrg.id,
        userId: adminUser.id,
        action: 'EVENT_VERIFIED',
        entityType: 'TraceEvent',
        entityId: evt4.id,
        newValue: { eventCode: 'EVT-82A19-04', trustScore: 96, status: 'VERIFIED' },
        createdAt: new Date('2026-09-14T13:21:00.000Z')
      },
      {
        organizationId: supplierOrg.id,
        userId: adminUser.id,
        action: 'BLOCKCHAIN_COMMITTED',
        entityType: 'BlockchainTransaction',
        entityId: evt4.id,
        newValue: { txId: 'TX-FABRIC-7804-DISPATCH', block: 1044 },
        createdAt: new Date('2026-09-14T13:22:00.000Z')
      }
    ]
  });

  // 14. Recall demonstration record
  const recall1 = await prisma.recall.upsert({
    where: { recallCode: 'REC-2026-019' },
    update: {},
    create: {
      recallCode: 'REC-2026-019',
      initiatedByOrgId: supplierOrg.id,
      reason: 'Packaging seal integrity test failed for sub-lot packaging run.',
      severity: 'MEDIUM',
      status: 'INVESTIGATING',
      initiatedAt: new Date('2026-09-20T10:00:00.000Z')
    }
  });

  await prisma.recallBatch.upsert({
    where: { recallId_batchId: { recallId: recall1.id, batchId: batch1.id } },
    update: {},
    create: {
      recallId: recall1.id,
      batchId: batch1.id,
      affectedQuantity: 180,
      impactStatus: 'AFFECTED'
    }
  });

  console.log('Seed completed successfully! Database is ready with full TrustTrace supply chain demo data.');
}

main()
  .catch((err) => {
    console.error('Error seeding database:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

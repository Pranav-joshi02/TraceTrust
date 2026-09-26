export interface Organization {
  id: string;
  name: string;
  legalName: string;
  organizationCode: string;
  organizationType: 'SUPPLIER' | 'MANUFACTURER' | 'LOGISTICS' | 'WAREHOUSE' | 'RETAILER' | 'AUDITOR' | 'REGULATOR' | 'ADMIN';
  registrationNumber: string;
  country: string;
  address: string;
  email: string;
  phone: string;
  status: 'PENDING' | 'VERIFIED' | 'SUSPENDED' | 'REVOKED';
  fabricMspId: string;
}

export interface Product {
  id: string;
  productCode: string;
  sku: string;
  gtin: string;
  name: string;
  description: string;
  category: string;
  unitOfMeasure: string;
  status: 'ACTIVE' | 'INACTIVE' | 'DISCONTINUED';
  organizationId: string;
  organizationName: string;
  metadata?: Record<string, string>;
}

export interface Batch {
  id: string;
  batchCode: string;
  productId: string;
  productName: string;
  quantity: number;
  unit: string;
  productionDate: string;
  expiryDate: string;
  currentOwnerOrgId: string;
  currentOwnerName: string;
  status: 'CREATED' | 'IN_PRODUCTION' | 'AVAILABLE' | 'IN_TRANSIT' | 'RECEIVED' | 'SOLD' | 'RECALLED';
  originLocation: string;
  trustScore: number;
  trustStatus: 'VERIFIED' | 'PENDING' | 'SUSPICIOUS' | 'REJECTED';
}

export interface TrustCheck {
  id: string;
  checkType: 'IDENTITY' | 'AUTHORIZATION' | 'SIGNATURE' | 'DOCUMENT' | 'CERTIFICATE' | 'EVENT_SEQUENCE' | 'DUPLICATE' | 'BUSINESS_RULE' | 'ANOMALY' | 'EVIDENCE_HASH';
  status: 'PASSED' | 'FAILED' | 'WARNING';
  score: number;
  reason: string;
  executedBy: string;
  executionTimeMs: number;
}

export interface TraceEvent {
  id: string;
  eventCode: string;
  batchId: string;
  batchCode: string;
  productId: string;
  productName: string;
  eventType: 'CREATED' | 'MANUFACTURED' | 'TRANSFORMED' | 'QUALITY_CHECKED' | 'PACKED' | 'SHIPPED' | 'RECEIVED' | 'TRANSFERRED' | 'SOLD' | 'RECALLED';
  businessStep: string;
  disposition: string;
  sourceOrgId: string;
  sourceOrgName: string;
  destinationOrgId?: string;
  destinationOrgName?: string;
  location: string;
  eventTime: string;
  recordedAt: string;
  evidenceHash: string;
  signature: string;
  trustStatus: 'VERIFIED' | 'PENDING' | 'SUSPICIOUS' | 'REJECTED';
  trustScore: number;
  blockchainStatus: 'CONFIRMED' | 'SUBMITTED' | 'NOT_SUBMITTED' | 'FAILED';
  blockchainTxId?: string;
  blockNumber?: number;
  payload: Record<string, any>;
  epcisEvent: Record<string, any>;
  checks: TrustCheck[];
  endorsements: {
    orgName: string;
    decision: 'APPROVED' | 'REJECTED' | 'PENDING';
    signature: string;
    signedAt: string;
    comment: string;
  }[];
}

export interface DocumentEvidence {
  id: string;
  fileName: string;
  fileSize: string;
  mimeType: string;
  organizationName: string;
  sha256Hash: string;
  uploadedAt: string;
  verifiedStatus: 'MATCHED' | 'MISMATCHED' | 'PENDING';
  eventCode: string;
  storageProvider: string;
}

export interface Certificate {
  id: string;
  certificateNumber: string;
  certificateType: string;
  issuerName: string;
  subject: string;
  organizationName: string;
  issuedAt: string;
  expiresAt: string;
  status: 'VALID' | 'EXPIRED' | 'REVOKED' | 'PENDING';
  verificationMethod: string;
  standards: string;
}

export interface Recall {
  id: string;
  recallCode: string;
  initiatedBy: string;
  reason: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  status: 'OPEN' | 'INVESTIGATING' | 'ACTIVE' | 'RESOLVED' | 'CLOSED';
  initiatedAt: string;
  affectedBatches: string[];
  affectedUnits: number;
  warehousesAffected: number;
  retailersAffected: number;
}

export interface AuditRecord {
  id: string;
  timestamp: string;
  actor: string;
  organization: string;
  action: string;
  entityType: string;
  entityId: string;
  details: string;
  txHash: string;
}

export interface Dispute {
  id: string;
  disputeCode: string;
  eventCode: string;
  batchCode: string;
  raisedBy: string;
  againstOrg: string;
  reason: string;
  status: 'OPEN' | 'UNDER_REVIEW' | 'RESOLVED' | 'REJECTED';
  raisedAt: string;
  evidenceCount: number;
  resolution?: string;
}

export const mockOrganizations: Organization[] = [
  {
    id: 'org-1',
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
    fabricMspId: 'HighlandMSP'
  },
  {
    id: 'org-2',
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
    fabricMspId: 'ApexMSP'
  },
  {
    id: 'org-3',
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
    fabricMspId: 'TransGlobalMSP'
  },
  {
    id: 'org-4',
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
    fabricMspId: 'BhiwandiMSP'
  },
  {
    id: 'org-5',
    name: 'NatureFresh Organics',
    legalName: 'NatureFresh Organics Retail Ltd',
    organizationCode: 'RET-001',
    organizationType: 'RETAILER',
    registrationNumber: 'REG-IN-KA-3329',
    country: 'India',
    address: 'Indiranagar 100ft Rd, Bengaluru',
    email: 'store-lead@naturefresh.example',
    phone: '+91-80-25201100',
    status: 'VERIFIED',
    fabricMspId: 'NatureFreshMSP'
  },
  {
    id: 'org-6',
    name: 'SGS Global Assurance',
    legalName: 'SGS India Testing & Verification Ltd',
    organizationCode: 'AUD-001',
    organizationType: 'AUDITOR',
    registrationNumber: 'REG-GLOBAL-SGS-99',
    country: 'India',
    address: 'Vikhroli West, Mumbai, India',
    email: 'audit-desk@sgs-verify.example',
    phone: '+91-22-61800000',
    status: 'VERIFIED',
    fabricMspId: 'SgsAuditMSP'
  }
];

export const mockProducts: Product[] = [
  {
    id: 'prod-1',
    productCode: 'PROD-0001',
    sku: 'COF-1001',
    gtin: '08901234567890',
    name: 'Organic Arabica Coffee Reserve',
    description: 'Shade-grown organic arabica beans from Coorg high-altitude estates, single-origin certified.',
    category: 'Coffee & Tea',
    unitOfMeasure: 'kg',
    status: 'ACTIVE',
    organizationId: 'org-1',
    organizationName: 'Highland Organics Estate',
    metadata: { altitude: '1,350m', varietal: 'Catimor & SLN9', processingMethod: 'Washed' }
  },
  {
    id: 'prod-2',
    productCode: 'PROD-0002',
    sku: 'COC-2002',
    gtin: '08901234567891',
    name: 'Single-Origin Raw Cocoa',
    description: 'Fermented and solar-dried fine flavor organic cocoa beans for bean-to-bar chocolate.',
    category: 'Cocoa & Confectionery',
    unitOfMeasure: 'kg',
    status: 'ACTIVE',
    organizationId: 'org-1',
    organizationName: 'Highland Organics Estate',
    metadata: { harvestSeason: '2026-Q1', fermentationDays: '6 days' }
  },
  {
    id: 'prod-3',
    productCode: 'PROD-0003',
    sku: 'VAN-3003',
    gtin: '08901234567892',
    name: 'Grade-A Bourbon Vanilla Pods',
    description: 'Hand-pollinated cured whole vanilla beans with high vanillin content.',
    category: 'Spices & Extracts',
    unitOfMeasure: 'kg',
    status: 'ACTIVE',
    organizationId: 'org-1',
    organizationName: 'Highland Organics Estate',
    metadata: { vanillinContent: '2.1%', moisture: '30%' }
  }
];

export const mockBatches: Batch[] = [
  {
    id: 'batch-1',
    batchCode: 'BATCH-2026-001',
    productId: 'prod-1',
    productName: 'Organic Arabica Coffee Reserve',
    quantity: 5000,
    unit: 'kg',
    productionDate: '2026-09-12',
    expiryDate: '2027-09-12',
    currentOwnerOrgId: 'org-4',
    currentOwnerName: 'Bhiwandi Central Fulfillment',
    status: 'AVAILABLE',
    originLocation: 'Coorg Valley, Karnataka, India',
    trustScore: 98,
    trustStatus: 'VERIFIED'
  },
  {
    id: 'batch-2',
    batchCode: 'BATCH-2026-002',
    productId: 'prod-1',
    productName: 'Organic Arabica Coffee Reserve',
    quantity: 2500,
    unit: 'kg',
    productionDate: '2026-09-18',
    expiryDate: '2027-09-18',
    currentOwnerOrgId: 'org-3',
    currentOwnerName: 'TransGlobal ColdChain',
    status: 'IN_TRANSIT',
    originLocation: 'Coorg Valley, Karnataka, India',
    trustScore: 94,
    trustStatus: 'VERIFIED'
  },
  {
    id: 'batch-3',
    batchCode: 'BATCH-2026-003',
    productId: 'prod-2',
    productName: 'Single-Origin Raw Cocoa',
    quantity: 3200,
    unit: 'kg',
    productionDate: '2026-09-20',
    expiryDate: '2027-09-20',
    currentOwnerOrgId: 'org-1',
    currentOwnerName: 'Highland Organics Estate',
    status: 'IN_PRODUCTION',
    originLocation: 'Western Ghats, India',
    trustScore: 78,
    trustStatus: 'PENDING'
  }
];

export const mockTraceEvents: TraceEvent[] = [
  {
    id: 'evt-1',
    eventCode: 'EVT-82A19-01',
    batchId: 'batch-1',
    batchCode: 'BATCH-2026-001',
    productId: 'prod-1',
    productName: 'Organic Arabica Coffee Reserve',
    eventType: 'CREATED',
    businessStep: 'harvesting',
    disposition: 'in_progress',
    sourceOrgId: 'org-1',
    sourceOrgName: 'Highland Organics Estate',
    location: 'Coorg Valley, Sector 4 Plantation',
    eventTime: '2026-09-12T08:00:00Z',
    recordedAt: '2026-09-12T08:05:00Z',
    evidenceHash: 'c4ca4238a0b923820dcc509a6f75849b29c914bf4b5042617f694e477f6b9bb7',
    signature: 'SIG-ED25519-HIGH-ESTATE-HARVEST-VERIFIED',
    trustStatus: 'VERIFIED',
    trustScore: 99,
    blockchainStatus: 'CONFIRMED',
    blockchainTxId: 'TX-FABRIC-7801-COMMISSION',
    blockNumber: 1041,
    payload: { quantity: 5000, unit: 'kg', moisture: '11.2%', pickingMethod: 'Hand-picked ripe cherries' },
    epcisEvent: {
      type: 'ObjectEvent',
      action: 'ADD',
      bizStep: 'urn:epcglobal:cbv:bizstep:commissioning',
      disposition: 'urn:epcglobal:cbv:disp:active'
    },
    endorsements: [
      { orgName: 'Highland Organics Estate', decision: 'APPROVED', signature: 'SIG-HO-HARVEST', signedAt: '2026-09-12T08:02:00Z', comment: 'Estate supervisor verified harvest lot' }
    ],
    checks: [
      { id: 'c1', checkType: 'IDENTITY', status: 'PASSED', score: 20, reason: 'Highland Organics identity verified via X.509 cert', executedBy: 'TrustEngine', executionTimeMs: 12 },
      { id: 'c2', checkType: 'AUTHORIZATION', status: 'PASSED', score: 15, reason: 'Signer authorized for CREATED events', executedBy: 'TrustEngine', executionTimeMs: 8 },
      { id: 'c3', checkType: 'SIGNATURE', status: 'PASSED', score: 15, reason: 'Digital signature verified cryptographically', executedBy: 'TrustEngine', executionTimeMs: 14 },
      { id: 'c4', checkType: 'DOCUMENT', status: 'PASSED', score: 10, reason: 'Harvest cert hash matches object store', executedBy: 'TrustEngine', executionTimeMs: 18 },
      { id: 'c5', checkType: 'CERTIFICATE', status: 'PASSED', score: 10, reason: 'Active organic certificate confirmed', executedBy: 'TrustEngine', executionTimeMs: 15 },
      { id: 'c6', checkType: 'EVENT_SEQUENCE', status: 'PASSED', score: 10, reason: 'First event in lifecycle: CREATED', executedBy: 'TrustEngine', executionTimeMs: 5 },
      { id: 'c7', checkType: 'DUPLICATE', status: 'PASSED', score: 10, reason: 'No prior event recorded for this batch', executedBy: 'TrustEngine', executionTimeMs: 7 },
      { id: 'c8', checkType: 'BUSINESS_RULE', status: 'PASSED', score: 5, reason: 'Quantity within licensed plantation acreage', executedBy: 'TrustEngine', executionTimeMs: 4 },
      { id: 'c9', checkType: 'ANOMALY', status: 'PASSED', score: 4, reason: 'Harvest timestamp conforms to regional season', executedBy: 'TrustEngine', executionTimeMs: 10 }
    ]
  },
  {
    id: 'evt-2',
    eventCode: 'EVT-82A19-02',
    batchId: 'batch-1',
    batchCode: 'BATCH-2026-001',
    productId: 'prod-1',
    productName: 'Organic Arabica Coffee Reserve',
    eventType: 'MANUFACTURED',
    businessStep: 'processing_and_milling',
    disposition: 'in_progress',
    sourceOrgId: 'org-1',
    sourceOrgName: 'Highland Organics Estate',
    location: 'Highland Wet Mill Facility, Coorg',
    eventTime: '2026-09-12T10:30:00Z',
    recordedAt: '2026-09-12T10:32:00Z',
    evidenceHash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    signature: 'SIG-ED25519-MILL-OPERATOR-BATCH-001',
    trustStatus: 'VERIFIED',
    trustScore: 98,
    blockchainStatus: 'CONFIRMED',
    blockchainTxId: 'TX-FABRIC-7802-TRANSFORM',
    blockNumber: 1042,
    payload: { washed: true, parchmentDryHours: 72, densityScore: 92 },
    epcisEvent: {
      type: 'TransformationEvent',
      action: 'OBSERVE',
      bizStep: 'urn:epcglobal:cbv:bizstep:transforming'
    },
    endorsements: [
      { orgName: 'Highland Organics Estate', decision: 'APPROVED', signature: 'SIG-HO-MILL', signedAt: '2026-09-12T10:31:00Z', comment: 'Milling & drying completed within tolerances' }
    ],
    checks: [
      { id: 'c10', checkType: 'IDENTITY', status: 'PASSED', score: 20, reason: 'Mill facility credentials verified', executedBy: 'TrustEngine', executionTimeMs: 11 },
      { id: 'c11', checkType: 'EVENT_SEQUENCE', status: 'PASSED', score: 15, reason: 'Valid sequence: CREATED -> MANUFACTURED', executedBy: 'TrustEngine', executionTimeMs: 6 },
      { id: 'c12', checkType: 'SIGNATURE', status: 'PASSED', score: 15, reason: 'Mill operator cryptographic key verified', executedBy: 'TrustEngine', executionTimeMs: 12 },
      { id: 'c13', checkType: 'DUPLICATE', status: 'PASSED', score: 15, reason: 'Unique transformation event', executedBy: 'TrustEngine', executionTimeMs: 5 },
      { id: 'c14', checkType: 'BUSINESS_RULE', status: 'PASSED', score: 15, reason: 'Moisture reduction conforms to standard', executedBy: 'TrustEngine', executionTimeMs: 8 },
      { id: 'c15', checkType: 'EVIDENCE_HASH', status: 'PASSED', score: 18, reason: 'Processing telemetry hash matched', executedBy: 'TrustEngine', executionTimeMs: 14 }
    ]
  },
  {
    id: 'evt-3',
    eventCode: 'EVT-82A19-03',
    batchId: 'batch-1',
    batchCode: 'BATCH-2026-001',
    productId: 'prod-1',
    productName: 'Organic Arabica Coffee Reserve',
    eventType: 'QUALITY_CHECKED',
    businessStep: 'inspection',
    disposition: 'conforming',
    sourceOrgId: 'org-6',
    sourceOrgName: 'SGS Global Assurance',
    location: 'SGS Quality Labs, Bengaluru Hub',
    eventTime: '2026-09-13T11:45:00Z',
    recordedAt: '2026-09-13T11:47:00Z',
    evidenceHash: 'a591a6d40bf420404a011733cfb7b190d62c65bf0bcda32b57b277d9ad9f146e',
    signature: 'SIG-ED25519-SGS-LEAD-INSPECTOR-VERIFIED',
    trustStatus: 'VERIFIED',
    trustScore: 100,
    blockchainStatus: 'CONFIRMED',
    blockchainTxId: 'TX-FABRIC-7803-INSPECT',
    blockNumber: 1043,
    payload: { cuppingScore: 88.5, defectCount: 0, aflatoxinLevel: 'undetected', labCertified: true },
    epcisEvent: {
      type: 'ObjectEvent',
      action: 'OBSERVE',
      bizStep: 'urn:epcglobal:cbv:bizstep:inspecting'
    },
    endorsements: [
      { orgName: 'SGS Global Assurance', decision: 'APPROVED', signature: 'SIG-SGS-AUDITOR-01', signedAt: '2026-09-13T11:46:00Z', comment: 'Spectrometry and cupping tests PASSED with zero defects' },
      { orgName: 'Apex Artisan Roasters', decision: 'APPROVED', signature: 'SIG-APEX-QA', signedAt: '2026-09-13T12:00:00Z', comment: 'Confirmed acceptance grade AA' }
    ],
    checks: [
      { id: 'c16', checkType: 'IDENTITY', status: 'PASSED', score: 20, reason: 'Auditor identity verified via accredited CA', executedBy: 'TrustEngine', executionTimeMs: 9 },
      { id: 'c17', checkType: 'AUTHORIZATION', status: 'PASSED', score: 20, reason: 'Auditor holds valid independent inspection role', executedBy: 'TrustEngine', executionTimeMs: 10 },
      { id: 'c18', checkType: 'DOCUMENT', status: 'PASSED', score: 20, reason: 'Lab test certificate attached and valid', executedBy: 'TrustEngine', executionTimeMs: 15 },
      { id: 'c19', checkType: 'EVENT_SEQUENCE', status: 'PASSED', score: 20, reason: 'Follows MANUFACTURED phase cleanly', executedBy: 'TrustEngine', executionTimeMs: 6 },
      { id: 'c20', checkType: 'BUSINESS_RULE', status: 'PASSED', score: 20, reason: 'Cupping score 88.5 qualifies for Specialty grade', executedBy: 'TrustEngine', executionTimeMs: 8 }
    ]
  },
  {
    id: 'evt-4',
    eventCode: 'EVT-82A19-04',
    batchId: 'batch-1',
    batchCode: 'BATCH-2026-001',
    productId: 'prod-1',
    productName: 'Organic Arabica Coffee Reserve',
    eventType: 'SHIPPED',
    businessStep: 'shipping',
    disposition: 'in_transit',
    sourceOrgId: 'org-1',
    sourceOrgName: 'Highland Organics Estate',
    destinationOrgId: 'org-4',
    destinationOrgName: 'Bhiwandi Central Fulfillment',
    location: 'Coorg Outbound Depot',
    eventTime: '2026-09-14T13:20:00Z',
    recordedAt: '2026-09-14T13:22:00Z',
    evidenceHash: '2c26b46b68ffc68ff99b453c1d30413413422d706483bfa0f98a5e886266e7ae',
    signature: 'SIG-ED25519-LOGISTICS-DRIVER-DISPATCH',
    trustStatus: 'VERIFIED',
    trustScore: 96,
    blockchainStatus: 'CONFIRMED',
    blockchainTxId: 'TX-FABRIC-7804-DISPATCH',
    blockNumber: 1044,
    payload: { carrier: 'TransGlobal ColdChain', waybill: 'TG-WB-90182', sealNumber: 'SL-88419' },
    epcisEvent: {
      type: 'ObjectEvent',
      action: 'OBSERVE',
      bizStep: 'urn:epcglobal:cbv:bizstep:shipping'
    },
    endorsements: [
      { orgName: 'Highland Organics Estate', decision: 'APPROVED', signature: 'SIG-SUPPLIER-DISPATCH', signedAt: '2026-09-14T13:21:00Z', comment: 'Handed over in sealed pallets' },
      { orgName: 'TransGlobal ColdChain', decision: 'APPROVED', signature: 'SIG-CARRIER-ACCEPT', signedAt: '2026-09-14T13:22:00Z', comment: 'Waybill signed and reefer set to 20C' }
    ],
    checks: [
      { id: 'c21', checkType: 'IDENTITY', status: 'PASSED', score: 20, reason: 'Carrier and origin organizations verified', executedBy: 'TrustEngine', executionTimeMs: 10 },
      { id: 'c22', checkType: 'AUTHORIZATION', status: 'PASSED', score: 15, reason: 'Dispatch driver holds verified carrier token', executedBy: 'TrustEngine', executionTimeMs: 8 },
      { id: 'c23', checkType: 'SIGNATURE', status: 'PASSED', score: 15, reason: 'Valid multi-party digital signatures present', executedBy: 'TrustEngine', executionTimeMs: 14 },
      { id: 'c24', checkType: 'DOCUMENT', status: 'PASSED', score: 10, reason: 'Waybill & Bill of Lading attached', executedBy: 'TrustEngine', executionTimeMs: 16 },
      { id: 'c25', checkType: 'CERTIFICATE', status: 'PASSED', score: 10, reason: 'Transport permit is valid', executedBy: 'TrustEngine', executionTimeMs: 9 },
      { id: 'c26', checkType: 'EVENT_SEQUENCE', status: 'PASSED', score: 10, reason: 'Correct flow after QUALITY_CHECKED', executedBy: 'TrustEngine', executionTimeMs: 5 },
      { id: 'c27', checkType: 'DUPLICATE', status: 'PASSED', score: 10, reason: 'No conflicting transit event exists', executedBy: 'TrustEngine', executionTimeMs: 6 },
      { id: 'c28', checkType: 'BUSINESS_RULE', status: 'PASSED', score: 6, reason: 'Weight and container seal matching bill', executedBy: 'TrustEngine', executionTimeMs: 7 }
    ]
  },
  {
    id: 'evt-5',
    eventCode: 'EVT-82A19-05',
    batchId: 'batch-1',
    batchCode: 'BATCH-2026-001',
    productId: 'prod-1',
    productName: 'Organic Arabica Coffee Reserve',
    eventType: 'RECEIVED',
    businessStep: 'receiving',
    disposition: 'available',
    sourceOrgId: 'org-4',
    sourceOrgName: 'Bhiwandi Central Fulfillment',
    location: 'Bhiwandi Central Fulfillment, Bay 14',
    eventTime: '2026-09-15T17:05:00Z',
    recordedAt: '2026-09-15T17:08:00Z',
    evidenceHash: '2c26b46b68ffc68ff99b453c1d30413413422d706483bfa0f98a5e886266e7ae',
    signature: 'SIG-ED25519-WH-SUPERVISOR-INTAKE',
    trustStatus: 'VERIFIED',
    trustScore: 98,
    blockchainStatus: 'CONFIRMED',
    blockchainTxId: 'TX-FABRIC-7805-INTAKE',
    blockNumber: 1045,
    payload: { temperatureLog: '21.4C', sealsIntact: true, acceptedQty: 5000 },
    epcisEvent: {
      type: 'ObjectEvent',
      action: 'OBSERVE',
      bizStep: 'urn:epcglobal:cbv:bizstep:receiving'
    },
    endorsements: [
      { orgName: 'Bhiwandi Central Fulfillment', decision: 'APPROVED', signature: 'SIG-WH-INTAKE-01', signedAt: '2026-09-15T17:06:00Z', comment: 'All 5,000 kg received in prime condition' },
      { orgName: 'TransGlobal ColdChain', decision: 'APPROVED', signature: 'SIG-CARRIER-COMPLETE', signedAt: '2026-09-15T17:07:00Z', comment: 'Delivery acknowledged' }
    ],
    checks: [
      { id: 'c29', checkType: 'IDENTITY', status: 'PASSED', score: 20, reason: 'Warehouse receiving supervisor identity verified', executedBy: 'TrustEngine', executionTimeMs: 12 },
      { id: 'c30', checkType: 'EVENT_SEQUENCE', status: 'PASSED', score: 20, reason: 'Valid sequence: SHIPPED -> RECEIVED', executedBy: 'TrustEngine', executionTimeMs: 7 },
      { id: 'c31', checkType: 'SIGNATURE', status: 'PASSED', score: 20, reason: 'Intake manifest cryptographic signature verified', executedBy: 'TrustEngine', executionTimeMs: 14 },
      { id: 'c32', checkType: 'BUSINESS_RULE', status: 'PASSED', score: 20, reason: 'Received quantity equals shipped quantity (5,000 kg)', executedBy: 'TrustEngine', executionTimeMs: 9 },
      { id: 'c33', checkType: 'ANOMALY', status: 'PASSED', score: 18, reason: 'Transit duration (27.5 hrs) matches GPS expected band', executedBy: 'TrustEngine', executionTimeMs: 13 }
    ]
  },
  {
    id: 'evt-99',
    eventCode: 'EVT-82A19-99',
    batchId: 'batch-1',
    batchCode: 'BATCH-2026-001',
    productId: 'prod-1',
    productName: 'Organic Arabica Coffee Reserve',
    eventType: 'SHIPPED',
    businessStep: 'unauthorized_dispatch',
    disposition: 'flagged_quarantine',
    sourceOrgId: 'org-1',
    sourceOrgName: 'Highland Organics Estate',
    destinationOrgId: 'org-5',
    destinationOrgName: 'NatureFresh Organics',
    location: 'Unknown Unauthorized Terminal',
    eventTime: '2026-09-16T04:12:00Z',
    recordedAt: '2026-09-16T04:12:30Z',
    evidenceHash: 'e7f2b18992a01948491823948719283749817293847192837491827394817293',
    signature: 'INVALID-UNAUTHORIZED-SIGNATURE-X0',
    trustStatus: 'REJECTED',
    trustScore: 24,
    blockchainStatus: 'NOT_SUBMITTED',
    payload: { unauthorized: true, invalidCertificate: true, duplicate: true },
    epcisEvent: {
      type: 'ObjectEvent',
      action: 'OBSERVE',
      bizStep: 'urn:epcglobal:cbv:bizstep:shipping'
    },
    endorsements: [
      { orgName: 'NatureFresh Organics', decision: 'REJECTED', signature: '', signedAt: '2026-09-16T04:15:00Z', comment: 'Rejected: No dispatch notice received, signature untrusted' }
    ],
    checks: [
      { id: 'c34', checkType: 'IDENTITY', status: 'WARNING', score: 10, reason: 'Signer organization verified but employee key unlisted', executedBy: 'TrustEngine', executionTimeMs: 14 },
      { id: 'c35', checkType: 'AUTHORIZATION', status: 'FAILED', score: 0, reason: 'Signer identity does NOT possess role permission to dispatch', executedBy: 'TrustEngine', executionTimeMs: 11 },
      { id: 'c36', checkType: 'SIGNATURE', status: 'FAILED', score: 0, reason: 'Digital signature invalid; hash mismatch detected', executedBy: 'TrustEngine', executionTimeMs: 16 },
      { id: 'c37', checkType: 'CERTIFICATE', status: 'FAILED', score: 0, reason: 'Referenced export certificate has expired or been revoked', executedBy: 'TrustEngine', executionTimeMs: 12 },
      { id: 'c38', checkType: 'EVENT_SEQUENCE', status: 'FAILED', score: 0, reason: 'Sequence violation: Batch is already logged at Warehouse Bay 14', executedBy: 'TrustEngine', executionTimeMs: 8 },
      { id: 'c39', checkType: 'DUPLICATE', status: 'FAILED', score: 0, reason: 'Duplicate dispatch claim for already received batch', executedBy: 'TrustEngine', executionTimeMs: 9 },
      { id: 'c40', checkType: 'ANOMALY', status: 'FAILED', score: 0, reason: 'Location outlier detected: Unauthorized geo-coordinate', executedBy: 'TrustEngine', executionTimeMs: 15 },
      { id: 'c41', checkType: 'DOCUMENT', status: 'FAILED', score: 0, reason: 'Provided bill of lading hash does not exist in store', executedBy: 'TrustEngine', executionTimeMs: 10 },
      { id: 'c42', checkType: 'BUSINESS_RULE', status: 'WARNING', score: 4, reason: 'Attempted quantity exceeds current batch balance', executedBy: 'TrustEngine', executionTimeMs: 7 },
      { id: 'c43', checkType: 'EVIDENCE_HASH', status: 'FAILED', score: 0, reason: 'Evidence hash mismatch with certified ledger record', executedBy: 'TrustEngine', executionTimeMs: 12 }
    ]
  }
];

export const mockDocuments: DocumentEvidence[] = [
  {
    id: 'doc-1',
    fileName: 'coorg-organic-certification-2026.pdf',
    fileSize: '245.8 KB',
    mimeType: 'application/pdf',
    organizationName: 'Highland Organics Estate',
    sha256Hash: 'c4ca4238a0b923820dcc509a6f75849b29c914bf4b5042617f694e477f6b9bb7',
    uploadedAt: '2026-09-12 07:50 UTC',
    verifiedStatus: 'MATCHED',
    eventCode: 'EVT-82A19-01',
    storageProvider: 'MinIO / S3 Encrypted Store'
  },
  {
    id: 'doc-2',
    fileName: 'specialty-cupping-and-lab-analysis.pdf',
    fileSize: '512.0 KB',
    mimeType: 'application/pdf',
    organizationName: 'SGS Global Assurance',
    sha256Hash: 'a591a6d40bf420404a011733cfb7b190d62c65bf0bcda32b57b277d9ad9f146e',
    uploadedAt: '2026-09-13 11:40 UTC',
    verifiedStatus: 'MATCHED',
    eventCode: 'EVT-82A19-03',
    storageProvider: 'MinIO / S3 Encrypted Store'
  },
  {
    id: 'doc-3',
    fileName: 'bill-of-lading-transglobal-tr-4912.pdf',
    fileSize: '189.4 KB',
    mimeType: 'application/pdf',
    organizationName: 'TransGlobal ColdChain',
    sha256Hash: '2c26b46b68ffc68ff99b453c1d30413413422d706483bfa0f98a5e886266e7ae',
    uploadedAt: '2026-09-14 13:15 UTC',
    verifiedStatus: 'MATCHED',
    eventCode: 'EVT-82A19-04',
    storageProvider: 'MinIO / S3 Encrypted Store'
  }
];

export const mockCertificates: Certificate[] = [
  {
    id: 'cert-1',
    certificateNumber: 'CERT-ORG-2026-001',
    certificateType: 'USDA Organic / India NPOP',
    issuerName: 'SGS Quality Assurance Global',
    subject: 'Highland Organics Estate Plantation Co.',
    organizationName: 'Highland Organics Estate',
    issuedAt: '2026-01-10',
    expiresAt: '2027-01-10',
    status: 'VALID',
    verificationMethod: 'Cryptographic X.509 + On-Chain Digest',
    standards: 'ISO/IEC 17065, NPOP Section 4.2'
  },
  {
    id: 'cert-2',
    certificateNumber: 'CERT-FT-2026-088',
    certificateType: 'Fair Trade International Standard',
    issuerName: 'FLOCERT Certification Body',
    subject: 'Living Wage & Community Welfare Standards',
    organizationName: 'Highland Organics Estate',
    issuedAt: '2026-02-01',
    expiresAt: '2027-02-01',
    status: 'VALID',
    verificationMethod: 'Public Key Verification',
    standards: 'FLO-ID 29104 Fairtrade Small Producer Org'
  },
  {
    id: 'cert-3',
    certificateNumber: 'CERT-HACCP-2025-41',
    certificateType: 'HACCP Food Safety Management',
    issuerName: 'Apex Roasting & Packaging Ltd',
    subject: 'Roasting & Hermetic Packing Safety Standards',
    organizationName: 'Apex Artisan Roasters',
    issuedAt: '2025-08-15',
    expiresAt: '2026-08-15',
    status: 'EXPIRED',
    verificationMethod: 'Digital Registry Lookup',
    standards: 'Codex Alimentarius HACCP CXC 1-1969'
  }
];

export const mockRecalls: Recall[] = [
  {
    id: 'rec-1',
    recallCode: 'REC-2026-019',
    initiatedBy: 'Highland Organics Estate',
    reason: 'Packaging seal integrity test failed for sub-lot packaging run (Lot B-04). Potential humidity ingress.',
    severity: 'MEDIUM',
    status: 'INVESTIGATING',
    initiatedAt: '2026-09-20T10:00:00Z',
    affectedBatches: ['BATCH-2026-001'],
    affectedUnits: 180,
    warehousesAffected: 1,
    retailersAffected: 2
  }
];

export const mockDisputes: Dispute[] = [
  {
    id: 'disp-1',
    disputeCode: 'DSP-2026-001',
    eventCode: 'EVT-82A19-99',
    batchCode: 'BATCH-2026-001',
    raisedBy: 'NatureFresh Organics',
    againstOrg: 'Highland Organics Estate',
    reason: 'Unauthorized shipment claim received without verifiable X.509 signature or bill of lading confirmation.',
    status: 'UNDER_REVIEW',
    raisedAt: '2026-09-16T04:45:00Z',
    evidenceCount: 2,
    resolution: 'Quarantine order issued. Trace event marked REJECTED on blockchain gateway.'
  }
];

export const mockAuditLogs: AuditRecord[] = [
  {
    id: 'aud-1',
    timestamp: '2026-09-12 08:05:12 UTC',
    actor: 'Pranav Joshi (Admin)',
    organization: 'Highland Organics Estate',
    action: 'EVENT_CREATED',
    entityType: 'TraceEvent',
    entityId: 'EVT-82A19-01',
    details: 'Harvest event commissioned with 5,000 kg yield',
    txHash: '0x7f9a...3b41'
  },
  {
    id: 'aud-2',
    timestamp: '2026-09-13 11:47:30 UTC',
    actor: 'SGS Lead Inspector',
    organization: 'SGS Global Assurance',
    action: 'TRUST_VALIDATION_PASSED',
    entityType: 'TrustEngine',
    entityId: 'EVT-82A19-03',
    details: 'Cupping test score 88.5 recorded, 10/10 checks passed',
    txHash: '0x3a1e...88f2'
  },
  {
    id: 'aud-3',
    timestamp: '2026-09-14 13:22:15 UTC',
    actor: 'Fabric Consensus Gateway',
    organization: 'TransGlobal ColdChain',
    action: 'BLOCKCHAIN_CONFIRMED',
    entityType: 'HyperledgerFabric',
    entityId: 'TX-FABRIC-7804-DISPATCH',
    details: 'Block 1044 committed with 2-of-3 endorsement',
    txHash: 'TX-FABRIC-7804-DISPATCH'
  },
  {
    id: 'aud-4',
    timestamp: '2026-09-16 04:12:45 UTC',
    actor: 'Security Trust Monitor',
    organization: 'TrustTrace System',
    action: 'TRUST_VIOLATION_REJECTED',
    entityType: 'TraceEvent',
    entityId: 'EVT-82A19-99',
    details: 'Event rejected: 7 failed trust checks, blocked from ledger submission',
    txHash: 'NONE (BLOCKED)'
  }
];

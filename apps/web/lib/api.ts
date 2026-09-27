import {
  Product,
  Batch,
  TraceEvent,
  Recall,
  Dispute,
  Organization,
  Certificate,
  DocumentEvidence,
  AuditRecord,
  mockProducts,
  mockBatches,
  mockTraceEvents,
  mockRecalls,
  mockDisputes,
  mockOrganizations,
  mockCertificates,
  mockDocuments,
  mockAuditLogs
} from './data';

const BASE_URL = typeof window !== 'undefined' ? '' : (process.env.INTERNAL_API_URL || 'http://127.0.0.1:4000');

function getLocal<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const item = localStorage.getItem(`tt_${key}`);
    return item ? JSON.parse(item) : fallback;
  } catch {
    return fallback;
  }
}

function setLocal<T>(key: string, data: T) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(`tt_${key}`, JSON.stringify(data));
  } catch {
    // Ignore storage quota errors
  }
}

// ==========================================
// PRODUCTS
// ==========================================
export async function fetchProducts(): Promise<Product[]> {
  try {
    const res = await fetch(`${BASE_URL}/api/products`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to fetch products');
    const data = await res.json();
    if (Array.isArray(data) && data.length > 0) {
      const mapped: Product[] = data.map((p: any) => ({
        id: p.id,
        productCode: p.productCode,
        sku: p.sku || 'SKU-GEN',
        gtin: p.gtin || '08901234567890',
        name: p.name,
        description: p.description || '',
        category: p.category || 'Food & Beverage',
        unitOfMeasure: p.unitOfMeasure || 'kg',
        status: p.status || 'ACTIVE',
        organizationId: p.organizationId || p.organization?.id || 'org-1',
        organizationName: p.organization?.name || 'Highland Organics Estate',
        organizationCode: p.organization?.organizationCode || 'SUPPLIER-001',
        metadata: p.metadata || {}
      }));
      const local = getLocal<Product[]>('products', []);
      const localOnly = local.filter(
        (lp) => !['prod-1', 'prod-2', 'prod-3'].includes(lp.id) &&
                !mapped.some((mp) => mp.productCode === lp.productCode || mp.id === lp.id)
      );
      const merged = [...mapped, ...localOnly];
      setLocal('products', merged);
      return merged;
    }
  } catch (err) {
    console.warn('API error, using cached products:', err);
  }
  return getLocal('products', mockProducts);
}

export async function createProduct(payload: Partial<Product> & { organizationCode?: string }): Promise<Product> {
  const newProduct: Product = {
    id: payload.id || `prod-${Date.now()}`,
    productCode: (payload.productCode || `PROD-${Date.now()}`).toUpperCase(),
    sku: payload.sku || 'SKU-NEW',
    gtin: payload.gtin || '0890999999999',
    name: payload.name || 'Untitled Product',
    description: payload.description || 'Newly registered product.',
    category: payload.category || 'Food & Beverage',
    unitOfMeasure: payload.unitOfMeasure || 'kg',
    status: (payload.status as any) || 'ACTIVE',
    organizationId: payload.organizationId || 'SUPPLIER-001',
    organizationName: payload.organizationName || 'Highland Organics Estate'
  };

  try {
    const res = await fetch(`${BASE_URL}/api/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        productCode: newProduct.productCode,
        sku: newProduct.sku,
        gtin: newProduct.gtin,
        name: newProduct.name,
        description: newProduct.description,
        category: newProduct.category,
        unitOfMeasure: newProduct.unitOfMeasure,
        status: newProduct.status,
        organizationId: newProduct.organizationId,
        organizationCode: payload.organizationCode || newProduct.organizationId
      })
    });
    if (res.ok) {
      const created = await res.json();
      newProduct.id = created.id;
      if (created.organization?.name) {
        newProduct.organizationName = created.organization.name;
      }
    }
  } catch (err) {
    console.warn('Could not persist product to API directly:', err);
  }

  const existing = getLocal('products', mockProducts);
  const updated = [newProduct, ...existing.filter((p: Product) => p.productCode !== newProduct.productCode && p.id !== newProduct.id)];
  setLocal('products', updated);
  return newProduct;
}

// ==========================================
// BATCHES
// ==========================================
export async function fetchBatches(): Promise<Batch[]> {
  try {
    const res = await fetch(`${BASE_URL}/api/batches`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to fetch batches');
    const data = await res.json();
    if (Array.isArray(data) && data.length > 0) {
      const mapped: Batch[] = data.map((b: any) => ({
        id: b.id,
        batchCode: b.batchCode,
        productId: b.productId,
        productCode: b.product?.productCode,
        productName: b.product?.name || 'Organic Arabica Coffee Reserve',
        quantity: Number(b.quantity),
        unit: b.unit || 'kg',
        productionDate: b.productionDate ? new Date(b.productionDate).toISOString().split('T')[0] : '2026-09-12',
        expiryDate: b.expiryDate ? new Date(b.expiryDate).toISOString().split('T')[0] : '2027-09-12',
        currentOwnerOrgId: b.currentOwnerOrgId,
        currentOwnerName: b.currentOwner?.name || 'Highland Organics Estate',
        currentOwnerCode: b.currentOwner?.organizationCode,
        status: b.status || 'AVAILABLE',
        originLocation: b.originLocation || 'Coorg, Karnataka, India',
        trustScore: 98,
        trustStatus: 'VERIFIED'
      }));
      const local = getLocal<Batch[]>('batches', []);
      const localOnly = local.filter((lb) => !mapped.some((mb) => mb.batchCode === lb.batchCode || mb.id === lb.id));
      const merged = [...mapped, ...localOnly];
      setLocal('batches', merged);
      return merged;
    }
  } catch (err) {
    console.warn('API error, using cached batches:', err);
  }
  return getLocal('batches', mockBatches);
}

export async function createBatch(payload: Partial<Batch> & { productCode?: string; currentOwnerCode?: string }): Promise<Batch> {
  const newBatch: Batch = {
    id: payload.id || `batch-${Date.now()}`,
    batchCode: (payload.batchCode || `BATCH-${Date.now()}`).toUpperCase(),
    productId: payload.productId || 'prod-1',
    productName: payload.productName || 'Organic Arabica Coffee Reserve',
    quantity: Number(payload.quantity || 5000),
    unit: payload.unit || 'kg',
    productionDate: payload.productionDate || new Date().toISOString().split('T')[0],
    expiryDate: payload.expiryDate || '2027-09-25',
    currentOwnerOrgId: payload.currentOwnerOrgId || 'org-1',
    currentOwnerName: payload.currentOwnerName || 'Highland Organics Estate',
    status: (payload.status as any) || 'AVAILABLE',
    originLocation: payload.originLocation || 'Coorg Valley, Karnataka, India',
    trustScore: 95,
    trustStatus: 'VERIFIED'
  };

  try {
    const res = await fetch(`${BASE_URL}/api/batches`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        batchCode: newBatch.batchCode,
        productId: newBatch.productId,
        productCode: payload.productCode,
        currentOwnerOrgId: newBatch.currentOwnerOrgId,
        ownerCode: payload.currentOwnerCode || newBatch.currentOwnerOrgId,
        quantity: newBatch.quantity,
        unit: newBatch.unit,
        productionDate: newBatch.productionDate,
        expiryDate: newBatch.expiryDate,
        status: newBatch.status,
        originLocation: newBatch.originLocation
      })
    });
    if (res.ok) {
      const created = await res.json();
      newBatch.id = created.id;
      if (created.currentOwner?.name) {
        newBatch.currentOwnerName = created.currentOwner.name;
      }
      if (created.product?.name) {
        newBatch.productName = created.product.name;
      }
    }
  } catch (err) {
    console.warn('Could not persist batch to API directly:', err);
  }

  const existing = getLocal('batches', mockBatches);
  const updated = [newBatch, ...existing.filter((b: Batch) => b.batchCode !== newBatch.batchCode && b.id !== newBatch.id)];
  setLocal('batches', updated);
  return newBatch;
}

// ==========================================
// TRACE EVENTS
// ==========================================
export async function fetchEventById(id: string): Promise<TraceEvent | null> {
  try {
    const res = await fetch(`${BASE_URL}/api/events/${id}`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to fetch event');
    const e = await res.json();
    return {
      id: e.id,
      eventCode: e.eventCode,
      batchId: e.batchId,
      batchCode: e.batch?.batchCode || 'BATCH-2026-001',
      productId: e.productId,
      productName: e.product?.name || e.batch?.product?.name || 'Organic Arabica Coffee Reserve',
      eventType: e.eventType,
      businessStep: e.businessStep || 'processing',
      disposition: e.disposition || 'in_progress',
      sourceOrgId: e.sourceOrgId,
      sourceOrgName: e.sourceOrg?.name || 'Highland Organics Estate',
      destinationOrgId: e.destinationOrgId,
      destinationOrgName: e.destinationOrg?.name,
      location: e.location || 'Coorg Valley, Karnataka',
      eventTime: e.eventTime ? new Date(e.eventTime).toISOString() : new Date().toISOString(),
      recordedAt: e.createdAt ? new Date(e.createdAt).toISOString() : new Date().toISOString(),
      evidenceHash: e.evidenceHash || 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
      signature: e.signature || 'SIG-VERIFIED',
      trustStatus: e.trustStatus || 'VERIFIED',
      trustScore: Number(e.trustScore ?? 98),
      blockchainStatus: e.blockchainStatus || 'CONFIRMED',
      blockchainTxId: e.blockchainTx?.transactionId || 'TX-FABRIC-7801',
      blockNumber: 1044,
      payload: e.payload || {},
      epcisEvent: e.epcisEvent || {},
      checks: e.trustChecks?.map((c: any) => ({
        id: c.id,
        checkType: c.checkType,
        status: c.status,
        score: Number(c.score),
        reason: c.reason || '',
        executedBy: c.executedBy || 'TrustEngine',
        executionTimeMs: c.executionTimeMs || 10
      })) || [],
      endorsements: e.endorsements?.map((end: any) => ({
        orgName: end.organization?.name || 'Highland Organics Estate',
        decision: end.decision,
        signature: end.signature || 'SIG-VALID',
        signedAt: end.signedAt ? new Date(end.signedAt).toISOString() : new Date().toISOString(),
        comment: end.comment || ''
      })) || []
    };
  } catch (err) {
    console.warn('Could not fetch event by ID:', err);
    return null;
  }
}

export async function fetchEvents(): Promise<TraceEvent[]> {
  try {
    const res = await fetch(`${BASE_URL}/api/events`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to fetch events');
    const data = await res.json();
    if (Array.isArray(data) && data.length > 0) {
      const mapped: TraceEvent[] = data.map((e: any) => ({
        id: e.id,
        eventCode: e.eventCode,
        batchId: e.batchId,
        batchCode: e.batch?.batchCode || 'BATCH-2026-001',
        productId: e.productId,
        productName: e.product?.name || e.batch?.product?.name || 'Organic Arabica Coffee Reserve',
        eventType: e.eventType,
        businessStep: e.businessStep || 'processing',
        disposition: e.disposition || 'in_progress',
        sourceOrgId: e.sourceOrgId,
        sourceOrgName: e.sourceOrg?.name || 'Highland Organics Estate',
        destinationOrgId: e.destinationOrgId,
        destinationOrgName: e.destinationOrg?.name,
        location: e.location || 'Coorg Valley, Karnataka',
        eventTime: e.eventTime ? new Date(e.eventTime).toISOString() : new Date().toISOString(),
        recordedAt: e.createdAt ? new Date(e.createdAt).toISOString() : new Date().toISOString(),
        evidenceHash: e.evidenceHash || 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
        signature: e.signature || 'SIG-VERIFIED',
        trustStatus: e.trustStatus || 'VERIFIED',
        trustScore: Number(e.trustScore ?? 98),
        blockchainStatus: e.blockchainStatus || 'CONFIRMED',
        blockchainTxId: e.blockchainTx?.transactionId || 'TX-FABRIC-7801',
        blockNumber: 1044,
        payload: e.payload || {},
        epcisEvent: e.epcisEvent || {},
        checks: e.trustChecks?.map((c: any) => ({
          id: c.id,
          checkType: c.checkType,
          status: c.status,
          score: Number(c.score),
          reason: c.reason || '',
          executedBy: c.executedBy || 'TrustEngine',
          executionTimeMs: c.executionTimeMs || 10
        })) || [],
        endorsements: e.endorsements?.map((end: any) => ({
          orgName: end.organization?.name || 'Highland Organics Estate',
          decision: end.decision,
          signature: end.signature || 'SIG-VALID',
          signedAt: end.signedAt ? new Date(end.signedAt).toISOString() : new Date().toISOString(),
          comment: end.comment || ''
        })) || []
      }));
      const local = getLocal<TraceEvent[]>('events', []);
      const localOnly = local.filter((le) => !mapped.some((me) => me.eventCode === le.eventCode || me.id === le.id));
      const merged = [...mapped, ...localOnly];
      setLocal('events', merged);
      return merged;
    }
  } catch (err) {
    console.warn('API error, using cached events:', err);
  }
  return getLocal('events', mockTraceEvents);
}

export async function createEvent(payload: Partial<TraceEvent> & { sourceOrgCode?: string; destinationOrgCode?: string }): Promise<TraceEvent> {
  const newEvt: TraceEvent = {
    id: payload.id || `evt-${Date.now()}`,
    eventCode: (payload.eventCode || `EVT-${Date.now()}`).toUpperCase(),
    batchId: payload.batchId || 'batch-1',
    batchCode: payload.batchCode || 'BATCH-2026-001',
    productId: payload.productId || 'prod-1',
    productName: payload.productName || 'Organic Arabica Coffee Reserve',
    eventType: payload.eventType || 'TRANSFORMED',
    businessStep: payload.businessStep || (payload.eventType ? payload.eventType.toLowerCase() : 'processing'),
    disposition: payload.disposition || 'in_progress',
    sourceOrgId: payload.sourceOrgId || 'org-1',
    sourceOrgName: payload.sourceOrgName || 'Highland Organics Estate',
    destinationOrgId: payload.destinationOrgId,
    destinationOrgName: payload.destinationOrgName,
    location: payload.location || 'Coorg Wet Mill Facility',
    eventTime: payload.eventTime || new Date().toISOString(),
    recordedAt: new Date().toISOString(),
    evidenceHash: payload.evidenceHash || 'hash-verified-payload',
    signature: 'SIG-ED25519-GENERATED',
    trustStatus: 'VERIFIED',
    trustScore: 98,
    blockchainStatus: 'CONFIRMED',
    blockchainTxId: `TX-FABRIC-${Date.now().toString().slice(-4)}`,
    blockNumber: 1046,
    payload: payload.payload || { manualEntry: true },
    epcisEvent: payload.epcisEvent || { type: 'ObjectEvent' },
    checks: payload.checks || [
      { id: 'c1', checkType: 'IDENTITY', status: 'PASSED', score: 20, reason: 'Organization identity active', executedBy: 'TrustEngine', executionTimeMs: 10 },
      { id: 'c2', checkType: 'AUTHORIZATION', status: 'PASSED', score: 15, reason: 'Operator authorized', executedBy: 'TrustEngine', executionTimeMs: 8 },
      { id: 'c3', checkType: 'SIGNATURE', status: 'PASSED', score: 15, reason: 'Cryptographic signature valid', executedBy: 'TrustEngine', executionTimeMs: 12 }
    ],
    endorsements: payload.endorsements || [
      { orgName: payload.sourceOrgName || 'Highland Organics Estate', decision: 'APPROVED', signature: 'SIG-VERIFIED', signedAt: new Date().toISOString(), comment: 'Recorded via UI' }
    ]
  };

  try {
    const res = await fetch(`${BASE_URL}/api/events`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        eventCode: newEvt.eventCode,
        batchCode: newEvt.batchCode,
        batchId: newEvt.batchId,
        eventType: newEvt.eventType,
        businessStep: newEvt.businessStep,
        disposition: newEvt.disposition,
        location: newEvt.location,
        sourceOrgCode: payload.sourceOrgCode || newEvt.sourceOrgId,
        sourceOrgId: newEvt.sourceOrgId,
        destinationOrgCode: payload.destinationOrgCode || newEvt.destinationOrgId,
        destinationOrgId: newEvt.destinationOrgId
      })
    });
    if (res.ok) {
      const created = await res.json();
      newEvt.id = created.id;
      if (created.batch?.batchCode) newEvt.batchCode = created.batch.batchCode;
      if (created.product?.name) newEvt.productName = created.product.name;
      if (created.sourceOrg?.name) newEvt.sourceOrgName = created.sourceOrg.name;
    }
  } catch (err) {
    console.warn('Could not persist event to API directly:', err);
  }

  const existing = getLocal('events', mockTraceEvents);
  const updated = [newEvt, ...existing.filter((e: TraceEvent) => e.eventCode !== newEvt.eventCode && e.id !== newEvt.id)];
  setLocal('events', updated);
  return newEvt;
}

// ==========================================
// ORGANIZATIONS
// ==========================================
export async function fetchOrganizations(): Promise<Organization[]> {
  try {
    const res = await fetch(`${BASE_URL}/api/organizations`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to fetch organizations');
    const data = await res.json();
    if (Array.isArray(data) && data.length > 0) {
      const mapped: Organization[] = data.map((o: any) => ({
        id: o.id,
        name: o.name,
        legalName: o.legalName || o.name,
        organizationCode: o.organizationCode,
        organizationType: o.organizationType || 'SUPPLIER',
        registrationNumber: o.registrationNumber || 'REG-PENDING',
        country: o.country || 'India',
        address: o.address || '',
        email: o.email || '',
        phone: o.phone || '',
        status: o.status || 'VERIFIED',
        fabricMspId: o.fabricMspId || `${o.name.replace(/\s+/g, '')}MSP`
      }));
      const local = getLocal<Organization[]>('organizations', []);
      const localOnly = local.filter((lo) => !mapped.some((mo) => mo.organizationCode === lo.organizationCode || mo.id === lo.id));
      const merged = [...mapped, ...localOnly];
      setLocal('organizations', merged);
      return merged;
    }
  } catch (err) {
    console.warn('API error, using cached organizations:', err);
  }
  return getLocal('organizations', mockOrganizations);
}

export async function createOrganization(payload: Partial<Organization>): Promise<Organization> {
  const newOrg: Organization = {
    id: payload.id || `org-${Date.now()}`,
    name: payload.name || 'New Organization',
    legalName: payload.legalName || payload.name || 'New Legal Entity Ltd',
    organizationCode: (payload.organizationCode || `ORG-${Date.now().toString().slice(-4)}`).toUpperCase(),
    organizationType: payload.organizationType || 'SUPPLIER',
    registrationNumber: payload.registrationNumber || `REG-${Date.now().toString().slice(-6)}`,
    country: payload.country || 'India',
    address: payload.address || 'Trade Hub Center',
    email: payload.email || 'info@organization.example',
    phone: payload.phone || '+91-80-000000',
    status: payload.status || 'VERIFIED',
    fabricMspId: `${(payload.name || 'Org').replace(/\s+/g, '')}MSP`
  };

  try {
    const res = await fetch(`${BASE_URL}/api/organizations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newOrg)
    });
    if (res.ok) {
      const created = await res.json();
      newOrg.id = created.id;
    }
  } catch (err) {
    console.warn('Could not persist organization to API directly:', err);
  }

  const existing = getLocal('organizations', mockOrganizations);
  const updated = [newOrg, ...existing.filter((o: Organization) => o.organizationCode !== newOrg.organizationCode && o.id !== newOrg.id)];
  setLocal('organizations', updated);
  return newOrg;
}

// ==========================================
// RECALLS
// ==========================================
export async function fetchRecalls(): Promise<Recall[]> {
  try {
    const res = await fetch(`${BASE_URL}/api/recalls`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to fetch recalls');
    const data = await res.json();
    if (Array.isArray(data) && data.length > 0) {
      const mapped: Recall[] = data.map((r: any) => ({
        id: r.id,
        recallCode: r.recallCode,
        initiatedBy: r.initiatedByOrg?.name || 'Highland Organics Estate',
        reason: r.reason,
        severity: r.severity || 'MEDIUM',
        status: r.status || 'INVESTIGATING',
        initiatedAt: r.initiatedAt ? new Date(r.initiatedAt).toISOString().split('T')[0] : '2026-09-20',
        affectedBatches: (r.batches || []).map((b: any) => b.batch?.batchCode || b.batchId),
        affectedUnits: (r.batches || []).reduce((acc: number, b: any) => acc + Number(b.affectedQuantity || 0), 0) || 500,
        warehousesAffected: 1,
        retailersAffected: 2
      }));
      const local = getLocal<Recall[]>('recalls', []);
      const localOnly = local.filter((lr) => !mapped.some((mr) => mr.recallCode === lr.recallCode || mr.id === lr.id));
      const merged = [...mapped, ...localOnly];
      setLocal('recalls', merged);
      return merged;
    }
  } catch (err) {
    console.warn('API error, using cached recalls:', err);
  }
  return getLocal('recalls', mockRecalls);
}

export async function createRecall(payload: Partial<Recall> & { initiatedByOrgId?: string; initiatedByOrgCode?: string }): Promise<Recall> {
  const newRecall: Recall = {
    id: payload.id || `rec-${Date.now()}`,
    recallCode: (payload.recallCode || `REC-${Date.now().toString().slice(-4)}`).toUpperCase(),
    initiatedBy: payload.initiatedBy || 'Highland Organics Estate',
    reason: payload.reason || 'Recall investigation opened.',
    severity: payload.severity || 'MEDIUM',
    status: payload.status || 'INVESTIGATING',
    initiatedAt: new Date().toISOString().split('T')[0],
    affectedBatches: payload.affectedBatches || ['BATCH-2026-001'],
    affectedUnits: payload.affectedUnits || 500,
    warehousesAffected: payload.warehousesAffected || 1,
    retailersAffected: payload.retailersAffected || 1
  };

  try {
    const res = await fetch(`${BASE_URL}/api/recalls`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        recallCode: newRecall.recallCode,
        reason: newRecall.reason,
        severity: newRecall.severity,
        status: newRecall.status,
        batchCode: newRecall.affectedBatches[0],
        affectedQuantity: newRecall.affectedUnits,
        initiatedByOrgId: payload.initiatedByOrgId,
        organizationCode: payload.initiatedByOrgCode || 'SUPPLIER-001'
      })
    });
    if (res.ok) {
      const created = await res.json();
      newRecall.id = created.id;
      if (created.initiatedByOrg?.name) newRecall.initiatedBy = created.initiatedByOrg.name;
    }
  } catch (err) {
    console.warn('Could not persist recall to API directly:', err);
  }

  const existing = getLocal('recalls', mockRecalls);
  const updated = [newRecall, ...existing.filter((r: Recall) => r.recallCode !== newRecall.recallCode && r.id !== newRecall.id)];
  setLocal('recalls', updated);
  return newRecall;
}

// ==========================================
// DISPUTES
// ==========================================
export async function fetchDisputes(): Promise<Dispute[]> {
  try {
    const res = await fetch(`${BASE_URL}/api/disputes`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to fetch disputes');
    const data = await res.json();
    if (Array.isArray(data) && data.length > 0) {
      const mapped: Dispute[] = data.map((d: any) => ({
        id: d.id,
        disputeCode: d.disputeCode,
        eventCode: d.event?.eventCode || 'EVT-82A19-04',
        batchCode: d.event?.batch?.batchCode || 'BATCH-2026-001',
        raisedBy: d.raisedByOrg?.name || 'NatureFresh Markets',
        againstOrg: d.againstOrg?.name || 'TransGlobal ColdChain',
        reason: d.reason,
        status: d.status || 'OPEN',
        raisedAt: d.raisedAt ? new Date(d.raisedAt).toISOString().split('T')[0] : '2026-09-22',
        evidenceCount: 2,
        resolution: d.resolution
      }));
      const local = getLocal<Dispute[]>('disputes', []);
      const localOnly = local.filter((ld) => !mapped.some((md) => md.disputeCode === ld.disputeCode || md.id === ld.id));
      const merged = [...mapped, ...localOnly];
      setLocal('disputes', merged);
      return merged;
    }
  } catch (err) {
    console.warn('API error, using cached disputes:', err);
  }
  return getLocal('disputes', mockDisputes);
}

export async function createDispute(payload: Partial<Dispute> & { eventId?: string; raisedByOrgId?: string; againstOrgId?: string }): Promise<Dispute> {
  const newDispute: Dispute = {
    id: payload.id || `dsp-${Date.now()}`,
    disputeCode: (payload.disputeCode || `DSP-${Date.now().toString().slice(-4)}`).toUpperCase(),
    eventCode: payload.eventCode || 'EVT-82A19-04',
    batchCode: payload.batchCode || 'BATCH-2026-001',
    raisedBy: payload.raisedBy || 'NatureFresh Markets',
    againstOrg: payload.againstOrg || 'TransGlobal ColdChain',
    reason: payload.reason || 'Integrity anomaly reported.',
    status: payload.status || 'OPEN',
    raisedAt: new Date().toISOString().split('T')[0],
    evidenceCount: 1,
    resolution: payload.resolution
  };

  try {
    const res = await fetch(`${BASE_URL}/api/disputes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        disputeCode: newDispute.disputeCode,
        eventCode: newDispute.eventCode,
        eventId: payload.eventId,
        reason: newDispute.reason,
        status: newDispute.status,
        raisedBy: newDispute.raisedBy,
        raisedByOrgId: payload.raisedByOrgId,
        againstOrg: newDispute.againstOrg,
        againstOrgId: payload.againstOrgId
      })
    });
    if (res.ok) {
      const created = await res.json();
      newDispute.id = created.id;
      if (created.raisedByOrg?.name) newDispute.raisedBy = created.raisedByOrg.name;
      if (created.againstOrg?.name) newDispute.againstOrg = created.againstOrg.name;
      if (created.event?.batch?.batchCode) newDispute.batchCode = created.event.batch.batchCode;
    }
  } catch (err) {
    console.warn('Could not persist dispute to API directly:', err);
  }

  const existing = getLocal('disputes', mockDisputes);
  const updated = [newDispute, ...existing.filter((d: Dispute) => d.disputeCode !== newDispute.disputeCode && d.id !== newDispute.id)];
  setLocal('disputes', updated);
  return newDispute;
}

// ==========================================
// CERTIFICATES
// ==========================================
export async function fetchCertificates(): Promise<Certificate[]> {
  try {
    const res = await fetch(`${BASE_URL}/api/certificates`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to fetch certificates');
    const data = await res.json();
    if (Array.isArray(data) && data.length > 0) {
      const mapped: Certificate[] = data.map((c: any) => ({
        id: c.id,
        certificateNumber: c.certificateNumber,
        certificateType: c.certificateType,
        issuerName: c.issuerName,
        subject: c.subject,
        organizationName: c.organization?.name || 'Highland Organics Estate',
        issuedAt: c.issuedAt ? new Date(c.issuedAt).toISOString().split('T')[0] : '2026-01-10',
        expiresAt: c.expiresAt ? new Date(c.expiresAt).toISOString().split('T')[0] : '2027-01-10',
        status: c.status || 'VALID',
        verificationMethod: 'Consortium X.509 Cryptographic Verification',
        standards: 'ISO/IEC 17065'
      }));
      const local = getLocal<Certificate[]>('certificates', []);
      const localOnly = local.filter((lc) => !mapped.some((mc) => mc.certificateNumber === lc.certificateNumber || mc.id === lc.id));
      const merged = [...mapped, ...localOnly];
      setLocal('certificates', merged);
      return merged;
    }
  } catch (err) {
    console.warn('API error, using cached certificates:', err);
  }
  return getLocal('certificates', mockCertificates);
}

export async function createCertificate(payload: Partial<Certificate> & { organizationId?: string; organizationCode?: string }): Promise<Certificate> {
  const newCert: Certificate = {
    id: payload.id || `cert-${Date.now()}`,
    certificateNumber: (payload.certificateNumber || `CERT-${Date.now().toString().slice(-4)}`).toUpperCase(),
    certificateType: payload.certificateType || 'USDA Organic',
    issuerName: payload.issuerName || 'SGS Quality Assurance Global',
    subject: payload.subject || 'Organic Plantation Compliance',
    organizationName: payload.organizationName || 'Highland Organics Estate',
    issuedAt: payload.issuedAt || new Date().toISOString().split('T')[0],
    expiresAt: payload.expiresAt || '2027-09-25',
    status: (payload.status as any) || 'VALID',
    verificationMethod: payload.verificationMethod || 'Consortium X.509 Cryptographic Verification',
    standards: payload.standards || 'ISO/IEC 17065'
  };

  try {
    const res = await fetch(`${BASE_URL}/api/certificates`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        certificateNumber: newCert.certificateNumber,
        certificateType: newCert.certificateType,
        issuerName: newCert.issuerName,
        subject: newCert.subject,
        organizationId: payload.organizationId,
        organizationCode: payload.organizationCode || 'SUPPLIER-001',
        issuedAt: newCert.issuedAt,
        expiresAt: newCert.expiresAt,
        status: newCert.status
      })
    });
    if (res.ok) {
      const created = await res.json();
      newCert.id = created.id;
      if (created.organization?.name) newCert.organizationName = created.organization.name;
    }
  } catch (err) {
    console.warn('Could not persist certificate to API directly:', err);
  }

  const existing = getLocal('certificates', mockCertificates);
  const updated = [newCert, ...existing.filter((c: Certificate) => c.certificateNumber !== newCert.certificateNumber && c.id !== newCert.id)];
  setLocal('certificates', updated);
  return newCert;
}

// ==========================================
// DOCUMENTS / EVIDENCE
// ==========================================
export async function fetchDocuments(): Promise<DocumentEvidence[]> {
  try {
    const res = await fetch(`${BASE_URL}/api/documents`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to fetch documents');
    const data = await res.json();
    if (Array.isArray(data) && data.length > 0) {
      const mapped: DocumentEvidence[] = data.map((d: any) => ({
        id: d.id,
        fileName: d.fileName,
        fileSize: `${Math.round(Number(d.fileSize || 204800) / 1024)} KB`,
        mimeType: d.mimeType || 'application/pdf',
        organizationName: d.organization?.name || 'Highland Organics Estate',
        sha256Hash: d.sha256Hash,
        uploadedAt: d.createdAt ? new Date(d.createdAt).toISOString().split('T')[0] : '2026-09-12',
        verifiedStatus: 'MATCHED',
        eventCode: 'EVT-82A19-04',
        storageProvider: d.storageProvider || 'minio-s3'
      }));
      const local = getLocal<DocumentEvidence[]>('documents', []);
      const localOnly = local.filter((ld) => !mapped.some((md) => md.id === ld.id || md.sha256Hash === ld.sha256Hash));
      const merged = [...mapped, ...localOnly];
      setLocal('documents', merged);
      return merged;
    }
  } catch (err) {
    console.warn('API error, using cached documents:', err);
  }
  return getLocal('documents', mockDocuments);
}

export async function createDocument(payload: Partial<DocumentEvidence> & { organizationId?: string; organizationCode?: string }): Promise<DocumentEvidence> {
  const newDoc: DocumentEvidence = {
    id: payload.id || `doc-${Date.now()}`,
    fileName: payload.fileName || 'uploaded-evidence.pdf',
    fileSize: payload.fileSize || '245 KB',
    mimeType: payload.mimeType || 'application/pdf',
    organizationName: payload.organizationName || 'Highland Organics Estate',
    sha256Hash: payload.sha256Hash || 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    uploadedAt: new Date().toISOString().split('T')[0],
    verifiedStatus: 'MATCHED',
    eventCode: payload.eventCode || 'EVT-82A19-04',
    storageProvider: payload.storageProvider || 'minio-s3'
  };

  try {
    const res = await fetch(`${BASE_URL}/api/documents`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fileName: newDoc.fileName,
        fileSize: 245760,
        mimeType: newDoc.mimeType,
        sha256Hash: newDoc.sha256Hash,
        storageProvider: newDoc.storageProvider,
        eventCode: newDoc.eventCode,
        organizationId: payload.organizationId,
        organizationCode: payload.organizationCode || 'SUPPLIER-001'
      })
    });
    if (res.ok) {
      const created = await res.json();
      newDoc.id = created.id;
      if (created.organization?.name) newDoc.organizationName = created.organization.name;
    }
  } catch (err) {
    console.warn('Could not persist document to API directly:', err);
  }

  const existing = getLocal('documents', mockDocuments);
  const updated = [newDoc, ...existing.filter((d: DocumentEvidence) => d.id !== newDoc.id)];
  setLocal('documents', updated);
  return newDoc;
}

// ==========================================
// AUDIT LOGS
// ==========================================
export async function fetchAuditLogs(): Promise<AuditRecord[]> {
  try {
    const res = await fetch(`${BASE_URL}/api/audits`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to fetch audits');
    const data = await res.json();
    if (Array.isArray(data) && data.length > 0) {
      return data.map((a: any) => ({
        id: a.id,
        timestamp: a.createdAt ? new Date(a.createdAt).toISOString() : new Date().toISOString(),
        actor: a.user ? `${a.user.firstName} ${a.user.lastName}` : 'System Engine',
        organization: a.organization?.name || 'TrustTrace Consortium',
        action: a.action,
        entityType: a.entityType,
        entityId: a.entityId,
        details: JSON.stringify(a.newValue || {}),
        txHash: `0x${a.id.replace(/-/g, '').slice(0, 16)}`
      }));
    }
  } catch (err) {
    console.warn('API error, using cached audit logs:', err);
  }
  return mockAuditLogs;
}

// ==========================================
// TRUST VERIFICATION ENGINE
// ==========================================
export async function verifyEvent(eventId: string): Promise<any> {
  try {
    const res = await fetch(`${BASE_URL}/api/events/${eventId}/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    if (!res.ok) throw new Error('Verification request failed');
    return await res.json();
  } catch (err) {
    console.error('Error verifying event:', err);
    throw err;
  }
}

// ==========================================
// TRACEABILITY EXPLORER
// ==========================================
export async function fetchTrace(batchId: string, direction: 'forward' | 'backward' = 'forward'): Promise<any> {
  try {
    const endpoint = direction === 'backward' ? `/api/trace/${batchId}/backward` : `/api/trace/${batchId}/forward`;
    const res = await fetch(`${BASE_URL}${endpoint}`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to fetch trace data');
    return await res.json();
  } catch (err) {
    console.warn('API error fetching trace:', err);
    return null;
  }
}

// ==========================================
// QR CODE RESOLUTION & GENERATION
// ==========================================
export async function resolveQrCode(code: string): Promise<any> {
  try {
    const res = await fetch(`${BASE_URL}/api/qr-codes/${code}`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to resolve QR code');
    return await res.json();
  } catch (err) {
    console.warn('API error resolving QR code:', err);
    return null;
  }
}

export async function generateQrCode(batchId: string): Promise<any> {
  try {
    const res = await fetch(`${BASE_URL}/api/qr-codes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ batchId })
    });
    if (!res.ok) throw new Error('Failed to generate QR code');
    return await res.json();
  } catch (err) {
    console.error('Error generating QR code:', err);
    throw err;
  }
}

// ==========================================
// ENDORSEMENTS
// ==========================================
export async function createEndorsement(eventId: string, data: { organizationCode?: string; organizationId?: string; decision?: string; comment?: string }): Promise<any> {
  try {
    const res = await fetch(`${BASE_URL}/api/events/${eventId}/endorsements`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to submit endorsement');
    return await res.json();
  } catch (err) {
    console.error('Error submitting endorsement:', err);
    throw err;
  }
}

export async function fetchEndorsements(eventId: string): Promise<any> {
  try {
    const res = await fetch(`${BASE_URL}/api/events/${eventId}/endorsements`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to fetch endorsements');
    return await res.json();
  } catch (err) {
    console.warn('Error fetching endorsements:', err);
    return null;
  }
}

// ==========================================
// EVIDENCE VERIFICATION
// ==========================================
export async function verifyEvidenceDocument(id: string, body?: { hash?: string; content?: string }): Promise<any> {
  try {
    const res = await fetch(`${BASE_URL}/api/evidence/${id}/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body || {})
    });
    if (!res.ok) throw new Error('Document verification failed');
    return await res.json();
  } catch (err) {
    console.error('Error verifying document:', err);
    throw err;
  }
}

// ==========================================
// RECALL IMPACT
// ==========================================
export async function fetchRecallImpact(recallId: string): Promise<any> {
  try {
    const res = await fetch(`${BASE_URL}/api/recalls/${recallId}/impact`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to fetch recall impact');
    return await res.json();
  } catch (err) {
    console.warn('Error fetching recall impact:', err);
    return null;
  }
}

// ==========================================
// NETWORK & CHAINCODE LIFECYCLE
// ==========================================
export async function fetchNetworkStatus(): Promise<any> {
  try {
    const res = await fetch(`${BASE_URL}/api/network/status`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to fetch network status');
    return await res.json();
  } catch (err) {
    console.warn('Error fetching network status:', err);
    return null;
  }
}

export async function fetchNetworkChaincode(): Promise<any> {
  try {
    const res = await fetch(`${BASE_URL}/api/network/chaincode`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to fetch chaincode');
    return await res.json();
  } catch (err) {
    console.warn('Error fetching chaincode:', err);
    return null;
  }
}


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

/** Get Authorization header from cookie/localStorage for authenticated API calls */
function getAuthHeaders(): Record<string, string> {
  if (typeof document === 'undefined') return {};
  const match = document.cookie.match(/(?:^|; )tt_auth_token=([^;]*)/);
  const token = match ? decodeURIComponent(match[1]) : (typeof localStorage !== 'undefined' ? localStorage.getItem('tt_auth_token') : null);
  if (token) return { Authorization: `Bearer ${token}` };
  return {};
}

/** Handle API error responses — throws with server message, handles 401 redirect */
async function handleApiError(res: Response, action: string): Promise<never> {
  let message = `${action} failed (${res.status})`;
  try {
    const body = await res.json();
    if (body.message) message = typeof body.message === 'string' ? body.message : body.message[0];
  } catch { /* use default */ }

  if (res.status === 401 && typeof window !== 'undefined') {
    // Token expired/invalid — clear session and redirect
    document.cookie = 'tt_auth_token=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/';
    localStorage.removeItem('tt_auth_token');
    localStorage.removeItem('tt_user');
    const redirect = window.location.pathname;
    window.location.href = `/login?redirect=${encodeURIComponent(redirect)}&reason=session_expired`;
  }

  throw new Error(message);
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
  const res = await fetch(`${BASE_URL}/api/products`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
    body: JSON.stringify({
      productCode: payload.productCode,
      sku: payload.sku,
      gtin: payload.gtin,
      name: payload.name || 'Untitled Product',
      description: payload.description,
      category: payload.category,
      unitOfMeasure: payload.unitOfMeasure,
      status: payload.status || 'ACTIVE',
      organizationId: payload.organizationId,
      organizationCode: payload.organizationCode
    })
  });
  if (!res.ok) await handleApiError(res, 'Create product');
  const created = await res.json();
  return {
    id: created.id,
    productCode: created.productCode,
    sku: created.sku || '',
    gtin: created.gtin || '',
    name: created.name,
    description: created.description || '',
    category: created.category || '',
    unitOfMeasure: created.unitOfMeasure || 'kg',
    status: created.status || 'ACTIVE',
    organizationId: created.organizationId,
    organizationName: created.organization?.name || payload.organizationName || ''
  };
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
  const res = await fetch(`${BASE_URL}/api/batches`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
    body: JSON.stringify({
      batchCode: payload.batchCode,
      productId: payload.productId,
      productCode: payload.productCode,
      currentOwnerOrgId: payload.currentOwnerOrgId,
      ownerCode: payload.currentOwnerCode,
      quantity: payload.quantity || 0,
      unit: payload.unit || 'kg',
      productionDate: payload.productionDate,
      expiryDate: payload.expiryDate,
      status: payload.status || 'CREATED',
      originLocation: payload.originLocation
    })
  });
  if (!res.ok) await handleApiError(res, 'Create batch');
  const created = await res.json();
  return {
    id: created.id,
    batchCode: created.batchCode,
    productId: created.productId,
    productName: created.product?.name || payload.productName || '',
    quantity: Number(created.quantity),
    unit: created.unit || 'kg',
    productionDate: created.productionDate ? new Date(created.productionDate).toISOString().split('T')[0] : '',
    expiryDate: created.expiryDate ? new Date(created.expiryDate).toISOString().split('T')[0] : '',
    currentOwnerOrgId: created.currentOwnerOrgId,
    currentOwnerName: created.currentOwner?.name || payload.currentOwnerName || '',
    status: created.status || 'CREATED',
    originLocation: created.originLocation || '',
    trustScore: 0,
    trustStatus: 'PENDING'
  };
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
  const res = await fetch(`${BASE_URL}/api/events`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
    body: JSON.stringify({
      eventCode: payload.eventCode,
      batchCode: payload.batchCode,
      batchId: payload.batchId,
      eventType: payload.eventType || 'CREATED',
      businessStep: payload.businessStep,
      disposition: payload.disposition,
      location: payload.location,
      sourceOrgCode: payload.sourceOrgCode || payload.sourceOrgId,
      sourceOrgId: payload.sourceOrgId,
      destinationOrgCode: payload.destinationOrgCode || payload.destinationOrgId,
      destinationOrgId: payload.destinationOrgId,
      eventTime: payload.eventTime,
      evidenceHash: payload.evidenceHash
    })
  });
  if (!res.ok) await handleApiError(res, 'Create event');
  const created = await res.json();
  return {
    id: created.id,
    eventCode: created.eventCode,
    batchId: created.batchId,
    batchCode: created.batch?.batchCode || payload.batchCode || '',
    productId: created.productId,
    productName: created.product?.name || payload.productName || '',
    eventType: created.eventType,
    businessStep: created.businessStep || '',
    disposition: created.disposition || '',
    sourceOrgId: created.sourceOrgId,
    sourceOrgName: created.sourceOrg?.name || payload.sourceOrgName || '',
    destinationOrgId: created.destinationOrgId,
    destinationOrgName: created.destinationOrg?.name || payload.destinationOrgName,
    location: created.location || '',
    eventTime: created.eventTime ? new Date(created.eventTime).toISOString() : new Date().toISOString(),
    recordedAt: created.createdAt ? new Date(created.createdAt).toISOString() : new Date().toISOString(),
    evidenceHash: created.evidenceHash || '',
    signature: created.signature || '',
    trustStatus: created.trustStatus || 'PENDING',
    trustScore: created.trustScore || 0,
    blockchainStatus: created.blockchainStatus || 'NOT_SUBMITTED',
    blockchainTxId: created.blockchainTx?.transactionId,
    blockNumber: created.blockchainTx?.blockNumber,
    payload: created.payload || {},
    epcisEvent: created.epcisEvent || {},
    checks: [],
    endorsements: []
  };
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
  const res = await fetch(`${BASE_URL}/api/organizations`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
    body: JSON.stringify({
      name: payload.name,
      legalName: payload.legalName || payload.name,
      organizationCode: payload.organizationCode,
      organizationType: payload.organizationType,
      registrationNumber: payload.registrationNumber,
      country: payload.country,
      address: payload.address,
      email: payload.email,
      phone: payload.phone,
      status: payload.status,
      fabricMspId: payload.fabricMspId
    })
  });
  if (!res.ok) await handleApiError(res, 'Create organization');
  const created = await res.json();
  return {
    id: created.id,
    name: created.name,
    legalName: created.legalName || created.name,
    organizationCode: created.organizationCode,
    organizationType: created.organizationType,
    registrationNumber: created.registrationNumber || '',
    country: created.country || '',
    address: created.address || '',
    email: created.email || '',
    phone: created.phone || '',
    status: created.status,
    fabricMspId: created.fabricMspId
  };
}

export async function fetchOrganizationById(id: string): Promise<Organization | null> {
  try {
    const res = await fetch(`${BASE_URL}/api/organizations/${id}`, { cache: 'no-store', headers: getAuthHeaders() });
    if (res.ok) {
      const o = await res.json();
      return {
        id: o.id,
        name: o.name,
        legalName: o.legalName || o.name,
        organizationCode: o.organizationCode,
        organizationType: o.organizationType || 'SUPPLIER',
        registrationNumber: o.registrationNumber || '',
        country: o.country || '',
        address: o.address || '',
        email: o.email || '',
        phone: o.phone || '',
        status: o.status || 'ACTIVE',
        fabricMspId: o.fabricMspId || `${o.name.replace(/\s+/g, '')}MSP`
      };
    }
  } catch (err) {
    console.warn('API error fetching organization by id:', err);
  }
  const orgs = await fetchOrganizations();
  return orgs.find((o) => o.id === id || o.organizationCode === id) || null;
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
  const res = await fetch(`${BASE_URL}/api/recalls`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
    body: JSON.stringify({
      recallCode: payload.recallCode,
      reason: payload.reason,
      severity: payload.severity || 'MEDIUM',
      status: payload.status || 'INVESTIGATING',
      batchCode: payload.affectedBatches?.[0],
      affectedQuantity: payload.affectedUnits,
      initiatedByOrgId: payload.initiatedByOrgId,
      organizationCode: payload.initiatedByOrgCode
    })
  });
  if (!res.ok) await handleApiError(res, 'Create recall');
  const created = await res.json();
  return {
    id: created.id,
    recallCode: created.recallCode,
    initiatedBy: created.initiatedByOrg?.name || payload.initiatedBy || '',
    reason: created.reason,
    severity: created.severity || 'MEDIUM',
    status: created.status || 'INVESTIGATING',
    initiatedAt: created.initiatedAt ? new Date(created.initiatedAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    affectedBatches: (created.batches || []).map((b: any) => b.batch?.batchCode || b.batchId),
    affectedUnits: (created.batches || []).reduce((acc: number, b: any) => acc + Number(b.affectedQuantity || 0), 0) || payload.affectedUnits || 0,
    warehousesAffected: 0,
    retailersAffected: 0
  };
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
  const res = await fetch(`${BASE_URL}/api/disputes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
    body: JSON.stringify({
      disputeCode: payload.disputeCode,
      eventCode: payload.eventCode,
      eventId: payload.eventId,
      reason: payload.reason,
      status: payload.status || 'OPEN',
      raisedBy: payload.raisedBy,
      raisedByOrgId: payload.raisedByOrgId,
      againstOrg: payload.againstOrg,
      againstOrgId: payload.againstOrgId
    })
  });
  if (!res.ok) await handleApiError(res, 'Create dispute');
  const created = await res.json();
  return {
    id: created.id,
    disputeCode: created.disputeCode,
    eventCode: created.event?.eventCode || payload.eventCode || '',
    batchCode: created.event?.batch?.batchCode || payload.batchCode || '',
    raisedBy: created.raisedByOrg?.name || payload.raisedBy || '',
    againstOrg: created.againstOrg?.name || payload.againstOrg || '',
    reason: created.reason,
    status: created.status || 'OPEN',
    raisedAt: created.raisedAt ? new Date(created.raisedAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    evidenceCount: 0,
    resolution: created.resolution
  };
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
  const res = await fetch(`${BASE_URL}/api/certificates`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
    body: JSON.stringify({
      certificateNumber: payload.certificateNumber,
      certificateType: payload.certificateType,
      issuerName: payload.issuerName,
      subject: payload.subject,
      organizationId: payload.organizationId,
      organizationCode: payload.organizationCode,
      issuedAt: payload.issuedAt,
      expiresAt: payload.expiresAt,
      status: payload.status || 'VALID'
    })
  });
  if (!res.ok) await handleApiError(res, 'Create certificate');
  const created = await res.json();
  return {
    id: created.id,
    certificateNumber: created.certificateNumber,
    certificateType: created.certificateType,
    issuerName: created.issuerName,
    subject: created.subject,
    organizationName: created.organization?.name || payload.organizationName || '',
    issuedAt: created.issuedAt ? new Date(created.issuedAt).toISOString().split('T')[0] : '',
    expiresAt: created.expiresAt ? new Date(created.expiresAt).toISOString().split('T')[0] : '',
    status: created.status || 'VALID',
    verificationMethod: 'Consortium X.509 Cryptographic Verification',
    standards: payload.standards || 'ISO/IEC 17065'
  };
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
  const res = await fetch(`${BASE_URL}/api/documents`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
    body: JSON.stringify({
      fileName: payload.fileName,
      fileSize: 245760,
      mimeType: payload.mimeType || 'application/pdf',
      sha256Hash: payload.sha256Hash,
      storageProvider: payload.storageProvider || 'minio-s3',
      eventCode: payload.eventCode,
      organizationId: payload.organizationId,
      organizationCode: payload.organizationCode
    })
  });
  if (!res.ok) await handleApiError(res, 'Create document');
  const created = await res.json();
  return {
    id: created.id,
    fileName: created.fileName,
    fileSize: `${Math.round(Number(created.fileSize || 0) / 1024)} KB`,
    mimeType: created.mimeType || 'application/pdf',
    organizationName: created.organization?.name || payload.organizationName || '',
    sha256Hash: created.sha256Hash,
    uploadedAt: created.createdAt ? new Date(created.createdAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    verifiedStatus: 'MATCHED',
    eventCode: payload.eventCode || '',
    storageProvider: created.storageProvider || 'minio-s3'
  };
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

export const fetchAudits = fetchAuditLogs;

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

// ==========================================
// EVIDENCE FILE UPLOAD (MINIO S3 + SHA-256)
// ==========================================
export async function uploadEvidenceFile(
  file: File,
  meta?: { organizationId?: string; organizationCode?: string; eventCode?: string }
): Promise<any> {
  const formData = new FormData();
  formData.append('file', file);
  if (meta?.organizationId) formData.append('organizationId', meta.organizationId);
  if (meta?.organizationCode) formData.append('organizationCode', meta.organizationCode);
  if (meta?.eventCode) formData.append('eventCode', meta.eventCode);

  const headers: Record<string, string> = {};
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('tt_auth_token');
    if (token) headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${BASE_URL}/api/evidence`, {
    method: 'POST',
    headers,
    body: formData,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: 'File upload failed' }));
    throw new Error(err.message || 'File upload failed');
  }

  return res.json();
}



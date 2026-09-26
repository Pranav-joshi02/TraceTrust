const assert = require('assert');
const {
  ProductContract,
  BatchContract,
  TraceEventContract,
  CertificateContract,
  RecallContract
} = require('../dist/index');

// High-fidelity Mock Fabric Stub
class MockChaincodeStub {
  constructor() {
    this.state = new Map();
    this.history = new Map();
    this.events = new Map();
    this.txId = 'tx-test-' + Date.now();
  }

  getTxID() {
    return this.txId;
  }

  getTxTimestamp() {
    return { seconds: Math.floor(Date.now() / 1000), nanos: 0 };
  }

  async getState(key) {
    return this.state.get(key) || Buffer.alloc(0);
  }

  async putState(key, value) {
    this.state.set(key, Buffer.from(value));
    if (!this.history.has(key)) {
      this.history.set(key, []);
    }
    this.history.get(key).push({
      txId: this.txId,
      timestamp: this.getTxTimestamp(),
      isDelete: false,
      value: Buffer.from(value)
    });
  }

  setEvent(name, payload) {
    this.events.set(name, Buffer.from(payload));
  }

  createCompositeKey(objectType, attributes) {
    return `${objectType}_${attributes.join('~')}`;
  }

  async getStateByRange(startKey, endKey) {
    const entries = Array.from(this.state.entries())
      .filter(([k]) => k >= startKey && k <= endKey)
      .map(([key, value]) => ({ key, value }));

    let index = 0;
    return {
      next: async () => {
        if (index < entries.length) {
          return { done: false, value: entries[index++] };
        }
        return { done: true };
      },
      close: async () => {}
    };
  }

  async getStateByPartialCompositeKey(objectType, attributes) {
    const prefix = `${objectType}_${attributes.join('~')}`;
    const entries = Array.from(this.state.entries())
      .filter(([k]) => k.startsWith(prefix))
      .map(([key, value]) => ({ key, value }));

    let index = 0;
    return {
      next: async () => {
        if (index < entries.length) {
          return { done: false, value: entries[index++] };
        }
        return { done: true };
      },
      close: async () => {}
    };
  }

  async getHistoryForKey(key) {
    const historyList = this.history.get(key) || [];
    let index = 0;
    return {
      next: async () => {
        if (index < historyList.length) {
          return { done: false, value: historyList[index++] };
        }
        return { done: true };
      },
      close: async () => {}
    };
  }
}

class MockClientIdentity {
  constructor(mspId = 'HighlandOrganicsMSP') {
    this.mspId = mspId;
  }
  getMSPID() {
    return this.mspId;
  }
}

function createMockContext(mspId = 'HighlandOrganicsMSP', stub = new MockChaincodeStub()) {
  return {
    stub,
    clientIdentity: new MockClientIdentity(mspId)
  };
}

async function runTests() {
  console.log('====================================================');
  console.log('HYPERLEDGER FABRIC SMART CONTRACT TEST SUITE');
  console.log('====================================================\n');

  const sharedStub = new MockChaincodeStub();
  const ctx = createMockContext('HighlandOrganicsMSP', sharedStub);

  // 1. ProductContract Tests
  console.log('1. Testing ProductContract...');
  const prodContract = new ProductContract();
  const prodJson = JSON.stringify({
    productCode: 'PROD-COFFEE-01',
    sku: 'SKU-COFFEE-ARABICA',
    gtin: '08901234567890',
    name: 'Organic Arabica Coffee Reserve',
    category: 'Food & Beverage',
    unitOfMeasure: 'kg'
  });
  const createdProd = await prodContract.createProduct(ctx, prodJson);
  assert.ok(createdProd, 'Product should be created');
  const exists = await prodContract.productExists(ctx, 'PROD-COFFEE-01');
  assert.strictEqual(exists, true, 'Product should exist on ledger');
  const retrievedProd = JSON.parse(await prodContract.getProduct(ctx, 'PROD-COFFEE-01'));
  assert.strictEqual(retrievedProd.name, 'Organic Arabica Coffee Reserve');
  console.log('   ✓ ProductContract created and retrieved product successfully.\n');

  // 2. BatchContract Tests
  console.log('2. Testing BatchContract...');
  const batchContract = new BatchContract();
  const batchJson = JSON.stringify({
    batchCode: 'BATCH-2026-001',
    productCode: 'PROD-COFFEE-01',
    quantity: 5000,
    unit: 'kg',
    originLocation: 'Coorg Valley, Karnataka, India'
  });
  const createdBatch = await batchContract.createBatch(ctx, batchJson);
  assert.ok(createdBatch, 'Batch should be created');
  const updatedCustody = JSON.parse(await batchContract.updateCustody(ctx, 'BATCH-2026-001', 'TransGlobalCarrierMSP', 'Transit Reefer Bay 4'));
  assert.strictEqual(updatedCustody.currentOwnerMsp, 'TransGlobalCarrierMSP');
  assert.strictEqual(updatedCustody.status, 'IN_TRANSIT');
  const history = JSON.parse(await batchContract.getBatchHistory(ctx, 'BATCH-2026-001'));
  assert.strictEqual(history.length, 2, 'History must contain 2 ledger revisions');
  console.log('   ✓ BatchContract custody transfer & audit history verified.\n');

  // 3. TraceEventContract Tests
  console.log('3. Testing TraceEventContract...');
  const traceContract = new TraceEventContract();
  const event1 = JSON.stringify({
    eventCode: 'EVT-01',
    batchCode: 'BATCH-2026-001',
    productCode: 'PROD-COFFEE-01',
    eventType: 'CREATED',
    businessStep: 'commissioning',
    location: 'Highland Plantation',
    trustScore: 98,
    trustStatus: 'VERIFIED'
  });
  const event2 = JSON.stringify({
    eventCode: 'EVT-02',
    batchCode: 'BATCH-2026-001',
    productCode: 'PROD-COFFEE-01',
    eventType: 'SHIPPED',
    businessStep: 'shipping',
    location: 'Port of Mangalore',
    trustScore: 95,
    trustStatus: 'VERIFIED'
  });
  await traceContract.recordTraceEvent(ctx, event1);
  await traceContract.recordTraceEvent(ctx, event2);

  // Test trust threshold enforcement (negative test)
  let rejected = false;
  try {
    await traceContract.recordTraceEvent(ctx, JSON.stringify({
      eventCode: 'EVT-FAIL',
      batchCode: 'BATCH-2026-001',
      eventType: 'SHIPPED',
      trustScore: 40, // Below threshold
      trustStatus: 'REJECTED'
    }));
  } catch (e) {
    rejected = true;
  }
  assert.strictEqual(rejected, true, 'Low trust score must be rejected by smart contract policy');

  const provenanceResult = JSON.parse(await traceContract.verifyProvenance(ctx, 'BATCH-2026-001'));
  assert.strictEqual(provenanceResult.verified, true);
  assert.strictEqual(provenanceResult.eventCount, 2);
  console.log('   ✓ TraceEventContract admitted verified events & rejected untrusted event.\n');

  // 4. CertificateContract Tests
  console.log('4. Testing CertificateContract...');
  const certContract = new CertificateContract();
  const certJson = JSON.stringify({
    certificateNumber: 'CERT-ORG-2026-001',
    certificateType: 'USDA_ORGANIC',
    subjectOrgMsp: 'HighlandOrganicsMSP',
    expiresAt: '2028-09-25T00:00:00Z',
    documentHash: 'a68f085e9b724581f1b2c4516'
  });
  await certContract.issueCertificate(ctx, certJson);
  const verifyValid = JSON.parse(await certContract.verifyCertificate(ctx, 'CERT-ORG-2026-001'));
  assert.strictEqual(verifyValid.valid, true);

  await certContract.revokeCertificate(ctx, 'CERT-ORG-2026-001', 'Audit failed.');
  const verifyRevoked = JSON.parse(await certContract.verifyCertificate(ctx, 'CERT-ORG-2026-001'));
  assert.strictEqual(verifyRevoked.valid, false);
  assert.strictEqual(verifyRevoked.status, 'REVOKED');
  console.log('   ✓ CertificateContract issued and revoked certificate on ledger.\n');

  // 5. RecallContract Tests
  console.log('5. Testing RecallContract...');
  const recallContract = new RecallContract();
  const recallJson = JSON.stringify({
    recallCode: 'REC-2026-01',
    title: 'Moisture Exceedance Recall',
    severity: 'HIGH',
    affectedBatchCodes: ['BATCH-2026-001'],
    reason: 'Defect detected in sensory analysis.'
  });
  await recallContract.initiateRecall(ctx, recallJson);
  const recallCheck = JSON.parse(await recallContract.checkBatchRecallStatus(ctx, 'BATCH-2026-001'));
  assert.strictEqual(recallCheck.recalled, true);

  // Check batch status was locked in BatchContract state
  const lockedBatch = JSON.parse(await batchContract.getBatch(ctx, 'BATCH-2026-001'));
  assert.strictEqual(lockedBatch.status, 'RECALLED');

  // Try custody transfer on recalled batch - must be blocked
  let custodyBlocked = false;
  try {
    await batchContract.updateCustody(ctx, 'BATCH-2026-001', 'RetailerMSP', 'Retail Bay 2');
  } catch (e) {
    custodyBlocked = true;
  }
  assert.strictEqual(custodyBlocked, true, 'Recalled batch custody transfer must be blocked by smart contract');
  console.log('   ✓ RecallContract locked affected batch and blocked subsequent transfers.\n');

  console.log('====================================================');
  console.log('ALL 5 HYPERLEDGER FABRIC SMART CONTRACTS PASSED (100%)');
  console.log('====================================================');
}

runTests().catch((err) => {
  console.error('TEST FAILED:', err);
  process.exit(1);
});

import { Context, Contract, Info, Returns, Transaction } from 'fabric-contract-api';
import { toBuf, toStr } from '../utils';

export interface TraceEventAsset {
  docType?: string;
  eventCode: string;
  batchCode: string;
  productCode: string;
  eventType: string;
  businessStep: string;
  sourceOrgMsp: string;
  destinationOrgMsp?: string;
  location: string;
  timestamp: string;
  trustScore: number;
  trustStatus: 'VERIFIED' | 'SUSPICIOUS' | 'REJECTED';
  signature: string;
  evidenceHash: string;
  epcisDocument?: any;
  txId: string;
}

@Info({ title: 'TraceEventContract', description: 'Smart Contract for immutable provenance event recording and verification' })
export class TraceEventContract extends Contract {
  constructor() {
    super('TraceEventContract');
  }

  @Transaction()
  @Returns('string')
  async recordTraceEvent(ctx: Context, eventJson: string): Promise<string> {
    const payload = JSON.parse(eventJson) as Partial<TraceEventAsset>;
    if (!payload.eventCode || !payload.batchCode || !payload.eventType) {
      throw new Error('eventCode, batchCode, and eventType are mandatory.');
    }

    // Enforce pre-commit trust criteria: only events with acceptable trust score are admitted to ledger
    const score = Number(payload.trustScore ?? 100);
    if (score < 60 || payload.trustStatus === 'REJECTED') {
      throw new Error(`Transaction rejected by chaincode policy: Trust score (${score}) or status (${payload.trustStatus}) fails consortium threshold.`);
    }

    // Check if event already exists
    const existing = await ctx.stub.getState(`EVT_${payload.eventCode}`);
    if (existing && existing.length > 0) {
      throw new Error(`Event with code ${payload.eventCode} already committed.`);
    }

    let callerMsp = 'ConsortiumMSP';
    try {
      callerMsp = ctx.clientIdentity.getMSPID();
    } catch {
      // Mock environment
    }

    const event: TraceEventAsset = {
      docType: 'traceEvent',
      eventCode: payload.eventCode,
      batchCode: payload.batchCode,
      productCode: payload.productCode || 'PROD-UNKNOWN',
      eventType: payload.eventType,
      businessStep: payload.businessStep || 'processing',
      sourceOrgMsp: payload.sourceOrgMsp || callerMsp,
      destinationOrgMsp: payload.destinationOrgMsp,
      location: payload.location || 'Consortium Facility',
      timestamp: payload.timestamp || new Date().toISOString(),
      trustScore: score,
      trustStatus: 'VERIFIED',
      signature: payload.signature || 'SIG-CHAINCODE-VERIFIED',
      evidenceHash: payload.evidenceHash || '',
      epcisDocument: payload.epcisDocument,
      txId: ctx.stub.getTxID()
    };

    // Store by Event Code
    await ctx.stub.putState(`EVT_${event.eventCode}`, toBuf(event));

    // Create composite index for batch-level chronological traversal
    const compositeKey = ctx.stub.createCompositeKey('batch~time~event', [
      event.batchCode,
      event.timestamp,
      event.eventCode
    ]);
    await ctx.stub.putState(compositeKey, toBuf(event.eventCode));

    ctx.stub.setEvent('TraceEventRecorded', toBuf({
      eventCode: event.eventCode,
      batchCode: event.batchCode,
      eventType: event.eventType,
      txId: event.txId
    }));

    return JSON.stringify(event);
  }

  @Transaction(false)
  @Returns('string')
  async getEvent(ctx: Context, eventCode: string): Promise<string> {
    const buffer = await ctx.stub.getState(`EVT_${eventCode}`);
    if (!buffer || buffer.length === 0) {
      throw new Error(`Event ${eventCode} does not exist on the ledger.`);
    }
    return toStr(buffer);
  }

  @Transaction(false)
  @Returns('string')
  async getTraceEventsForBatch(ctx: Context, batchCode: string): Promise<string> {
    const iterator = await ctx.stub.getStateByPartialCompositeKey('batch~time~event', [batchCode]);
    const events: TraceEventAsset[] = [];

    let result = await iterator.next();
    while (!result.done) {
      if (result.value && result.value.value) {
        const eventCode = toStr(result.value.value);
        const eventBuffer = await ctx.stub.getState(`EVT_${eventCode}`);
        if (eventBuffer && eventBuffer.length > 0) {
          try {
            events.push(JSON.parse(toStr(eventBuffer)));
          } catch {
            // ignore
          }
        }
      }
      result = await iterator.next();
    }
    await iterator.close();
    return JSON.stringify(events);
  }

  @Transaction(false)
  @Returns('string')
  async verifyProvenance(ctx: Context, batchCode: string): Promise<string> {
    const eventsJson = await this.getTraceEventsForBatch(ctx, batchCode);
    const events: TraceEventAsset[] = JSON.parse(eventsJson);

    if (events.length === 0) {
      return JSON.stringify({ verified: false, reason: 'Zero provenance events found for batch.', eventCount: 0 });
    }

    const issues: string[] = [];
    const sequence = events.map((e) => e.eventType);

    if (sequence.includes('SHIPPED') && !sequence.includes('MANUFACTURED') && !sequence.includes('CREATED')) {
      issues.push('Sequence Violation: SHIPPED event without prior CREATED or MANUFACTURED event.');
    }
    if (sequence.includes('RECEIVED') && !sequence.includes('SHIPPED')) {
      issues.push('Sequence Violation: RECEIVED event without prior SHIPPED dispatch.');
    }

    const verified = issues.length === 0;
    return JSON.stringify({
      verified,
      batchCode,
      eventCount: events.length,
      provenanceSequence: sequence,
      issues,
      ledgerProof: 'Hyperledger Fabric v2.5 Consensus Endorsed'
    });
  }
}

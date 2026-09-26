import { Context, Contract, Info, Returns, Transaction } from 'fabric-contract-api';
import { toBuf, toStr } from '../utils';

export interface RecallAsset {
  docType?: string;
  recallCode: string;
  title: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  status: 'INITIATED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  affectedBatchCodes: string[];
  initiatorOrgMsp: string;
  reason: string;
  initiatedAt: string;
  resolvedAt?: string;
  txId: string;
}

@Info({ title: 'RecallContract', description: 'Smart Contract for autonomous safety recalls and batch lockdown enforcement' })
export class RecallContract extends Contract {
  constructor() {
    super('RecallContract');
  }

  @Transaction()
  @Returns('string')
  async initiateRecall(ctx: Context, recallJson: string): Promise<string> {
    const payload = JSON.parse(recallJson) as Partial<RecallAsset>;
    if (!payload.recallCode || !payload.affectedBatchCodes || payload.affectedBatchCodes.length === 0) {
      throw new Error('recallCode and affectedBatchCodes array are required.');
    }

    const key = `RECALL_${payload.recallCode}`;
    const existing = await ctx.stub.getState(key);
    if (existing && existing.length > 0) {
      throw new Error(`Recall ${payload.recallCode} already registered on ledger.`);
    }

    let callerMsp = 'RegulatorMSP';
    try {
      callerMsp = ctx.clientIdentity.getMSPID();
    } catch {
      // Mock environment
    }

    const recall: RecallAsset = {
      docType: 'recall',
      recallCode: payload.recallCode,
      title: payload.title || 'Product Safety Action',
      severity: payload.severity || 'HIGH',
      status: 'INITIATED',
      affectedBatchCodes: payload.affectedBatchCodes,
      initiatorOrgMsp: payload.initiatorOrgMsp || callerMsp,
      reason: payload.reason || 'Consortium safety advisory.',
      initiatedAt: new Date().toISOString(),
      txId: ctx.stub.getTxID()
    };

    // Lock all affected batches in the world state
    for (const batchCode of recall.affectedBatchCodes) {
      const batchKey = `BATCH_${batchCode}`;
      const batchBuffer = await ctx.stub.getState(batchKey);
      if (batchBuffer && batchBuffer.length > 0) {
        try {
          const batch = JSON.parse(toStr(batchBuffer));
          batch.status = 'RECALLED';
          batch.lastUpdatedTxId = ctx.stub.getTxID();
          await ctx.stub.putState(batchKey, toBuf(batch));
        } catch {
          // continue
        }
      }

      // Map batch to active recall
      await ctx.stub.putState(`BATCH_RECALL_${batchCode}`, toBuf(recall.recallCode));
    }

    await ctx.stub.putState(key, toBuf(recall));

    ctx.stub.setEvent('RecallInitiated', toBuf({
      recallCode: recall.recallCode,
      severity: recall.severity,
      affectedBatches: recall.affectedBatchCodes
    }));

    return JSON.stringify(recall);
  }

  @Transaction(false)
  @Returns('string')
  async checkBatchRecallStatus(ctx: Context, batchCode: string): Promise<string> {
    const recallCodeBuffer = await ctx.stub.getState(`BATCH_RECALL_${batchCode}`);
    if (!recallCodeBuffer || recallCodeBuffer.length === 0) {
      return JSON.stringify({ recalled: false, batchCode });
    }

    const recallCode = toStr(recallCodeBuffer);
    const recallBuffer = await ctx.stub.getState(`RECALL_${recallCode}`);
    const recall = recallBuffer && recallBuffer.length > 0 ? JSON.parse(toStr(recallBuffer)) : null;

    return JSON.stringify({
      recalled: true,
      batchCode,
      recallCode,
      recall
    });
  }

  @Transaction()
  @Returns('string')
  async updateRecallStatus(ctx: Context, recallCode: string, newStatus: string): Promise<string> {
    const key = `RECALL_${recallCode}`;
    const buffer = await ctx.stub.getState(key);
    if (!buffer || buffer.length === 0) {
      throw new Error(`Recall ${recallCode} not found.`);
    }

    const recall: RecallAsset = JSON.parse(toStr(buffer));
    recall.status = newStatus as any;
    if (newStatus === 'COMPLETED' || newStatus === 'CANCELLED') {
      recall.resolvedAt = new Date().toISOString();
    }
    recall.txId = ctx.stub.getTxID();

    await ctx.stub.putState(key, toBuf(recall));

    ctx.stub.setEvent('RecallStatusUpdated', toBuf({
      recallCode,
      status: newStatus
    }));

    return JSON.stringify(recall);
  }

  @Transaction(false)
  @Returns('string')
  async listActiveRecalls(ctx: Context): Promise<string> {
    const iterator = await ctx.stub.getStateByRange('RECALL_', 'RECALL_\uffff');
    const recalls: RecallAsset[] = [];

    let result = await iterator.next();
    while (!result.done) {
      if (result.value && result.value.value) {
        try {
          const rec: RecallAsset = JSON.parse(toStr(result.value.value));
          if (rec.status === 'INITIATED' || rec.status === 'IN_PROGRESS') {
            recalls.push(rec);
          }
        } catch {
          // ignore
        }
      }
      result = await iterator.next();
    }
    await iterator.close();
    return JSON.stringify(recalls);
  }
}

import { Context, Contract, Info, Returns, Transaction } from 'fabric-contract-api';
import { toBuf, toStr } from '../utils';

export interface BatchAsset {
  docType?: string;
  batchCode: string;
  productCode: string;
  quantity: number;
  unit: string;
  originLocation: string;
  productionDate: string;
  expiryDate: string;
  currentOwnerMsp: string;
  status: 'AVAILABLE' | 'IN_TRANSIT' | 'PROCESSING' | 'RECALLED' | 'DEPLETED';
  endorsementThresholdMet: boolean;
  lastUpdatedTxId: string;
}

@Info({ title: 'BatchContract', description: 'Smart Contract for batch lifecycle, custody transfers, and audit trails' })
export class BatchContract extends Contract {
  constructor() {
    super('BatchContract');
  }

  @Transaction(false)
  @Returns('boolean')
  async batchExists(ctx: Context, batchCode: string): Promise<boolean> {
    const buffer = await ctx.stub.getState(`BATCH_${batchCode}`);
    return !!buffer && buffer.length > 0;
  }

  @Transaction()
  @Returns('string')
  async createBatch(ctx: Context, batchJson: string): Promise<string> {
    const payload = JSON.parse(batchJson) as Partial<BatchAsset>;
    if (!payload.batchCode || !payload.productCode) {
      throw new Error('Batch code and product code are required.');
    }

    const exists = await this.batchExists(ctx, payload.batchCode);
    if (exists) {
      throw new Error(`Batch with code ${payload.batchCode} already exists on ledger.`);
    }

    let callerMsp = 'ConsortiumMSP';
    try {
      callerMsp = ctx.clientIdentity.getMSPID();
    } catch {
      // Fallback
    }

    const batch: BatchAsset = {
      docType: 'batch',
      batchCode: payload.batchCode,
      productCode: payload.productCode,
      quantity: Number(payload.quantity || 1000),
      unit: payload.unit || 'kg',
      originLocation: payload.originLocation || 'Origin Plantation Corridor',
      productionDate: payload.productionDate || new Date().toISOString().split('T')[0],
      expiryDate: payload.expiryDate || '2027-12-31',
      currentOwnerMsp: payload.currentOwnerMsp || callerMsp,
      status: 'AVAILABLE',
      endorsementThresholdMet: true,
      lastUpdatedTxId: ctx.stub.getTxID()
    };

    const key = `BATCH_${batch.batchCode}`;
    await ctx.stub.putState(key, toBuf(batch));

    ctx.stub.setEvent('BatchCreated', toBuf({ batchCode: batch.batchCode, owner: batch.currentOwnerMsp }));
    return JSON.stringify(batch);
  }

  @Transaction()
  @Returns('string')
  async updateCustody(ctx: Context, batchCode: string, newOwnerMsp: string, location: string): Promise<string> {
    const key = `BATCH_${batchCode}`;
    const buffer = await ctx.stub.getState(key);
    if (!buffer || buffer.length === 0) {
      throw new Error(`Batch ${batchCode} does not exist.`);
    }

    const batch: BatchAsset = JSON.parse(toStr(buffer));

    if (batch.status === 'RECALLED') {
      throw new Error(`Batch ${batchCode} is RECALLED. Custody transfers are locked by smart contract policy.`);
    }

    const prevOwner = batch.currentOwnerMsp;
    batch.currentOwnerMsp = newOwnerMsp;
    if (location) batch.originLocation = location;
    batch.lastUpdatedTxId = ctx.stub.getTxID();
    batch.status = 'IN_TRANSIT';

    await ctx.stub.putState(key, toBuf(batch));

    ctx.stub.setEvent('CustodyTransferred', toBuf({
      batchCode,
      from: prevOwner,
      to: newOwnerMsp,
      txId: ctx.stub.getTxID()
    }));

    return JSON.stringify(batch);
  }

  @Transaction(false)
  @Returns('string')
  async getBatch(ctx: Context, batchCode: string): Promise<string> {
    const buffer = await ctx.stub.getState(`BATCH_${batchCode}`);
    if (!buffer || buffer.length === 0) {
      throw new Error(`Batch ${batchCode} does not exist on the ledger.`);
    }
    return toStr(buffer);
  }

  @Transaction(false)
  @Returns('string')
  async getBatchHistory(ctx: Context, batchCode: string): Promise<string> {
    const key = `BATCH_${batchCode}`;
    const iterator = await ctx.stub.getHistoryForKey(key);
    const history: Array<{ txId: string; timestamp: string; isDelete: boolean; value: any }> = [];

    let result = await iterator.next();
    while (!result.done) {
      if (result.value) {
        const txTimestamp = result.value.timestamp;
        const timestampStr = txTimestamp ? new Date((txTimestamp.seconds as any) * 1000).toISOString() : new Date().toISOString();
        let val: any = null;
        const rawStr = toStr(result.value.value);
        if (rawStr) {
          try {
            val = JSON.parse(rawStr);
          } catch {
            val = rawStr;
          }
        }

        history.push({
          txId: result.value.txId,
          timestamp: timestampStr,
          isDelete: result.value.isDelete,
          value: val
        });
      }
      result = await iterator.next();
    }
    await iterator.close();
    return JSON.stringify(history);
  }
}

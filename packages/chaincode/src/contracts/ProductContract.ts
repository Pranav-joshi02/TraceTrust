import { Context, Contract, Info, Returns, Transaction } from 'fabric-contract-api';
import { toBuf, toStr } from '../utils';

export interface ProductAsset {
  docType?: string;
  productCode: string;
  sku: string;
  gtin: string;
  name: string;
  category: string;
  unitOfMeasure: string;
  ownerOrgMsp: string;
  createdAt: string;
  status: 'ACTIVE' | 'ARCHIVED';
}

@Info({ title: 'ProductContract', description: 'Smart Contract for managing consortium product master records' })
export class ProductContract extends Contract {
  constructor() {
    super('ProductContract');
  }

  @Transaction(false)
  @Returns('boolean')
  async productExists(ctx: Context, productCode: string): Promise<boolean> {
    const buffer = await ctx.stub.getState(`PROD_${productCode}`);
    return !!buffer && buffer.length > 0;
  }

  @Transaction()
  @Returns('string')
  async createProduct(ctx: Context, productJson: string): Promise<string> {
    const payload = JSON.parse(productJson) as Partial<ProductAsset>;
    if (!payload.productCode) {
      throw new Error('Product code is required');
    }

    const exists = await this.productExists(ctx, payload.productCode);
    if (exists) {
      throw new Error(`Product with code ${payload.productCode} already exists on the ledger.`);
    }

    let callerMsp = 'ConsortiumMSP';
    try {
      callerMsp = ctx.clientIdentity.getMSPID();
    } catch {
      // Fallback for mock environments
    }

    const product: ProductAsset = {
      docType: 'product',
      productCode: payload.productCode,
      sku: payload.sku || 'SKU-GEN',
      gtin: payload.gtin || '00000000000000',
      name: payload.name || 'Untitled Product',
      category: payload.category || 'Commodity',
      unitOfMeasure: payload.unitOfMeasure || 'kg',
      ownerOrgMsp: payload.ownerOrgMsp || callerMsp,
      createdAt: new Date().toISOString(),
      status: 'ACTIVE'
    };

    const key = `PROD_${product.productCode}`;
    await ctx.stub.putState(key, toBuf(product));

    ctx.stub.setEvent('ProductCreated', toBuf({ productCode: product.productCode, owner: product.ownerOrgMsp }));
    return JSON.stringify(product);
  }

  @Transaction(false)
  @Returns('string')
  async getProduct(ctx: Context, productCode: string): Promise<string> {
    const buffer = await ctx.stub.getState(`PROD_${productCode}`);
    if (!buffer || buffer.length === 0) {
      throw new Error(`Product with code ${productCode} does not exist on the ledger.`);
    }
    return toStr(buffer);
  }

  @Transaction(false)
  @Returns('string')
  async listProducts(ctx: Context): Promise<string> {
    const iterator = await ctx.stub.getStateByRange('PROD_', 'PROD_\uffff');
    const results: ProductAsset[] = [];

    let result = await iterator.next();
    while (!result.done) {
      if (result.value && result.value.value) {
        try {
          results.push(JSON.parse(toStr(result.value.value)));
        } catch {
          // ignore corrupted
        }
      }
      result = await iterator.next();
    }
    await iterator.close();
    return JSON.stringify(results);
  }
}

import * as fs from 'fs';
import * as path from 'path';
import YAML from 'yaml';

export interface ParsedProduct {
  name: string;
  productCode?: string;
  sku?: string;
  gtin?: string;
  category?: string;
  unitOfMeasure?: string;
  description?: string;
  organizationCode?: string;
  metadata?: Record<string, unknown>;
  _sourceFile?: string;
}

export interface ParsedBatch {
  productCode?: string;
  productId?: string;
  productName?: string;
  batchCode?: string;
  quantity: number;
  unit?: string;
  productionDate?: string;
  expiryDate?: string;
  originLocation?: string;
  status?: string;
  ownerCode?: string;
  metadata?: Record<string, unknown>;
  _sourceFile?: string;
}

export interface ParsedManifest {
  products: ParsedProduct[];
  batches: ParsedBatch[];
  sourceFile: string;
}

const SUPPORTED_EXTS = new Set(['.yaml', '.yml', '.json', '.csv', '.txt', '.md']);

/**
 * Scan a target (file, directory, or '.') and return all matching file paths.
 */
export function resolveTargetFiles(target: string = '.'): string[] {
  // Handle glob wildcard "*" in current directory
  if (target === '*' || target === '.') {
    const cwd = process.cwd();
    return fs
      .readdirSync(cwd)
      .filter((file) => {
        const ext = path.extname(file).toLowerCase();
        return SUPPORTED_EXTS.has(ext) && !file.startsWith('.');
      })
      .map((file) => path.join(cwd, file));
  }

  const resolved = path.resolve(process.cwd(), target);
  if (!fs.existsSync(resolved)) {
    // Check if target is a simple filename or pattern in cwd
    const cwdMatch = path.join(process.cwd(), target);
    if (fs.existsSync(cwdMatch)) {
      return [cwdMatch];
    }
    throw new Error(`Target path not found: ${target}`);
  }

  const stat = fs.statSync(resolved);
  if (stat.isDirectory()) {
    return fs
      .readdirSync(resolved)
      .filter((file) => {
        const ext = path.extname(file).toLowerCase();
        return SUPPORTED_EXTS.has(ext) && !file.startsWith('.');
      })
      .map((file) => path.join(resolved, file));
  }

  return [resolved];
}

/**
 * Parse a CSV content into an array of objects.
 */
function parseCsv(content: string): Record<string, any>[] {
  const lines = content
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0 && !l.startsWith('#'));
  if (lines.length < 2) return [];

  const headers = lines[0]
    .split(',')
    .map((h) => h.replace(/^["']|["']$/g, '').trim());

  const rows: Record<string, any>[] = [];
  for (let i = 1; i < lines.length; i++) {
    const values = parseCsvLine(lines[i]);
    const obj: Record<string, any> = {};
    headers.forEach((header, index) => {
      const val = values[index]?.trim() ?? '';
      obj[header] = val;
    });
    rows.push(obj);
  }
  return rows;
}

function parseCsvLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"' || char === "'") {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current.replace(/^["']|["']$/g, ''));
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.replace(/^["']|["']$/g, ''));
  return result;
}

/**
 * Parse plain key-value text blocks separated by '---' or double blank lines.
 */
function parseKeyValueText(content: string): Record<string, any>[] {
  const docs = content
    .split(/(?:^|\n)---(?:\n|$)/)
    .map((d) => d.trim())
    .filter((d) => d.length > 0);

  const results: Record<string, any>[] = [];

  for (const doc of docs) {
    const lines = doc.split(/\r?\n/).map((l) => l.trim()).filter((l) => l.length > 0 && !l.startsWith('#'));
    const obj: Record<string, any> = {};
    for (const line of lines) {
      const colonIdx = line.indexOf(':');
      if (colonIdx > 0) {
        const key = line.slice(0, colonIdx).trim();
        let val: any = line.slice(colonIdx + 1).trim();
        // remove surrounding quotes
        val = val.replace(/^["']|["']$/g, '');
        // handle numbers
        if (/^-?\d+(\.\d+)?$/.test(val)) {
          val = Number(val);
        }
        obj[key] = val;
      }
    }
    if (Object.keys(obj).length > 0) {
      results.push(obj);
    }
  }

  return results;
}

/**
 * Universal document loader: extracts Products and Batches from any file.
 */
export function parseDocument(filePath: string): ParsedManifest {
  const ext = path.extname(filePath).toLowerCase();
  const raw = fs.readFileSync(filePath, 'utf-8');
  const filename = path.basename(filePath);

  let rawDocs: any[] = [];

  if (ext === '.json') {
    try {
      const parsed = JSON.parse(raw);
      rawDocs = Array.isArray(parsed) ? parsed : [parsed];
    } catch (e: any) {
      throw new Error(`JSON syntax error in ${filename}: ${e.message}`);
    }
  } else if (ext === '.yaml' || ext === '.yml') {
    try {
      // Parse multi-document YAML
      const parsed = YAML.parseAllDocuments(raw).map((d) => d.toJSON()).filter(Boolean);
      rawDocs = parsed;
    } catch (e: any) {
      throw new Error(`YAML syntax error in ${filename}: ${e.message}`);
    }
  } else if (ext === '.csv') {
    rawDocs = parseCsv(raw);
  } else {
    // .txt or .md key-value text format
    // First try YAML parse in case it's clean YAML with .txt extension
    try {
      const yamlParsed = YAML.parseAllDocuments(raw).map((d) => d.toJSON()).filter(Boolean);
      if (yamlParsed.length > 0 && typeof yamlParsed[0] === 'object' && yamlParsed[0] !== null) {
        rawDocs = yamlParsed;
      } else {
        rawDocs = parseKeyValueText(raw);
      }
    } catch {
      rawDocs = parseKeyValueText(raw);
    }
  }

  const products: ParsedProduct[] = [];
  const batches: ParsedBatch[] = [];

  for (const item of rawDocs) {
    if (!item || typeof item !== 'object') continue;

    let parentProductCode: string | undefined = undefined;
    let parentProductName: string | undefined = undefined;

    // Check if item has a single { product: {...}, batches: [...] } manifest structure
    if (item.product && typeof item.product === 'object') {
      const prod = normalizeProduct(item.product, filename, products);
      if (prod) {
        parentProductCode = prod.productCode;
        parentProductName = prod.name;
      }
    }

    // Check if item has { products: [...] }
    if (Array.isArray(item.products)) {
      for (const p of item.products) {
        const prod = normalizeProduct(p, filename, products);
        if (prod && !parentProductCode) {
          parentProductCode = prod.productCode;
          parentProductName = prod.name;
        }
      }
    }

    // Now normalize batches (inheriting parent productCode if missing)
    if (Array.isArray(item.batches)) {
      for (const b of item.batches) {
        if (!b.productCode && !b.productId && !b.product) {
          if (parentProductCode) b.productCode = parentProductCode;
          if (parentProductName && !b.productName) b.productName = parentProductName;
        }
        normalizeBatch(b, filename, batches);
      }
    }

    // Check if this item is directly a batch or product (if not already handled)
    if (!item.product && !item.products && !item.batches) {
      const isExplicitBatch = item.type === 'BATCH' || item.type === 'batch' || ('quantity' in item && ('productCode' in item || 'product' in item || 'batchCode' in item));
      const isExplicitProduct = item.type === 'PRODUCT' || item.type === 'product' || ('name' in item && !('quantity' in item));

      if (isExplicitBatch) {
        normalizeBatch(item, filename, batches);
      } else if (isExplicitProduct) {
        normalizeProduct(item, filename, products);
      } else if ('quantity' in item) {
        normalizeBatch(item, filename, batches);
      } else if ('name' in item) {
        normalizeProduct(item, filename, products);
      }
    }
  }

  return {
    products,
    batches,
    sourceFile: filePath
  };
}

function normalizeProduct(raw: any, sourceFile: string, targetList: ParsedProduct[]): ParsedProduct | null {
  if (!raw.name && !raw.productCode) return null;

  const product: ParsedProduct = {
    name: String(raw.name ?? raw.productName ?? 'Unnamed Product'),
    productCode: raw.productCode ? String(raw.productCode) : undefined,
    sku: raw.sku ? String(raw.sku) : undefined,
    gtin: raw.gtin ? String(raw.gtin) : undefined,
    category: raw.category ? String(raw.category) : undefined,
    unitOfMeasure: raw.unitOfMeasure ?? raw.unit ? String(raw.unitOfMeasure ?? raw.unit) : 'unit',
    description: raw.description ? String(raw.description) : undefined,
    organizationCode: raw.organizationCode ?? raw.organization ? String(raw.organizationCode ?? raw.organization) : undefined,
    metadata: raw.metadata && typeof raw.metadata === 'object' ? raw.metadata : undefined,
    _sourceFile: sourceFile
  };

  targetList.push(product);
  return product;
}

function normalizeBatch(raw: any, sourceFile: string, targetList: ParsedBatch[]): ParsedBatch | null {
  const qty = Number(raw.quantity ?? raw.qty ?? 0);
  if (isNaN(qty) || qty <= 0) return null;

  const batch: ParsedBatch = {
    productCode: raw.productCode ?? raw.product ? String(raw.productCode ?? raw.product) : undefined,
    productId: raw.productId ? String(raw.productId) : undefined,
    productName: raw.productName ? String(raw.productName) : undefined,
    batchCode: raw.batchCode ? String(raw.batchCode) : undefined,
    quantity: qty,
    unit: raw.unit ? String(raw.unit) : undefined,
    productionDate: raw.productionDate ?? raw.harvestDate ? String(raw.productionDate ?? raw.harvestDate) : undefined,
    expiryDate: raw.expiryDate ? String(raw.expiryDate) : undefined,
    originLocation: raw.originLocation ?? raw.location ? String(raw.originLocation ?? raw.location) : undefined,
    status: raw.status ? String(raw.status).toUpperCase() : 'CREATED',
    ownerCode: raw.ownerCode ?? raw.owner ? String(raw.ownerCode ?? raw.owner) : undefined,
    metadata: raw.metadata && typeof raw.metadata === 'object' ? raw.metadata : undefined,
    _sourceFile: sourceFile
  };

  targetList.push(batch);
  return batch;
}

import { createHash } from 'node:crypto';

export function sha256(input: string | Buffer) {
  return createHash('sha256').update(input).digest('hex');
}

export function stableHash(value: unknown) {
  return sha256(JSON.stringify(value, Object.keys(value as object).sort()));
}

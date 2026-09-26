export function toStr(buf: Uint8Array | Buffer | undefined | null): string {
  if (!buf) return '';
  return Buffer.from(buf).toString('utf8');
}

export function toBuf(data: string | object): Buffer {
  if (typeof data === 'string') {
    return Buffer.from(data, 'utf8');
  }
  return Buffer.from(JSON.stringify(data), 'utf8');
}

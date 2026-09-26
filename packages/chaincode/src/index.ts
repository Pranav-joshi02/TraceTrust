import { ProductContract } from './contracts/ProductContract';
import { BatchContract } from './contracts/BatchContract';
import { TraceEventContract } from './contracts/TraceEventContract';
import { CertificateContract } from './contracts/CertificateContract';
import { RecallContract } from './contracts/RecallContract';

export { ProductContract } from './contracts/ProductContract';
export { BatchContract } from './contracts/BatchContract';
export { TraceEventContract } from './contracts/TraceEventContract';
export { CertificateContract } from './contracts/CertificateContract';
export { RecallContract } from './contracts/RecallContract';

export const contracts: any[] = [
  ProductContract,
  BatchContract,
  TraceEventContract,
  CertificateContract,
  RecallContract
];

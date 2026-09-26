export type TrustStatus = 'PENDING' | 'VALIDATING' | 'VERIFIED' | 'SUSPICIOUS' | 'REJECTED' | 'DISPUTED';
export type BlockchainStatus = 'NOT_SUBMITTED' | 'SUBMITTED' | 'CONFIRMED' | 'FAILED';
export type EventType = 'CREATED' | 'MANUFACTURED' | 'TRANSFORMED' | 'QUALITY_CHECKED' | 'PACKED' | 'SHIPPED' | 'RECEIVED' | 'TRANSFERRED' | 'SOLD' | 'RECALLED';

export interface TrustCheckResult {
  checkType: string;
  status: 'PASSED' | 'FAILED' | 'WARNING';
  score: number;
  reason: string;
}

export interface TrustDecision {
  status: TrustStatus;
  score: number;
  checks: TrustCheckResult[];
  blockchainStatus: BlockchainStatus;
}

export interface TraceNode {
  id: string;
  label: string;
  type: string;
  status: TrustStatus;
}

export interface TraceEdge {
  id: string;
  source: string;
  target: string;
  eventType: EventType;
  eventCode: string;
  occurredAt: string;
}

export interface BatchTrace {
  batchCode: string;
  productName: string;
  nodes: TraceNode[];
  edges: TraceEdge[];
}

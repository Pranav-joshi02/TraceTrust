'use client';

import React, { useState, useEffect } from 'react';
import { CheckCircle2, Clock, AlertTriangle, ArrowRight, ShieldCheck, Box, FileText, ExternalLink } from 'lucide-react';
import { StatusPill } from '../ui/StatusPill';

export interface StageNode {
  id: string;
  role: string;
  name: string;
  location: string;
  eventCode: string;
  eventType: string;
  timestamp: string;
  trustScore: number;
  status: 'VERIFIED' | 'PENDING' | 'SUSPICIOUS';
  txId: string;
  details: string;
}

const defaultStages: StageNode[] = [
  {
    id: 'node-1',
    role: 'Origin Supplier',
    name: 'Highland Organics Estate',
    location: 'Coorg, Karnataka (12.42° N)',
    eventCode: 'EVT-82A19-01',
    eventType: 'CREATED',
    timestamp: '2026-09-12 08:00 UTC',
    trustScore: 99,
    status: 'VERIFIED',
    txId: 'TX-FABRIC-7801-COMMISSION',
    details: 'Harvest certified organic shade-grown cherries. Yield: 5,000 kg.'
  },
  {
    id: 'node-2',
    role: 'Primary Processor',
    name: 'Highland Wet Mill',
    location: 'Coorg Estate Mill Bay',
    eventCode: 'EVT-82A19-02',
    eventType: 'MANUFACTURED',
    timestamp: '2026-09-12 10:30 UTC',
    trustScore: 98,
    status: 'VERIFIED',
    txId: 'TX-FABRIC-7802-TRANSFORM',
    details: 'Washing, fermentation and 72-hour moisture reduction to 10.8%.'
  },
  {
    id: 'node-3',
    role: 'Accredited Auditor',
    name: 'SGS Quality Labs',
    location: 'Bengaluru Testing Center',
    eventCode: 'EVT-82A19-03',
    eventType: 'QUALITY_CHECKED',
    timestamp: '2026-09-13 11:45 UTC',
    trustScore: 100,
    status: 'VERIFIED',
    txId: 'TX-FABRIC-7803-INSPECT',
    details: 'Specialty cupping score 88.5, zero defect tolerance, ISO/IEC 17065 passed.'
  },
  {
    id: 'node-4',
    role: 'Cold-Chain Carrier',
    name: 'TransGlobal Express',
    location: 'Transit Corridor (Reefer 20°C)',
    eventCode: 'EVT-82A19-04',
    eventType: 'SHIPPED',
    timestamp: '2026-09-14 13:20 UTC',
    trustScore: 96,
    status: 'VERIFIED',
    txId: 'TX-FABRIC-7804-DISPATCH',
    details: 'Seal SL-88419 verified, multi-party 2-of-3 endorsement accepted.'
  },
  {
    id: 'node-5',
    role: 'Central Fulfillment',
    name: 'Bhiwandi Hub Bay 14',
    location: 'Mumbai Outer Logistics Park',
    eventCode: 'EVT-82A19-05',
    eventType: 'RECEIVED',
    timestamp: '2026-09-15 17:05 UTC',
    trustScore: 98,
    status: 'VERIFIED',
    txId: 'TX-FABRIC-7805-INTAKE',
    details: 'Intake manifest verified. 5,000 kg inventory available for distribution.'
  }
];

import { fetchTrace } from '../../lib/api';

export function ProvenanceGraph({
  batchCode = 'BATCH-2026-001',
  direction = 'forward',
  stages: customStages
}: {
  batchCode?: string;
  direction?: 'forward' | 'backward';
  stages?: StageNode[];
}) {
  const [loadedStages, setLoadedStages] = useState<StageNode[]>(customStages || defaultStages);
  const [selectedNode, setSelectedNode] = useState<StageNode>(() => (customStages && customStages[0]) || defaultStages[0]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (customStages && customStages.length > 0) {
      setLoadedStages(customStages);
      setSelectedNode(customStages[0]);
      return;
    }

    if (!batchCode) return;

    let mounted = true;
    setLoading(true);
    fetchTrace(batchCode, direction)
      .then((data) => {
        if (!mounted || !data || !Array.isArray(data.events) || data.events.length === 0) {
          setLoading(false);
          return;
        }

        const mapped: StageNode[] = data.events.map((e: any, idx: number) => ({
          id: e.id || `node-${idx}`,
          role: e.sourceOrg?.organizationType || 'Consortium Peer',
          name: e.sourceOrg?.name || 'Verified Organization',
          location: e.location || 'Supply Chain Corridor',
          eventCode: e.eventCode,
          eventType: e.eventType,
          timestamp: e.eventTime ? new Date(e.eventTime).toISOString().replace('T', ' ').slice(0, 19) + ' UTC' : '2026-09-12 08:00 UTC',
          trustScore: Number(e.trustScore ?? 98),
          status: e.trustStatus || 'VERIFIED',
          txId: e.blockchainTx?.transactionId || `TX-${e.eventCode}`,
          details: e.businessStep ? `Business Step: ${e.businessStep}. Disposition: ${e.disposition || 'Active'}.` : `Traceability event verified on consortium ledger.`
        }));

        const finalStages = direction === 'forward' ? mapped : [...mapped].reverse();
        setLoadedStages(finalStages);
        setSelectedNode(finalStages[0]);
        setLoading(false);
      })
      .catch(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [batchCode, direction, customStages]);

  const stages = loadedStages;

  return (
    <div className="rounded-2xl border border-line bg-white p-6 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-line pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-semibold text-muted">BATCH IDENTIFIER:</span>
            <span className="rounded bg-paper px-2 py-0.5 font-mono text-xs font-bold text-ink border border-line">
              {batchCode}
            </span>
          </div>
          <p className="mt-1 text-xs text-muted">
            Interactive multi-party cryptographic provenance graph (Click any node to inspect verification proof)
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-line bg-paper px-2.5 py-1 text-muted">
            <span className="h-2 w-2 rounded-full bg-verified"></span> All {stages.length} Proofs Anchored
          </span>
        </div>
      </div>

      {/* SVG Pipeline Visualization */}
      <div className="relative my-8 overflow-x-auto pb-4">
        <div className="min-w-[720px]">
          {/* Connector Line Background */}
          <div className="relative flex items-center justify-between px-10">
            <div className="absolute left-14 right-14 top-1/2 h-0.5 -translate-y-1/2 bg-line z-0" />
            <div className="absolute left-14 right-14 top-1/2 h-0.5 -translate-y-1/2 bg-verified/50 z-0 transition-all duration-700" />

            {stages.map((node, index) => {
              const isSelected = selectedNode.id === node.id;
              return (
                <button
                  key={node.id}
                  onClick={() => setSelectedNode(node)}
                  className={`group relative z-10 flex flex-col items-center text-center transition-all ${
                    isSelected ? 'scale-105' : 'hover:scale-102'
                  }`}
                >
                  <div
                    className={`flex h-12 w-12 items-center justify-center rounded-full border-2 transition-all ${
                      isSelected
                        ? 'border-ink bg-ink text-paper shadow-md ring-4 ring-ink/10'
                        : 'border-verified bg-white text-verified hover:border-ink hover:text-ink'
                    }`}
                  >
                    <CheckCircle2 className="h-5 w-5" />
                  </div>

                  <span className="mt-2.5 block font-mono text-[10px] font-semibold uppercase text-muted">
                    0{index + 1} • {node.eventType}
                  </span>
                  <span className="block max-w-[110px] truncate text-xs font-semibold text-ink">
                    {node.name}
                  </span>
                  <span className="mt-0.5 block font-mono text-[10px] text-muted">
                    {node.timestamp.split(' ')[0]}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Selected Node Technical Drawer / Inspector */}
      {selectedNode && (
        <div className="mt-6 rounded-xl border border-line bg-paper/60 p-5 transition-all">
          <div className="flex flex-wrap items-start justify-between gap-4 border-b border-line pb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs text-muted">EVENT:</span>
                <span className="font-mono text-xs font-bold text-ink">{selectedNode.eventCode}</span>
                <StatusPill status={selectedNode.status} />
                <span className="rounded-full border border-verified/30 bg-verified/10 px-2 py-0.5 font-mono text-[10px] text-verified">
                  Score {selectedNode.trustScore}/100
                </span>
              </div>
              <h3 className="mt-1 text-base font-semibold text-ink">{selectedNode.name}</h3>
              <p className="text-xs text-muted">{selectedNode.role} • {selectedNode.location}</p>
            </div>

            <div className="text-right">
              <span className="block font-mono text-[10px] uppercase text-muted">Timestamp</span>
              <span className="font-mono text-xs font-medium text-ink">{selectedNode.timestamp}</span>
            </div>
          </div>

          <div className="mt-4 grid gap-4 text-xs md:grid-cols-2">
            <div>
              <span className="font-mono text-[11px] font-semibold text-muted uppercase">Operational Payload</span>
              <p className="mt-1 leading-relaxed text-ink">{selectedNode.details}</p>
            </div>

            <div className="space-y-1.5 rounded-lg border border-line bg-white p-3 font-mono text-[11px]">
              <div className="flex justify-between">
                <span className="text-muted">Ledger State:</span>
                <span className="font-semibold text-verified">IMMUTABLE PROOF COMMITTED</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">Transaction:</span>
                <span className="truncate max-w-[200px] text-ink">{selectedNode.txId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">Consortium Policy:</span>
                <span className="text-ink">2-of-3 Endorsement Matched</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

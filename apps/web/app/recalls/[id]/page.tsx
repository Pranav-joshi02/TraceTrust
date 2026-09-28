'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { AppShell } from '../../../components/layout/AppShell';
import { StatusPill } from '../../../components/ui/StatusPill';
import { mockRecalls, Recall } from '../../../lib/data';
import { fetchRecalls, fetchRecallImpact } from '../../../lib/api';
import {
  AlertTriangle,
  ArrowLeft,
  Building2,
  Calendar,
  Layers,
  MapPin,
  GitBranch,
  ShieldAlert,
  CheckCircle2,
} from 'lucide-react';

export default function RecallDetailPage() {
  const params = useParams();
  const id = String(params.id ?? '');
  const [recall, setRecall] = useState<Recall | null>(() => {
    return mockRecalls.find((r) => r.id === id || r.recallCode === id) || mockRecalls[0];
  });
  const [impactData, setImpactData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setIsLoading(true);
      try {
        const [recallsList, impact] = await Promise.all([
          fetchRecalls().catch(() => []),
          fetchRecallImpact(id).catch(() => null),
        ]);

        const match = recallsList.find((r: any) => r.id === id || r.recallCode === id);
        if (match) setRecall(match);
        if (impact) setImpactData(impact);
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, [id]);

  if (!recall) {
    return (
      <AppShell title="Recall Not Found">
        <div className="rounded-2xl border border-line bg-white p-8 text-center" role="alert">
          <p className="text-sm text-muted">The requested recall event could not be found.</p>
          <Link href="/recalls" className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-ink underline">
            <ArrowLeft className="h-3.5 w-3.5" /> Back to Recalls
          </Link>
        </div>
      </AppShell>
    );
  }

  const affectedBatchCode = recall.affectedBatches?.[0] || 'BATCH-2026-001';

  return (
    <AppShell
      title={`Emergency Recall: ${recall.recallCode}`}
      description={`Severity: ${recall.severity} • Initiated by ${recall.initiatedBy}`}
      action={
        <div className="flex items-center gap-2">
          <Link
            href={`/trace?batch=${affectedBatchCode}`}
            className="inline-flex items-center gap-1.5 rounded-full bg-ink px-4 py-1.5 text-xs font-semibold text-paper transition hover:bg-ink/80"
          >
            <GitBranch className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Trace Blast Radius</span>
          </Link>
          <Link
            href="/recalls"
            className="inline-flex items-center gap-1.5 rounded-full border border-line bg-white px-3.5 py-1.5 text-xs font-medium text-ink transition hover:bg-paper"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>All Recalls</span>
          </Link>
        </div>
      }
    >
      <div className="space-y-6 max-w-4xl mx-auto">
        {/* Severity Banner */}
        <div
          className={`rounded-2xl border p-6 shadow-sm ${
            recall.severity === 'CRITICAL' || recall.severity === 'HIGH'
              ? 'border-rejected/40 bg-rejected/5'
              : 'border-pending/40 bg-pending/5'
          }`}
          role="alert"
        >
          <div className="flex flex-wrap items-start justify-between gap-4 border-b border-line/60 pb-4">
            <div className="flex items-start gap-3.5">
              <div
                className={`flex h-12 w-12 items-center justify-center rounded-xl text-white ${
                  recall.severity === 'CRITICAL' || recall.severity === 'HIGH' ? 'bg-rejected' : 'bg-pending'
                }`}
                aria-hidden="true"
              >
                <AlertTriangle className="h-6 w-6" />
              </div>
              <div>
                <div className="flex items-center gap-2.5">
                  <h2 className="text-xl font-bold text-ink">{recall.recallCode}</h2>
                  <StatusPill status={recall.status} />
                </div>
                <p className="mt-1 text-xs font-medium text-ink">{recall.reason}</p>
                <p className="mt-1 font-mono text-[11px] text-muted">
                  Initiated by {recall.initiatedBy} on {recall.initiatedAt}
                </p>
              </div>
            </div>

            <div className="text-right">
              <span className="font-mono text-[10px] uppercase font-bold text-muted block mb-1">Impact Level</span>
              <span
                className={`inline-flex items-center rounded-full border px-2.5 py-0.5 font-mono text-xs font-bold ${
                  recall.severity === 'CRITICAL'
                    ? 'border-rejected/40 bg-rejected text-white'
                    : 'border-pending/40 bg-pending text-white'
                }`}
              >
                {recall.severity}
              </span>
            </div>
          </div>

          {/* Blast Radius Metrics */}
          <div className="mt-6 grid grid-cols-3 gap-4 text-center">
            <div className="rounded-xl border border-line/60 bg-white/80 p-3">
              <span className="text-[10px] font-mono text-muted uppercase font-bold block">Units at Risk</span>
              <span className="mt-1 block font-mono text-xl font-extrabold text-ink">
                {recall.affectedUnits.toLocaleString()}
              </span>
            </div>
            <div className="rounded-xl border border-line/60 bg-white/80 p-3">
              <span className="text-[10px] font-mono text-muted uppercase font-bold block">Warehouses</span>
              <span className="mt-1 block font-mono text-xl font-extrabold text-ink">
                {recall.warehousesAffected}
              </span>
            </div>
            <div className="rounded-xl border border-line/60 bg-white/80 p-3">
              <span className="text-[10px] font-mono text-muted uppercase font-bold block">Retail Outlets</span>
              <span className="mt-1 block font-mono text-xl font-extrabold text-ink">
                {recall.retailersAffected}
              </span>
            </div>
          </div>
        </div>

        {/* Affected Batches Card */}
        <div className="rounded-2xl border border-line bg-white p-6 shadow-sm">
          <h3 className="font-bold text-ink mb-4 flex items-center gap-2">
            <Layers className="h-4 w-4 text-muted" aria-hidden="true" />
            <span>Target Inventory Batches ({recall.affectedBatches.length})</span>
          </h3>

          <div className="space-y-2" role="list" aria-label="Affected batches">
            {recall.affectedBatches.map((batchCode) => (
              <div
                key={batchCode}
                role="listitem"
                className="flex items-center justify-between rounded-xl border border-line bg-paper/50 p-3 text-xs"
              >
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-ink">{batchCode}</span>
                  <span className="rounded bg-rejected/10 px-2 py-0.5 font-mono text-[10px] text-rejected font-semibold">
                    Quarantine Enforced
                  </span>
                </div>
                <Link
                  href={`/trace?batch=${batchCode}`}
                  className="font-mono font-medium text-ink hover:underline flex items-center gap-1"
                >
                  Inspect Trail →
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppShell>
  );
}

'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { AppShell } from '../../components/layout/AppShell';
import { StatusPill } from '../../components/ui/StatusPill';
import { mockTraceEvents, mockRecalls, mockBatches, TraceEvent, Batch, Recall } from '../../lib/data';
import { fetchProducts, fetchBatches, fetchEvents, fetchRecalls } from '../../lib/api';
import {
  Package,
  Layers,
  ShieldCheck,
  AlertTriangle,
  ArrowUpRight,
  TrendingUp,
  Activity,
  PlusCircle,
  FileCheck2,
  ExternalLink,
  ChevronRight
} from 'lucide-react';

export default function DashboardPage() {
  const [productsCount, setProductsCount] = useState(2);
  const [batches, setBatches] = useState<Batch[]>(mockBatches);
  const [events, setEvents] = useState<TraceEvent[]>(mockTraceEvents);
  const [recalls, setRecalls] = useState<Recall[]>(mockRecalls);

  useEffect(() => {
    fetchProducts().then((p) => setProductsCount(p.length));
    fetchBatches().then((b) => setBatches(b));
    fetchEvents().then((e) => setEvents(e));
    fetchRecalls().then((r) => setRecalls(r));
  }, []);

  const verifiedEvents = events.filter((e) => e.trustStatus === 'VERIFIED');
  const rejectedEvents = events.filter((e) => e.trustStatus === 'REJECTED' || e.trustStatus === 'SUSPICIOUS');
  const verifiedPercentage = events.length > 0 ? ((verifiedEvents.length / events.length) * 100).toFixed(1) : '100.0';

  return (
    <AppShell
      title="Operations Overview"
      description="Real-time multi-tier supply chain ledger status, validation throughput, and active audits."
      action={
        <div className="flex items-center gap-2">
          <Link
            href="/events"
            className="inline-flex items-center gap-1.5 rounded-full border border-line bg-white px-3.5 py-1.5 text-xs font-medium text-ink transition hover:bg-paper"
          >
            <Activity className="h-3.5 w-3.5" />
            <span>Event Explorer</span>
          </Link>
          <Link
            href="/verification"
            className="inline-flex items-center gap-1.5 rounded-full bg-ink px-4 py-1.5 text-xs font-medium text-paper transition hover:bg-ink/85"
          >
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>Run Trust Validation</span>
          </Link>
        </div>
      }
    >
      {/* 4 Core KPI Metric Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-line bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between text-muted">
            <span className="font-mono text-xs font-semibold uppercase">Total Products</span>
            <Package className="h-4 w-4" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold tracking-tight text-ink">{productsCount}</span>
            <span className="inline-flex items-center text-xs font-medium text-verified">
              <TrendingUp className="mr-0.5 h-3 w-3" /> Live DB
            </span>
          </div>
          <p className="mt-1 text-[11px] text-muted">Active product catalog in database</p>
        </div>

        <div className="rounded-2xl border border-line bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between text-muted">
            <span className="font-mono text-xs font-semibold uppercase">Registered Batches</span>
            <Layers className="h-4 w-4" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold tracking-tight text-ink">{batches.length}</span>
            <span className="inline-flex items-center text-xs font-medium text-verified">
              <TrendingUp className="mr-0.5 h-3 w-3" /> Live DB
            </span>
          </div>
          <p className="mt-1 text-[11px] text-muted">Under active custody or transit</p>
        </div>

        <div className="rounded-2xl border border-verified/30 bg-verified/5 p-5 shadow-sm">
          <div className="flex items-center justify-between text-verified">
            <span className="font-mono text-xs font-semibold uppercase">Verified Proof %</span>
            <ShieldCheck className="h-4 w-4" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold tracking-tight text-ink">{verifiedPercentage}%</span>
            <span className="text-xs font-medium text-verified">Consensus valid</span>
          </div>
          <p className="mt-1 text-[11px] text-muted">All trust rules verified before commit</p>
        </div>

        <div className="rounded-2xl border border-line bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between text-rejected">
            <span className="font-mono text-xs font-semibold uppercase">Flagged / Recalls</span>
            <AlertTriangle className="h-4 w-4" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold tracking-tight text-rejected">
              {rejectedEvents.length + recalls.length}
            </span>
            <span className="rounded bg-rejected/10 px-1.5 py-0.5 font-mono text-[10px] text-rejected font-semibold">
              Quarantined
            </span>
          </div>
          <p className="mt-1 text-[11px] text-muted">Flagged records requiring audit</p>
        </div>
      </div>

      {/* Active Recall Alert Banner */}
      {recalls.length > 0 && (
        <div className="mt-6 flex flex-wrap items-center justify-between gap-4 rounded-xl border border-pending/40 bg-pending/5 p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-pending text-white">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-ink">RECALL ACTIVE: {recalls[0].recallCode}</span>
                <span className="rounded-full border border-pending/40 bg-pending/20 px-2 py-0.5 font-mono text-[10px] text-pending font-semibold">
                  {recalls[0].status}
                </span>
              </div>
              <p className="mt-0.5 text-xs text-muted">{recalls[0].reason}</p>
            </div>
          </div>
          <Link
            href="/recalls"
            className="inline-flex items-center gap-1 font-mono text-xs font-semibold text-ink hover:underline"
          >
            <span>View Affected Batches ({recalls[0].affectedUnits} units)</span>
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
      )}

      {/* Main Grid: Recent Trace Events Table & Quick Operations */}
      <div className="mt-8 grid gap-8 lg:grid-cols-[1.8fr_1fr]">
        {/* Recent Trace Events */}
        <div className="rounded-2xl border border-line bg-white shadow-sm overflow-hidden">
          <div className="flex items-center justify-between border-b border-line px-6 py-4">
            <div>
              <h3 className="font-bold text-ink">Recent Trace Events</h3>
              <p className="text-xs text-muted">Pre-commit verification status and Fabric transaction references</p>
            </div>
            <Link
              href="/events"
              className="inline-flex items-center gap-1 font-mono text-xs text-muted hover:text-ink"
            >
              <span>View all ({events.length})</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-line bg-paper font-mono text-[11px] uppercase text-muted">
                <tr>
                  <th className="py-3 px-6">Event</th>
                  <th className="py-3 px-4">Batch</th>
                  <th className="py-3 px-4">Organization</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Trust Status</th>
                  <th className="py-3 px-6 text-right">Score</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {events.slice(0, 6).map((evt) => (
                  <tr key={evt.id} className="transition hover:bg-paper/60">
                    <td className="py-3 px-6 font-mono font-medium text-ink">
                      <Link href={`/events/${evt.id}`} className="hover:underline">
                        {evt.eventCode}
                      </Link>
                    </td>
                    <td className="py-3 px-4 font-mono text-muted">
                      <Link href={`/batches/${evt.batchId}`} className="hover:text-ink hover:underline">
                        {evt.batchCode}
                      </Link>
                    </td>
                    <td className="py-3 px-4 text-ink truncate max-w-[140px]">{evt.sourceOrgName}</td>
                    <td className="py-3 px-4">
                      <span className="rounded bg-paper px-2 py-0.5 font-mono text-[10px] font-semibold border border-line">
                        {evt.eventType}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <StatusPill status={evt.trustStatus} />
                    </td>
                    <td className="py-3 px-6 text-right font-mono font-bold">
                      <span className={evt.trustScore > 80 ? 'text-verified' : 'text-rejected'}>
                        {evt.trustScore}/100
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Side Panel: Active Batches & Quick Actions */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-line bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between border-b border-line pb-3">
              <h4 className="font-bold text-ink">Active Batches</h4>
              <Link href="/batches" className="font-mono text-xs text-muted hover:text-ink">
                Manage ({batches.length})
              </Link>
            </div>
            <div className="mt-4 space-y-3">
              {batches.slice(0, 5).map((b) => (
                <div key={b.id} className="flex items-center justify-between rounded-xl border border-line p-3">
                  <div>
                    <Link href={`/batches/${b.id}`} className="font-mono text-xs font-bold text-ink hover:underline">
                      {b.batchCode}
                    </Link>
                    <p className="text-[11px] text-muted truncate max-w-[160px]">{b.productName}</p>
                  </div>
                  <div className="text-right">
                    <StatusPill status={b.trustStatus} />
                    <span className="block mt-1 font-mono text-[10px] text-muted">
                      {b.quantity} {b.unit}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-line bg-paper p-5">
            <h4 className="font-bold text-ink">Rapid Actions</h4>
            <div className="mt-3 grid gap-2">
              <Link
                href="/batches"
                className="flex items-center justify-between rounded-xl border border-line bg-white p-2.5 text-xs font-medium text-ink transition hover:bg-line/40"
              >
                <span className="flex items-center gap-2">
                  <Layers className="h-4 w-4 text-muted" /> Register New Batch
                </span>
                <ChevronRight className="h-3.5 w-3.5 text-muted" />
              </Link>
              <Link
                href="/evidence"
                className="flex items-center justify-between rounded-xl border border-line bg-white p-2.5 text-xs font-medium text-ink transition hover:bg-line/40"
              >
                <span className="flex items-center gap-2">
                  <FileCheck2 className="h-4 w-4 text-muted" /> Verify Document SHA-256
                </span>
                <ChevronRight className="h-3.5 w-3.5 text-muted" />
              </Link>
              <Link
                href="/trace"
                className="flex items-center justify-between rounded-xl border border-line bg-white p-2.5 text-xs font-medium text-ink transition hover:bg-line/40"
              >
                <span className="flex items-center gap-2">
                  <ExternalLink className="h-4 w-4 text-muted" /> Open Public Provenance Viewer
                </span>
                <ChevronRight className="h-3.5 w-3.5 text-muted" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

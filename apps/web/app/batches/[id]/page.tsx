'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { AppShell } from '../../../components/layout/AppShell';
import { mockBatches, mockProducts, mockTraceEvents, Batch, Product, TraceEvent } from '../../../lib/data';
import { fetchBatches, fetchProducts, fetchEvents } from '../../../lib/api';
import { ProvenanceGraph } from '../../../components/provenance/ProvenanceGraph';
import { StatusPill } from '../../../components/ui/StatusPill';
import {
  ArrowLeft,
  GitBranch,
  ShieldCheck,
  AlertTriangle,
  History,
  QrCode,
  FileCheck2,
  ExternalLink,
  Plus
} from 'lucide-react';

export default function BatchDetailPage() {
  const params = useParams();
  const id = String(params.id ?? 'batch-1');

  const [batch, setBatch] = useState<Batch>(() => {
    return mockBatches.find((b) => b.id === id || b.batchCode === id) || mockBatches[0];
  });
  const [product, setProduct] = useState<Product>(() => {
    return mockProducts.find((p) => p.id === batch.productId) || mockProducts[0];
  });
  const [events, setEvents] = useState<TraceEvent[]>(() => {
    return mockTraceEvents.filter((e) => e.batchId === batch.id || e.batchCode === batch.batchCode);
  });

  useEffect(() => {
    fetchBatches().then((allBatches) => {
      const b = allBatches.find((item) => item.id === id || item.batchCode === id);
      if (b) {
        setBatch(b);
        fetchProducts().then((allProds) => {
          const p = allProds.find((prod) => prod.id === b.productId || prod.name === b.productName);
          if (p) setProduct(p);
        });
      }
    });

    fetchEvents().then((allEvts) => {
      const filtered = allEvts.filter((e) => e.batchId === id || e.batchCode === batch.batchCode);
      if (filtered.length > 0) setEvents(filtered);
    });
  }, [id, batch.batchCode]);

  return (
    <AppShell
      title={`Batch Command Center: ${batch.batchCode}`}
      description={`Product: ${product.name} (${product.productCode})`}
      action={
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/batches"
            className="inline-flex items-center gap-1.5 rounded-full border border-line bg-white px-3.5 py-1.5 text-xs font-medium text-ink transition hover:bg-paper"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>All Batches</span>
          </Link>
          <Link
            href={`/trace`}
            className="inline-flex items-center gap-1.5 rounded-full border border-line bg-white px-3.5 py-1.5 text-xs font-medium text-ink transition hover:bg-paper"
          >
            <GitBranch className="h-3.5 w-3.5" />
            <span>Trace Journey</span>
          </Link>
          <Link
            href="/audits"
            className="inline-flex items-center gap-1.5 rounded-full border border-line bg-white px-3.5 py-1.5 text-xs font-medium text-ink transition hover:bg-paper"
          >
            <History className="h-3.5 w-3.5" />
            <span>Audit Trail</span>
          </Link>
          <Link
            href={`/verify/${batch.batchCode}`}
            className="inline-flex items-center gap-1.5 rounded-full border border-line bg-white px-3.5 py-1.5 text-xs font-medium text-ink transition hover:bg-paper"
          >
            <QrCode className="h-3.5 w-3.5" />
            <span>QR Verification</span>
          </Link>
          <Link
            href="/recalls"
            className="inline-flex items-center gap-1.5 rounded-full border border-pending/30 bg-pending/10 px-3.5 py-1.5 text-xs font-medium text-pending transition hover:bg-pending/20"
          >
            <AlertTriangle className="h-3.5 w-3.5" />
            <span>Check Recall Status</span>
          </Link>
        </div>
      }
    >
      {/* Batch Information & Interactive Provenance Graph (Document 3 Layout) */}
      <div className="grid gap-8 lg:grid-cols-[1fr_2fr]">
        {/* Left: Batch Information Card */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-line bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between border-b border-line pb-3">
              <span className="font-mono text-xs uppercase text-muted">Specifications</span>
              <StatusPill status={batch.trustStatus} />
            </div>

            <div className="mt-4 space-y-3 text-xs">
              <div className="flex justify-between border-b border-line/60 pb-2">
                <span className="text-muted">Batch Code:</span>
                <span className="font-mono font-bold text-ink">{batch.batchCode}</span>
              </div>
              <div className="flex justify-between border-b border-line/60 pb-2">
                <span className="text-muted">Associated Product:</span>
                <Link href={`/products/${product.id}`} className="font-medium text-ink hover:underline truncate max-w-[160px]">
                  {product.name}
                </Link>
              </div>
              <div className="flex justify-between border-b border-line/60 pb-2">
                <span className="text-muted">Total Quantity:</span>
                <span className="font-mono font-bold text-ink">
                  {batch.quantity} {batch.unit}
                </span>
              </div>
              <div className="flex justify-between border-b border-line/60 pb-2">
                <span className="text-muted">Production Date:</span>
                <span className="font-mono text-ink">{batch.productionDate}</span>
              </div>
              <div className="flex justify-between border-b border-line/60 pb-2">
                <span className="text-muted">Expiration Date:</span>
                <span className="font-mono text-ink">{batch.expiryDate}</span>
              </div>
              <div className="flex justify-between border-b border-line/60 pb-2">
                <span className="text-muted">Current Custody:</span>
                <span className="font-medium text-ink truncate max-w-[160px]">{batch.currentOwnerName}</span>
              </div>
              <div className="flex justify-between border-b border-line/60 pb-2">
                <span className="text-muted">Lifecycle State:</span>
                <span className="font-mono font-semibold text-ink">{batch.status}</span>
              </div>
              <div>
                <span className="text-muted">Origin Location:</span>
                <p className="mt-1 font-mono text-[11px] text-ink">{batch.originLocation}</p>
              </div>
            </div>

            <div className="mt-6 rounded-xl border border-verified/30 bg-verified/5 p-3 font-mono text-xs">
              <div className="flex items-center justify-between">
                <span className="text-muted">Trust Score:</span>
                <span className="text-base font-bold text-verified">{batch.trustScore}/100</span>
              </div>
              <p className="mt-1 text-[11px] text-muted">All pre-commit cryptographic signatures valid.</p>
            </div>
          </div>
        </div>

        {/* Right: SVG Provenance Journey */}
        <div>
          <ProvenanceGraph batchCode={batch.batchCode} />
        </div>
      </div>

      {/* Associated Events List */}
      <div className="mt-10 rounded-2xl border border-line bg-white shadow-sm overflow-hidden">
        <div className="flex items-center justify-between border-b border-line px-6 py-4">
          <div>
            <h3 className="font-bold text-ink">Lifecycle Trace Events</h3>
            <p className="text-xs text-muted">Event stream recorded for {batch.batchCode}</p>
          </div>
          <Link
            href="/events"
            className="inline-flex items-center gap-1 rounded-full border border-line bg-paper px-3 py-1 font-mono text-xs font-semibold text-ink hover:bg-line/40"
          >
            <Plus className="h-3 w-3" /> Log Event
          </Link>
        </div>

        <table className="w-full text-left text-xs">
          <thead className="border-b border-line bg-paper font-mono text-[11px] uppercase text-muted">
            <tr>
              <th className="py-3 px-6">Event Code</th>
              <th className="py-3 px-4">Event Type</th>
              <th className="py-3 px-4">Location</th>
              <th className="py-3 px-4">Timestamp</th>
              <th className="py-3 px-4">Ledger Reference</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-6 text-right">Detail</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {events.map((evt) => (
              <tr key={evt.id} className="transition hover:bg-paper/50">
                <td className="py-3 px-6 font-mono font-bold text-ink">
                  <Link href={`/events/${evt.id}`} className="hover:underline">
                    {evt.eventCode}
                  </Link>
                </td>
                <td className="py-3 px-4 font-mono">{evt.eventType}</td>
                <td className="py-3 px-4 text-muted truncate max-w-[150px]">{evt.location}</td>
                <td className="py-3 px-4 font-mono text-muted text-[11px]">{evt.eventTime.split('T')[0]}</td>
                <td className="py-3 px-4 font-mono text-[11px] text-muted truncate max-w-[150px]">
                  {evt.blockchainTxId ?? 'None'}
                </td>
                <td className="py-3 px-4">
                  <StatusPill status={evt.trustStatus} />
                </td>
                <td className="py-3 px-6 text-right">
                  <Link
                    href={`/events/${evt.id}`}
                    className="font-mono text-xs font-semibold text-ink hover:underline"
                  >
                    Investigate →
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AppShell>
  );
}

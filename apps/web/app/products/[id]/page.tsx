'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { AppShell } from '../../../components/layout/AppShell';
import { mockProducts, mockBatches, mockTraceEvents, Product, Batch, TraceEvent } from '../../../lib/data';
import { fetchProducts, fetchBatches, fetchEvents } from '../../../lib/api';
import { StatusPill } from '../../../components/ui/StatusPill';
import { Package, Layers, Activity, ArrowLeft, ArrowRight, ShieldCheck, CheckCircle2, Plus } from 'lucide-react';

export default function ProductDetailPage() {
  const params = useParams();
  const id = String(params.id ?? 'prod-1');
  const [activeTab, setActiveTab] = useState<'overview' | 'batches' | 'events'>('overview');

  const [product, setProduct] = useState<Product>(() => {
    return mockProducts.find((p) => p.id === id || p.productCode === id) || mockProducts[0];
  });
  const [batches, setBatches] = useState<Batch[]>(() => {
    return mockBatches.filter((b) => b.productId === id || b.productId === product.id);
  });
  const [events, setEvents] = useState<TraceEvent[]>(() => {
    return mockTraceEvents.filter((e) => e.productId === id || e.productId === product.id);
  });

  useEffect(() => {
    fetchProducts().then((allProducts) => {
      const found = allProducts.find((p) => p.id === id || p.productCode === id);
      if (found) {
        setProduct(found);
      }
    });
    fetchBatches().then((allBatches) => {
      setBatches(allBatches.filter((b) => b.productId === id || b.productId === product.id));
    });
    fetchEvents().then((allEvents) => {
      setEvents(allEvents.filter((e) => e.productId === id || e.productId === product.id));
    });
  }, [id, product.id]);

  return (
    <AppShell
      title={product.name}
      description={`Master Product Registry • Identifier: ${product.productCode}`}
      action={
        <div className="flex items-center gap-2">
          <Link
            href="/products"
            className="inline-flex items-center gap-1.5 rounded-full border border-line bg-white px-3.5 py-1.5 text-xs font-medium text-ink transition hover:bg-paper"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to Products</span>
          </Link>
          <Link
            href={`/batches?create=true&productId=${product.id}`}
            className="inline-flex items-center gap-1.5 rounded-full bg-ink px-4 py-1.5 text-xs font-medium text-paper transition hover:bg-ink/80"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Create Batch</span>
          </Link>
        </div>
      }
    >
      {/* Tab Navigation */}
      <div className="flex border-b border-line text-xs font-mono">
        {(['overview', 'batches', 'events'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`border-b-2 px-6 py-3 font-semibold uppercase tracking-wider transition ${
              activeTab === tab
                ? 'border-ink text-ink bg-white'
                : 'border-transparent text-muted hover:text-ink'
            }`}
          >
            {tab} {tab === 'batches' ? `(${batches.length})` : tab === 'events' ? `(${events.length})` : ''}
          </button>
        ))}
      </div>

      <div className="mt-6">
        {activeTab === 'overview' && (
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="rounded-2xl border border-line bg-white p-6 shadow-sm">
              <h3 className="text-sm font-bold uppercase text-muted font-mono">Specification & Classification</h3>
              <div className="mt-4 divide-y divide-line text-xs">
                <div className="flex justify-between py-2.5">
                  <span className="text-muted">Product Code:</span>
                  <span className="font-mono font-bold text-ink">{product.productCode}</span>
                </div>
                <div className="flex justify-between py-2.5">
                  <span className="text-muted">SKU:</span>
                  <span className="font-mono text-ink">{product.sku}</span>
                </div>
                <div className="flex justify-between py-2.5">
                  <span className="text-muted">GS1 GTIN:</span>
                  <span className="font-mono text-ink">{product.gtin}</span>
                </div>
                <div className="flex justify-between py-2.5">
                  <span className="text-muted">Category:</span>
                  <span className="text-ink">{product.category}</span>
                </div>
                <div className="flex justify-between py-2.5">
                  <span className="text-muted">Registered Organization:</span>
                  <span className="font-medium text-ink">{product.organizationName}</span>
                </div>
                <div className="flex justify-between py-2.5">
                  <span className="text-muted">Lifecycle Status:</span>
                  <StatusPill status={product.status} />
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-line bg-white p-6 shadow-sm">
              <h3 className="text-sm font-bold uppercase text-muted font-mono">Product Provenance Attributes</h3>
              <p className="mt-2 text-xs leading-relaxed text-muted">{product.description}</p>

              {product.metadata && (
                <div className="mt-4 rounded-xl border border-line bg-paper/60 p-4 font-mono text-xs">
                  <span className="text-[11px] font-semibold uppercase text-muted">Agronomic & Processing Metadata</span>
                  <div className="mt-2 space-y-1">
                    {Object.entries(product.metadata).map(([k, v]) => (
                      <div key={k} className="flex justify-between">
                        <span className="capitalize text-muted">{k}:</span>
                        <span className="font-semibold text-ink">{v}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'batches' && (
          <div>
            {batches.length === 0 ? (
              <div className="rounded-2xl border border-line bg-white p-8 text-center shadow-sm">
                <Layers className="mx-auto h-8 w-8 text-muted" />
                <h4 className="mt-3 font-mono text-sm font-bold text-ink">No batches registered yet</h4>
                <p className="mt-1 text-xs text-muted">Create the first production batch associated with this master product.</p>
                <Link
                  href={`/batches?create=true&productId=${product.id}`}
                  className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-ink px-4 py-2 font-mono text-xs font-semibold text-paper hover:bg-ink/80"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Create Batch for {product.name}</span>
                </Link>
              </div>
            ) : (
              <div className="rounded-2xl border border-line bg-white shadow-sm overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-line bg-paper font-mono text-[11px] uppercase text-muted">
                    <tr>
                      <th className="py-3 px-6">Batch Code</th>
                      <th className="py-3 px-4">Quantity</th>
                      <th className="py-3 px-4">Current Owner</th>
                      <th className="py-3 px-4">Production Date</th>
                      <th className="py-3 px-4">Trust Status</th>
                      <th className="py-3 px-6 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line">
                    {batches.map((b) => (
                      <tr key={b.id} className="transition hover:bg-paper/50">
                        <td className="py-3.5 px-6 font-mono font-bold text-ink">
                          <Link href={`/batches/${b.id}`} className="hover:underline">
                            {b.batchCode}
                          </Link>
                        </td>
                        <td className="py-3.5 px-4 font-mono">
                          {b.quantity} {b.unit}
                        </td>
                        <td className="py-3.5 px-4">{b.currentOwnerName}</td>
                        <td className="py-3.5 px-4 font-mono text-muted">{b.productionDate}</td>
                        <td className="py-3.5 px-4">
                          <StatusPill status={b.trustStatus} />
                        </td>
                        <td className="py-3.5 px-6 text-right">
                          <Link
                            href={`/batches/${b.id}`}
                            className="inline-flex items-center gap-1 font-mono text-xs font-semibold text-ink hover:underline"
                          >
                            <span>Command Center</span>
                            <ArrowRight className="h-3 w-3" />
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeTab === 'events' && (
          <div className="space-y-3">
            {events.length === 0 ? (
              <div className="rounded-2xl border border-line bg-white p-8 text-center shadow-sm">
                <Activity className="mx-auto h-8 w-8 text-muted" />
                <h4 className="mt-3 font-mono text-sm font-bold text-ink">No trace events recorded</h4>
                <p className="mt-1 text-xs text-muted">Events will show up once batches under this product undergo custody transitions.</p>
              </div>
            ) : (
              events.map((evt) => (
                <div key={evt.id} className="flex items-center justify-between rounded-xl border border-line bg-white p-4 shadow-sm">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-ink">{evt.eventCode}</span>
                      <span className="rounded bg-paper px-2 py-0.5 font-mono text-[10px] font-semibold border border-line">
                        {evt.eventType}
                      </span>
                      <StatusPill status={evt.trustStatus} />
                    </div>
                    <p className="mt-1 text-xs text-muted">{evt.location} • {evt.sourceOrgName}</p>
                  </div>
                  <Link
                    href={`/events/${evt.id}`}
                    className="rounded-full border border-line px-3 py-1 font-mono text-xs font-semibold text-ink hover:bg-paper"
                  >
                    Investigate Event
                  </Link>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </AppShell>
  );
}

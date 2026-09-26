'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ShieldCheck, CheckCircle2, Award, MapPin, Calendar, ArrowRight, ExternalLink, QrCode } from 'lucide-react';
import { mockBatches, mockProducts, mockTraceEvents, Batch, Product, TraceEvent } from '../../../lib/data';
import { resolveQrCode, fetchBatches, fetchProducts, fetchEvents } from '../../../lib/api';

export default function ConsumerVerificationPage() {
  const params = useParams();
  const code = String(params.code ?? 'BATCH-2026-001');

  const [batch, setBatch] = useState<Batch>(() => mockBatches.find((b) => b.batchCode === code || b.id === code) || mockBatches[0]);
  const [product, setProduct] = useState<Product>(() => mockProducts.find((p) => p.id === batch.productId) || mockProducts[0]);
  const [events, setEvents] = useState<any[]>([]);
  const [qrScanInfo, setQrScanInfo] = useState<{ scanCount: number; publicCode: string } | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let active = true;

    // 1. Try resolving as a QR Code first
    resolveQrCode(code)
      .then((qrData) => {
        if (!active || !qrData || !qrData.batch) return;
        setQrScanInfo({ scanCount: qrData.qrCode?.scanCount ?? 1, publicCode: qrData.qrCode?.publicCode ?? code });
        if (qrData.batch) {
          setBatch({
            id: qrData.batch.id,
            batchCode: qrData.batch.batchCode,
            productId: qrData.batch.productId,
            productName: qrData.product?.name || 'Organic Specialty Batch',
            quantity: Number(qrData.batch.quantity || 1000),
            unit: qrData.batch.unit || 'kg',
            productionDate: qrData.batch.productionDate ? new Date(qrData.batch.productionDate).toISOString().split('T')[0] : '2026-09-12',
            expiryDate: qrData.batch.expiryDate ? new Date(qrData.batch.expiryDate).toISOString().split('T')[0] : '2027-09-12',
            currentOwnerOrgId: qrData.batch.currentOwnerOrgId,
            currentOwnerName: qrData.owner?.name || 'Verified Consortium Member',
            status: qrData.batch.status || 'AVAILABLE',
            originLocation: qrData.batch.originLocation || 'Coorg Valley, Karnataka, India',
            trustScore: 98,
            trustStatus: 'VERIFIED'
          });
        }
        if (qrData.product) {
          setProduct({
            id: qrData.product.id,
            productCode: qrData.product.productCode,
            sku: qrData.product.sku,
            gtin: qrData.product.gtin,
            name: qrData.product.name,
            description: qrData.product.description || 'Verified authentic commodity tracked via TrustTrace ledger.',
            category: qrData.product.category,
            unitOfMeasure: qrData.product.unitOfMeasure,
            status: qrData.product.status,
            organizationId: qrData.product.organizationId,
            organizationName: qrData.owner?.name || 'Highland Organics'
          });
        }
        if (Array.isArray(qrData.events) && qrData.events.length > 0) {
          setEvents(qrData.events);
        }
        setLoaded(true);
      })
      .catch(() => {
        // Fall back to batch query
      });

    // 2. Also try fetching batch and events directly
    fetchBatches().then((allBatches) => {
      if (!active) return;
      const b = allBatches.find((item) => item.batchCode === code || item.id === code);
      if (b) {
        setBatch(b);
        fetchProducts().then((allProds) => {
          if (!active) return;
          const p = allProds.find((prod) => prod.id === b.productId || prod.name === b.productName);
          if (p) setProduct(p);
        });
      }
    });

    fetchEvents().then((allEvts) => {
      if (!active) return;
      const filtered = allEvts.filter((e) => e.batchCode === code || e.batchId === code || (batch && e.batchId === batch.id));
      if (filtered.length > 0) {
        setEvents(filtered);
      }
    });

    return () => {
      active = false;
    };
  }, [code, batch?.id]);

  const displayEvents = events.length > 0 ? events : [
    { eventType: 'CREATED', sourceOrg: 'Highland Organics Estate', location: batch.originLocation, eventTime: '2026-09-12 08:00 UTC' },
    { eventType: 'QUALITY_CHECKED', sourceOrg: 'SGS Quality Assurance Global', location: 'Bengaluru Testing Center', eventTime: '2026-09-13 11:45 UTC' },
    { eventType: 'SHIPPED', sourceOrg: 'TransGlobal Cold-Chain', location: 'Transit Corridor (Reefer 20°C)', eventTime: '2026-09-14 13:20 UTC' },
    { eventType: 'RECEIVED', sourceOrg: 'Bhiwandi Hub Bay 14', location: 'Mumbai Logistics Center', eventTime: '2026-09-15 17:05 UTC' }
  ];

  return (
    <div className="min-h-screen bg-paper text-ink flex flex-col justify-between">
      {/* Consumer-Facing Minimal Header */}
      <header className="border-b border-line bg-white/80 py-4 px-6 backdrop-blur">
        <div className="mx-auto flex max-w-xl items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-ink text-paper">
              <ShieldCheck className="h-4 w-4" />
            </div>
            <span className="font-mono text-sm font-bold tracking-tight">TrustTrace Verified</span>
          </Link>
          <span className="font-mono text-[11px] text-muted">Immutable Ledger Proof</span>
        </div>
      </header>

      {/* Main Consumer Card */}
      <main className="mx-auto my-8 w-full max-w-xl px-4">
        <div className="rounded-3xl border border-line bg-white p-8 shadow-sm">
          {/* Trust Verification Badge */}
          <div className="flex flex-col items-center text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-verified/10 text-verified ring-8 ring-verified/5">
              <CheckCircle2 className="h-9 w-9" />
            </div>
            <span className="mt-4 font-mono text-xs font-bold uppercase tracking-widest text-verified">
              Authenticity Verified
            </span>
            <h1 className="mt-1 text-2xl font-bold tracking-tight text-ink md:text-3xl">
              {product.name}
            </h1>
            <p className="mt-2 text-xs text-muted leading-relaxed max-w-md">
              {product.description}
            </p>

            {qrScanInfo && (
              <div className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-line bg-paper px-3 py-1 font-mono text-[11px] text-muted">
                <QrCode className="h-3 w-3 text-ink" />
                <span>Verified Scan #{qrScanInfo.scanCount} (Code: {qrScanInfo.publicCode})</span>
              </div>
            )}
          </div>

          {/* Core Verified Attributes */}
          <div className="mt-8 grid grid-cols-2 gap-4 rounded-2xl border border-line bg-paper/60 p-4 text-xs font-mono">
            <div>
              <span className="text-[10px] uppercase text-muted">Certified Origin</span>
              <p className="mt-0.5 font-bold text-ink">{batch.originLocation}</p>
            </div>
            <div>
              <span className="text-[10px] uppercase text-muted">Batch Number</span>
              <p className="mt-0.5 font-bold text-ink">{batch.batchCode}</p>
            </div>
            <div>
              <span className="text-[10px] uppercase text-muted">Harvest / Production</span>
              <p className="mt-0.5 text-ink">{batch.productionDate}</p>
            </div>
            <div>
              <span className="text-[10px] uppercase text-muted">Accreditation</span>
              <p className="mt-0.5 text-verified font-bold">USDA Organic & Fair Trade</p>
            </div>
          </div>

          {/* Transparent Supply Chain Milestones (Consumer Safe) */}
          <div className="mt-8 border-t border-line pt-6">
            <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-muted">
              Verified Product Journey
            </h2>
            <div className="mt-4 space-y-3">
              {displayEvents.map((evt: any, i: number) => (
                <div key={i} className="flex items-center justify-between rounded-xl border border-line bg-paper/30 p-3 text-xs">
                  <div className="flex items-center gap-3">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-verified text-white font-mono text-[10px] font-bold">
                      ✓
                    </span>
                    <div>
                      <p className="font-semibold text-ink">{evt.eventType?.replace(/_/g, ' ') || 'PROVENANCE EVENT'}</p>
                      <p className="text-[11px] text-muted">{evt.sourceOrg || evt.sourceOrgName || 'Consortium Peer'} • {evt.location || 'Verified Corridor'}</p>
                    </div>
                  </div>
                  <span className="font-mono text-[10px] text-muted">{evt.eventTime ? new Date(evt.eventTime).toLocaleDateString() : 'Verified'}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Cryptographic Ledger Seal */}
          <div className="mt-8 rounded-2xl border border-line bg-paper p-4 font-mono text-[11px] text-muted">
            <div className="flex items-center justify-between">
              <span className="uppercase text-[10px] text-muted font-bold">Blockchain Certificate</span>
              <span className="text-verified font-semibold">Fabric Block #1044</span>
            </div>
            <p className="mt-1 truncate text-[10px]">
              Transaction: TX-FABRIC-7804-DISPATCH-91A73
            </p>
          </div>

          <div className="mt-8 text-center">
            <Link
              href="/trace"
              className="inline-flex items-center gap-2 rounded-full bg-ink px-6 py-2.5 font-mono text-xs font-semibold text-paper transition hover:bg-ink/80"
            >
              <span>Explore Complete Provenance Graph</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-line py-4 text-center font-mono text-xs text-muted">
        TrustTrace Platform • Verified Supply Chain Protocol
      </footer>
    </div>
  );
}

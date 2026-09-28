'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ShieldCheck, CheckCircle2, Award, MapPin, Calendar, ArrowRight, ExternalLink, QrCode, AlertTriangle, XCircle, Loader2 } from 'lucide-react';
import { Batch, Product, TraceEvent } from '../../../lib/data';
import { resolveQrCode, fetchBatches, fetchProducts, fetchEvents } from '../../../lib/api';

export default function ConsumerVerificationPage() {
  const params = useParams();
  const code = String(params.code ?? '');

  const [batch, setBatch] = useState<Batch | null>(null);
  const [product, setProduct] = useState<Product | null>(null);
  const [events, setEvents] = useState<any[]>([]);
  const [qrScanInfo, setQrScanInfo] = useState<{ scanCount: number; publicCode: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!code) {
      setNotFound(true);
      setLoading(false);
      return;
    }

    let active = true;
    let resolved = false;

    // 1. Try resolving as a QR Code first
    resolveQrCode(code)
      .then((qrData) => {
        if (!active) return;
        if (!qrData || !qrData.batch) return;
        resolved = true;
        setQrScanInfo({ scanCount: qrData.qrCode?.scanCount ?? 1, publicCode: qrData.qrCode?.publicCode ?? code });
        if (qrData.batch) {
          setBatch({
            id: qrData.batch.id,
            batchCode: qrData.batch.batchCode,
            productId: qrData.batch.productId,
            productName: qrData.product?.name || 'Verified Product',
            quantity: Number(qrData.batch.quantity || 0),
            unit: qrData.batch.unit || 'kg',
            productionDate: qrData.batch.productionDate ? new Date(qrData.batch.productionDate).toISOString().split('T')[0] : '',
            expiryDate: qrData.batch.expiryDate ? new Date(qrData.batch.expiryDate).toISOString().split('T')[0] : '',
            currentOwnerOrgId: qrData.batch.currentOwnerOrgId,
            currentOwnerName: qrData.owner?.name || 'Verified Consortium Member',
            status: qrData.batch.status || 'AVAILABLE',
            originLocation: qrData.batch.originLocation || '',
            trustScore: 0,
            trustStatus: qrData.verified ? 'VERIFIED' : 'PENDING'
          });
        }
        if (qrData.product) {
          setProduct({
            id: qrData.product.id,
            productCode: qrData.product.productCode,
            sku: qrData.product.sku,
            gtin: qrData.product.gtin,
            name: qrData.product.name,
            description: qrData.product.description || '',
            category: qrData.product.category,
            unitOfMeasure: qrData.product.unitOfMeasure,
            status: qrData.product.status,
            organizationId: qrData.product.organizationId,
            organizationName: qrData.owner?.name || ''
          });
        }
        if (Array.isArray(qrData.events) && qrData.events.length > 0) {
          setEvents(qrData.events);
        }
        setLoading(false);
      })
      .catch(() => {
        // QR resolution failed, try batch lookup below
      });

    // 2. Also try fetching batch and events directly
    fetchBatches().then((allBatches) => {
      if (!active || resolved) return;
      const b = allBatches.find((item) => item.batchCode === code || item.id === code);
      if (b) {
        resolved = true;
        setBatch(b);
        fetchProducts().then((allProds) => {
          if (!active) return;
          const p = allProds.find((prod) => prod.id === b.productId || prod.name === b.productName);
          if (p) setProduct(p);
        });
        fetchEvents().then((allEvts) => {
          if (!active) return;
          const filtered = allEvts.filter((e) => e.batchCode === code || e.batchId === code || e.batchId === b.id);
          if (filtered.length > 0) setEvents(filtered);
          setLoading(false);
        });
      } else {
        // No batch found either — mark as not found
        setTimeout(() => {
          if (active && !resolved) {
            setNotFound(true);
            setLoading(false);
          }
        }, 1500);
      }
    }).catch(() => {
      if (active && !resolved) {
        setNotFound(true);
        setLoading(false);
      }
    });

    return () => {
      active = false;
    };
  }, [code]);

  // --- LOADING STATE ---
  if (loading) {
    return (
      <div className="min-h-screen bg-paper text-ink flex flex-col justify-between">
        <header className="border-b border-line bg-white/80 py-4 px-6 backdrop-blur">
          <div className="mx-auto flex max-w-xl items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-ink text-paper">
                <ShieldCheck className="h-4 w-4" />
              </div>
              <span className="font-mono text-sm font-bold tracking-tight">TrustTrace</span>
            </Link>
          </div>
        </header>
        <main className="mx-auto my-8 w-full max-w-xl px-4 flex flex-col items-center justify-center py-24">
          <Loader2 className="h-10 w-10 animate-spin text-muted" />
          <p className="mt-4 text-sm text-muted font-mono">Resolving product code…</p>
        </main>
        <footer className="border-t border-line py-4 text-center font-mono text-xs text-muted">
          TrustTrace Platform • Verified Supply Chain Protocol
        </footer>
      </div>
    );
  }

  // --- NOT FOUND / UNVERIFIED STATE ---
  if (notFound || !batch) {
    return (
      <div className="min-h-screen bg-paper text-ink flex flex-col justify-between">
        <header className="border-b border-line bg-white/80 py-4 px-6 backdrop-blur">
          <div className="mx-auto flex max-w-xl items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-ink text-paper">
                <ShieldCheck className="h-4 w-4" />
              </div>
              <span className="font-mono text-sm font-bold tracking-tight">TrustTrace</span>
            </Link>
          </div>
        </header>
        <main className="mx-auto my-8 w-full max-w-xl px-4">
          <div className="rounded-3xl border-2 border-red-200 bg-white p-8 shadow-sm">
            <div className="flex flex-col items-center text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-50 text-red-600 ring-8 ring-red-50/50">
                <XCircle className="h-9 w-9" />
              </div>
              <span className="mt-4 font-mono text-xs font-bold uppercase tracking-widest text-red-600">
                Code Not Recognized
              </span>
              <h1 className="mt-2 text-2xl font-bold tracking-tight text-ink">
                Unverified Product
              </h1>
              <p className="mt-3 max-w-md text-sm text-muted leading-relaxed">
                The code <span className="font-mono font-semibold text-ink">{code}</span> was not found
                in the TrustTrace verified product registry. This could mean the product has not been registered,
                the code is invalid, or it may be counterfeit.
              </p>
              <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-left text-xs text-amber-800">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
                  <div>
                    <p className="font-semibold">Consumer Advisory</p>
                    <p className="mt-1">If you purchased this product expecting it to be verified, please contact the retailer.
                    Report suspected counterfeits to your local consumer protection authority.</p>
                  </div>
                </div>
              </div>
              <div className="mt-6">
                <Link
                  href="/"
                  className="inline-flex items-center gap-2 rounded-full bg-ink px-6 py-2.5 font-mono text-xs font-semibold text-paper transition hover:bg-ink/80"
                >
                  <span>Return to TrustTrace</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </main>
        <footer className="border-t border-line py-4 text-center font-mono text-xs text-muted">
          TrustTrace Platform • Verified Supply Chain Protocol
        </footer>
      </div>
    );
  }

  // --- VERIFIED PRODUCT STATE ---
  const displayEvents = events;

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
          {/* Recalled Banner */}
          {batch.status === 'RECALLED' && (
            <div className="mb-6 rounded-xl border-2 border-red-300 bg-red-50 px-4 py-3 text-center">
              <div className="flex items-center justify-center gap-2 text-red-700 font-mono text-xs font-bold uppercase tracking-wider">
                <AlertTriangle className="h-4 w-4" />
                <span>Product Recalled — Do Not Use</span>
                <AlertTriangle className="h-4 w-4" />
              </div>
              <p className="mt-1 text-xs text-red-600">This batch has been subject to a product recall. Contact the retailer for return/refund.</p>
            </div>
          )}

          {/* Trust Verification Badge */}
          <div className="flex flex-col items-center text-center">
            <div className={`flex h-16 w-16 items-center justify-center rounded-full ring-8 ${
              batch.status === 'RECALLED'
                ? 'bg-red-100 text-red-600 ring-red-50'
                : 'bg-verified/10 text-verified ring-verified/5'
            }`}>
              {batch.status === 'RECALLED' ? <XCircle className="h-9 w-9" /> : <CheckCircle2 className="h-9 w-9" />}
            </div>
            <span className={`mt-4 font-mono text-xs font-bold uppercase tracking-widest ${
              batch.status === 'RECALLED' ? 'text-red-600' : 'text-verified'
            }`}>
              {batch.status === 'RECALLED' ? 'Recalled Product' : 'Authenticity Verified'}
            </span>
            <h1 className="mt-1 text-2xl font-bold tracking-tight text-ink md:text-3xl">
              {product?.name || batch.productName || 'Verified Product'}
            </h1>
            <p className="mt-2 text-xs text-muted leading-relaxed max-w-md">
              {product?.description || ''}
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
              <p className="mt-0.5 font-bold text-ink">{batch.originLocation || 'Not specified'}</p>
            </div>
            <div>
              <span className="text-[10px] uppercase text-muted">Batch Number</span>
              <p className="mt-0.5 font-bold text-ink">{batch.batchCode}</p>
            </div>
            <div>
              <span className="text-[10px] uppercase text-muted">Harvest / Production</span>
              <p className="mt-0.5 text-ink">{batch.productionDate || 'N/A'}</p>
            </div>
            <div>
              <span className="text-[10px] uppercase text-muted">Status</span>
              <p className={`mt-0.5 font-bold ${batch.status === 'RECALLED' ? 'text-red-600' : 'text-verified'}`}>
                {batch.status || 'ACTIVE'}
              </p>
            </div>
          </div>

          {/* Transparent Supply Chain Milestones (Consumer Safe) */}
          {displayEvents.length > 0 && (
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
          )}

          {displayEvents.length === 0 && (
            <div className="mt-8 border-t border-line pt-6 text-center">
              <p className="text-xs text-muted font-mono">No supply chain events recorded yet for this batch.</p>
            </div>
          )}

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

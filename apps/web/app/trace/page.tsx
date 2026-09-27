'use client';

import React, { useState, useEffect } from 'react';
import { Navbar } from '../../components/layout/Navbar';
import { ProvenanceGraph } from '../../components/provenance/ProvenanceGraph';
import { mockTraceEvents, mockBatches } from '../../lib/data';
import { fetchTrace, fetchBatches } from '../../lib/api';
import { StatusPill } from '../../components/ui/StatusPill';
import {
  Search,
  ArrowRightLeft,
  Download,
  Share2,
  Clock,
  ShieldCheck,
  CheckCircle2,
  Lock,
  Building2,
  ExternalLink,
  ChevronDown
} from 'lucide-react';

export default function TracePage() {
  const [batchInput, setBatchInput] = useState('BATCH-2026-001');
  const [activeBatch, setActiveBatch] = useState('BATCH-2026-001');
  const [direction, setDirection] = useState<'forward' | 'backward'>('forward');
  const [availableBatches, setAvailableBatches] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>(() => mockTraceEvents.slice(0, 5));
  const [selectedEventId, setSelectedEventId] = useState<string>('evt-4');

  useEffect(() => {
    fetchBatches().then((list) => {
      if (Array.isArray(list) && list.length > 0) {
        setAvailableBatches(list);
      }
    });
  }, []);

  useEffect(() => {
    if (!activeBatch) return;
    fetchTrace(activeBatch, direction).then((data) => {
      if (data && Array.isArray(data.events) && data.events.length > 0) {
        setEvents(data.events);
        setSelectedEventId(data.events[0].id);
      }
    });
  }, [activeBatch, direction]);

  const selectedEvent = events.find((e) => e.id === selectedEventId) || events[0] || mockTraceEvents[0];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (batchInput.trim()) {
      setActiveBatch(batchInput.trim().toUpperCase());
    }
  };

  const handleExport = () => {
    const report = {
      "@context": [
        "https://ref.gs1.org/standards/epcis/2.0.0/epcis-context.jsonld",
        { "trusttrace": "https://trusttrace.io/context/v1" }
      ],
      type: "EPCISDocument",
      schemaVersion: "2.0",
      creationDate: new Date().toISOString(),
      consortiumLedger: "Hyperledger Fabric - Channel: traceability-channel",
      batchCode: activeBatch,
      eventCount: events.length,
      provenanceTrail: events.map((e) => ({
        eventCode: e.eventCode,
        eventType: e.eventType,
        businessStep: e.businessStep,
        organization: e.sourceOrg?.name || e.sourceOrgName,
        destination: e.destinationOrg?.name || e.destinationOrgName,
        location: e.location,
        timestamp: e.eventTime,
        signature: e.signature,
        trustScore: e.trustScore,
        trustStatus: e.trustStatus,
        blockchainTxId: e.blockchainTx?.transactionId || e.blockchainTxId
      }))
    };
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `trusttrace-${activeBatch}-epcis-report.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-paper text-ink">
      <Navbar />

      <main className="mx-auto max-w-7xl px-6 py-10">
        {/* Header */}
        <div className="flex flex-wrap items-end justify-between gap-4 border-b border-line pb-6">
          <div>
            <span className="font-mono text-xs uppercase tracking-widest text-muted">Provenance Engine</span>
            <h1 className="mt-1 text-3xl font-bold tracking-tight md:text-4xl">
              Public Traceability Explorer
            </h1>
            <p className="mt-1.5 text-sm text-muted">
              Verify complete product provenance across multiple organizations from origin harvest to retail.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExport}
              className="inline-flex items-center gap-1.5 rounded-full border border-line bg-white px-3.5 py-1.5 text-xs font-medium text-ink transition hover:bg-paper"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Export GS1 EPCIS Report</span>
            </button>
            <button
              onClick={() => {
                navigator.clipboard?.writeText(window.location.href);
                alert('Trace URL copied to clipboard!');
              }}
              className="inline-flex items-center gap-1.5 rounded-full border border-line bg-white px-3.5 py-1.5 text-xs font-medium text-ink transition hover:bg-paper"
            >
              <Share2 className="h-3.5 w-3.5" />
              <span>Share Trace</span>
            </button>
          </div>
        </div>

        {/* Search & Mode Bar */}
        <div className="mt-8 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-line bg-white p-4 shadow-sm">
          <form onSubmit={handleSearch} className="flex flex-1 flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[220px] max-w-sm">
              <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
              <input
                type="text"
                list="batch-suggestions"
                value={batchInput}
                onChange={(e) => setBatchInput(e.target.value)}
                placeholder="Enter Batch ID (e.g. BATCH-2026-001)..."
                className="w-full rounded-full border border-line bg-paper py-2 pl-10 pr-4 font-mono text-xs text-ink outline-none transition focus:border-ink"
              />
              <datalist id="batch-suggestions">
                {availableBatches.map((b) => (
                  <option key={b.id || b.batchCode} value={b.batchCode}>
                    {b.productName}
                  </option>
                ))}
              </datalist>
            </div>

            {availableBatches.length > 0 && (
              <select
                value={availableBatches.some((b) => b.batchCode === activeBatch) ? activeBatch : ''}
                onChange={(e) => {
                  if (e.target.value) {
                    setBatchInput(e.target.value);
                    setActiveBatch(e.target.value);
                  }
                }}
                className="rounded-full border border-line bg-paper px-3 py-2 font-mono text-xs text-ink outline-none focus:border-ink"
              >
                <option value="" disabled>Select Stored Batch...</option>
                {availableBatches.map((b) => (
                  <option key={b.id || b.batchCode} value={b.batchCode}>
                    {b.batchCode} - {b.productName}
                  </option>
                ))}
              </select>
            )}

            <button
              type="submit"
              className="rounded-full bg-ink px-5 py-2 font-mono text-xs font-medium text-paper transition hover:bg-ink/80"
            >
              Trace
            </button>
          </form>

          {/* Forward / Backward Toggle */}
          <div className="flex items-center gap-2 border-l border-line pl-4">
            <span className="font-mono text-xs text-muted">Direction:</span>
            <button
              onClick={() => setDirection(direction === 'forward' ? 'backward' : 'forward')}
              className="inline-flex items-center gap-1.5 rounded-full border border-line bg-paper px-3 py-1 font-mono text-xs font-semibold text-ink transition hover:bg-line"
            >
              <ArrowRightLeft className="h-3 w-3" />
              <span className="uppercase">{direction} TRACE</span>
            </button>
          </div>
        </div>

        {/* Interactive Provenance SVG Graph */}
        <div className="mt-8">
          <ProvenanceGraph batchCode={activeBatch} direction={direction} />
        </div>

        {/* Dual Layout: Event Timeline + Detailed Event Inspector */}
        <div className="mt-10 grid gap-8 lg:grid-cols-[1.2fr_1fr]">
          {/* Vertical Event Timeline */}
          <div className="rounded-2xl border border-line bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between border-b border-line pb-4">
              <div>
                <h3 className="font-bold text-ink">Cryptographic Event Trail</h3>
                <p className="text-xs text-muted">All lifecycle events validated and committed to Hyperledger Fabric</p>
              </div>
              <span className="font-mono text-xs text-muted">{events.length} Events</span>
            </div>

            <div className="mt-6 space-y-6">
              {events.map((evt, idx) => {
                const isSelected = selectedEvent.id === evt.id;
                return (
                  <div
                    key={evt.id}
                    onClick={() => setSelectedEventId(evt.id)}
                    className={`relative flex cursor-pointer gap-4 rounded-xl border p-4 transition-all ${
                      isSelected
                        ? 'border-ink bg-paper/50 shadow-sm ring-1 ring-ink/10'
                        : 'border-line bg-white hover:border-ink/40'
                    }`}
                  >
                    <div className="flex flex-col items-center">
                      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-verified text-white">
                        <CheckCircle2 className="h-4 w-4" />
                      </div>
                      {idx < events.length - 1 && <div className="mt-1 h-full w-0.5 bg-line"></div>}
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-ink">{evt.eventCode}</span>
                          <span className="rounded bg-paper px-2 py-0.5 font-mono text-[10px] font-semibold border border-line">
                            {evt.eventType}
                          </span>
                        </div>
                        <StatusPill status={evt.trustStatus} />
                      </div>

                      <p className="mt-1.5 text-xs text-ink font-medium">{evt.location}</p>
                      <div className="mt-2 flex flex-wrap items-center gap-4 font-mono text-[11px] text-muted">
                        <span>Org: {evt.sourceOrgName}</span>
                        <span>Time: {evt.eventTime.replace('T', ' ').replace('Z', ' UTC')}</span>
                        <span className="text-verified">Score: {evt.trustScore}/100</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Deep Forensic Event Inspector */}
          <div className="sticky top-24 h-fit rounded-2xl border border-line bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between border-b border-line pb-4">
              <div>
                <span className="font-mono text-xs uppercase text-muted">Investigation Detail</span>
                <h3 className="text-base font-bold text-ink">{selectedEvent.eventCode}</h3>
              </div>
              <StatusPill status={selectedEvent.trustStatus} />
            </div>

            <div className="mt-4 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3 rounded-xl border border-line bg-paper/50 p-3 font-mono">
                <div>
                  <span className="text-[10px] uppercase text-muted">Event Type</span>
                  <p className="font-bold text-ink">{selectedEvent.eventType}</p>
                </div>
                <div>
                  <span className="text-[10px] uppercase text-muted">Business Step</span>
                  <p className="font-bold text-ink">{selectedEvent.businessStep}</p>
                </div>
                <div>
                  <span className="text-[10px] uppercase text-muted">Source Org</span>
                  <p className="font-bold text-ink truncate">{selectedEvent.sourceOrgName}</p>
                </div>
                <div>
                  <span className="text-[10px] uppercase text-muted">Ledger Proof</span>
                  <p className="font-bold text-verified">CONFIRMED (Block #{selectedEvent.blockNumber ?? 1044})</p>
                </div>
              </div>

              {/* Trust Checks breakdown */}
              <div>
                <span className="font-mono text-[11px] font-semibold text-muted uppercase">Pre-Commit Trust Checks</span>
                <div className="mt-2 space-y-1.5">
                  {(selectedEvent.checks || []).slice(0, 5).map((chk: any) => (
                    <div key={chk.id || chk.checkType} className="flex items-center justify-between rounded-lg border border-line bg-white p-2">
                      <span className="font-mono text-[11px]">{chk.checkType}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-muted">{chk.reason}</span>
                        <span className="font-mono text-[10px] font-bold text-verified">✓ {chk.score} pts</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Cryptographic & Endorsement Details */}
              <div>
                <span className="font-mono text-[11px] font-semibold text-muted uppercase">Consortium Endorsement Policy</span>
                <div className="mt-2 rounded-xl border border-line bg-white p-3 font-mono text-[11px] space-y-1.5">
                  {(selectedEvent.endorsements || []).map((end: any, i: number) => (
                    <div key={i} className="flex items-center justify-between border-b border-line/60 pb-1 last:border-0 last:pb-0">
                      <span className="text-ink font-semibold">{end.orgName || end.organization?.name}</span>
                      <span className="text-verified">✓ {end.decision}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <span className="font-mono text-[11px] font-semibold text-muted uppercase">SHA-256 Evidence Hash</span>
                <p className="mt-1 break-all rounded-lg border border-line bg-paper p-2 font-mono text-[10px] text-muted">
                  {selectedEvent.evidenceHash}
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

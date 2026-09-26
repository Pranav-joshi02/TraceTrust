'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { AppShell } from '../../../components/layout/AppShell';
import { mockTraceEvents, TraceEvent } from '../../../lib/data';
import { fetchEventById, fetchEvents } from '../../../lib/api';
import { StatusPill } from '../../../components/ui/StatusPill';
import {
  ArrowLeft,
  ShieldCheck,
  ShieldAlert,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Lock,
  Binary,
  FileCheck2,
  Share2,
  Terminal,
  ExternalLink
} from 'lucide-react';

export default function EventInvestigationPage() {
  const params = useParams();
  const id = String(params.id ?? 'evt-4');
  const [viewJson, setViewJson] = useState(false);

  const [event, setEvent] = useState<TraceEvent>(() => {
    return mockTraceEvents.find((e) => e.id === id || e.eventCode === id) || mockTraceEvents[3];
  });

  useEffect(() => {
    fetchEventById(id).then((ev) => {
      if (ev) {
        setEvent(ev);
      } else {
        fetchEvents().then((allEvts) => {
          const match = allEvts.find((e) => e.id === id || e.eventCode === id);
          if (match) setEvent(match);
        });
      }
    });
  }, [id]);

  const isVerified = event.trustStatus === 'VERIFIED';

  return (
    <AppShell
      title={`Forensic Investigation: ${event.eventCode}`}
      description="Cryptographic proof, multi-party endorsements, and 10-point algorithmic verification analysis."
      action={
        <div className="flex items-center gap-2">
          <Link
            href="/events"
            className="inline-flex items-center gap-1.5 rounded-full border border-line bg-white px-3.5 py-1.5 text-xs font-medium text-ink transition hover:bg-paper"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>All Events</span>
          </Link>
          <button
            onClick={() => setViewJson(!viewJson)}
            className="inline-flex items-center gap-1.5 rounded-full border border-line bg-white px-3.5 py-1.5 text-xs font-medium text-ink transition hover:bg-paper font-mono"
          >
            <Binary className="h-3.5 w-3.5" />
            <span>{viewJson ? 'View Analysis' : 'EPCIS 2.0 JSON-LD'}</span>
          </button>
        </div>
      }
    >
      {/* Investigation Status Banner */}
      <div
        className={`rounded-2xl border p-6 shadow-sm transition-all ${
          isVerified
            ? 'border-verified/30 bg-verified/5'
            : 'border-rejected/30 bg-rejected/5'
        }`}
      >
        <div className="flex flex-wrap items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div
              className={`flex h-12 w-12 items-center justify-center rounded-xl text-white ${
                isVerified ? 'bg-verified' : 'bg-rejected'
              }`}
            >
              {isVerified ? <ShieldCheck className="h-7 w-7" /> : <ShieldAlert className="h-7 w-7" />}
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <span className="font-mono text-sm font-bold text-ink">{event.eventCode}</span>
                <span className="rounded bg-paper px-2 py-0.5 font-mono text-xs font-semibold border border-line">
                  {event.eventType}
                </span>
                <StatusPill status={event.trustStatus} />
              </div>
              <p className="mt-1 text-xs text-muted">
                Recorded at {event.location} • Actor: {event.sourceOrgName}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-8 font-mono text-xs">
            <div>
              <span className="block text-[10px] uppercase text-muted">Trust Score</span>
              <span className={`text-2xl font-bold ${isVerified ? 'text-verified' : 'text-rejected'}`}>
                {event.trustScore}/100
              </span>
            </div>
            <div className="border-l border-line pl-6">
              <span className="block text-[10px] uppercase text-muted">Fabric State</span>
              <span className={`font-semibold ${isVerified ? 'text-verified' : 'text-rejected'}`}>
                {event.blockchainStatus}
              </span>
            </div>
          </div>
        </div>
      </div>

      {viewJson ? (
        /* EPCIS 2.0 JSON-LD View */
        <div className="mt-8 rounded-2xl border border-line bg-ink p-6 text-paper shadow-sm">
          <div className="flex items-center justify-between border-b border-paper/20 pb-3 font-mono text-xs">
            <span>GS1 EPCIS 2.0 Standard Event Document (JSON-LD)</span>
            <span className="text-muted">Standard Context 2.0.0</span>
          </div>
          <pre className="mt-4 overflow-x-auto font-mono text-xs leading-relaxed text-emerald-400">
            {JSON.stringify(
              {
                '@context': 'https://ref.gs1.org/standards/epcis/2.0.0/epcis-context.jsonld',
                isA: 'EPCISDocument',
                schemaVersion: '2.0',
                creationDate: event.recordedAt,
                epcisBody: {
                  eventList: [
                    {
                      eventID: event.eventCode,
                      type: event.epcisEvent?.type || 'ObjectEvent',
                      action: event.epcisEvent?.action || 'OBSERVE',
                      bizStep: event.businessStep,
                      disposition: event.disposition,
                      eventTime: event.eventTime,
                      eventTimeZoneOffset: '+05:30',
                      readPoint: { id: `urn:trusttrace:loc:${event.location.replace(/\s+/g, '-').toLowerCase()}` },
                      bizLocation: { id: `urn:trusttrace:org:${event.sourceOrgId}` },
                      epcList: [`urn:trusttrace:batch:${event.batchCode}`],
                      evidenceHash: event.evidenceHash,
                      digitalSignature: event.signature
                    }
                  ]
                }
              },
              null,
              2
            )}
          </pre>
        </div>
      ) : (
        /* Forensic Breakdown Grid */
        <div className="mt-8 grid gap-8 lg:grid-cols-[1.2fr_1fr]">
          {/* Left Column: 10 Trust Checks Breakdown */}
          <div className="rounded-2xl border border-line bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between border-b border-line pb-4">
              <div>
                <h3 className="font-bold text-ink">Trust Validation Pipeline Breakdown</h3>
                <p className="text-xs text-muted">Algorithmic tests executed prior to distributed consensus</p>
              </div>
              <span className="font-mono text-xs text-muted">{event.checks.length} Checks</span>
            </div>

            <div className="mt-4 divide-y divide-line">
              {event.checks.map((chk) => {
                const passed = chk.status === 'PASSED';
                return (
                  <div key={chk.id} className="py-3 flex items-start justify-between text-xs">
                    <div className="flex items-start gap-3">
                      <span className="mt-0.5 shrink-0">
                        {passed ? (
                          <CheckCircle2 className="h-4 w-4 text-verified" />
                        ) : (
                          <XCircle className="h-4 w-4 text-rejected" />
                        )}
                      </span>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-ink">{chk.checkType}</span>
                          <span
                            className={`rounded-full px-2 py-0.2 font-mono text-[9px] font-semibold border ${
                              passed
                                ? 'border-verified/30 bg-verified/10 text-verified'
                                : 'border-rejected/30 bg-rejected/10 text-rejected'
                            }`}
                          >
                            {chk.status}
                          </span>
                        </div>
                        <p className="mt-1 text-muted text-[11px] leading-relaxed">{chk.reason}</p>
                      </div>
                    </div>

                    <div className="text-right font-mono shrink-0 ml-4">
                      <span className={`font-bold ${passed ? 'text-verified' : 'text-rejected'}`}>
                        {chk.score} pts
                      </span>
                      <span className="block text-[10px] text-muted">{chk.executionTimeMs}ms</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Consortium Endorsement & Blockchain Proof */}
          <div className="space-y-6">
            {/* Blockchain Proof Card */}
            <div className="rounded-2xl border border-line bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between border-b border-line pb-3">
                <h4 className="font-bold text-ink">Fabric Distributed Ledger Proof</h4>
                <Lock className="h-4 w-4 text-muted" />
              </div>

              <div className="mt-4 space-y-2.5 font-mono text-xs">
                <div className="flex justify-between border-b border-line/60 pb-2">
                  <span className="text-muted">Ledger Network:</span>
                  <span className="text-ink">trusttrace-fabric</span>
                </div>
                <div className="flex justify-between border-b border-line/60 pb-2">
                  <span className="text-muted">Consortium Channel:</span>
                  <span className="text-ink">provenance-channel</span>
                </div>
                <div className="flex justify-between border-b border-line/60 pb-2">
                  <span className="text-muted">Chaincode Contract:</span>
                  <span className="text-ink">trusttrace-cc</span>
                </div>
                <div className="flex justify-between border-b border-line/60 pb-2">
                  <span className="text-muted">Transaction ID:</span>
                  <span className="truncate max-w-[180px] text-ink">{event.blockchainTxId ?? 'NOT_COMMITTED'}</span>
                </div>
                <div className="flex justify-between border-b border-line/60 pb-2">
                  <span className="text-muted">Block Number:</span>
                  <span className="text-ink">{event.blockNumber ?? 'N/A'}</span>
                </div>
              </div>

              <div className="mt-4">
                <span className="font-mono text-[11px] font-semibold text-muted uppercase">Digital Signature</span>
                <p className="mt-1 break-all rounded-lg border border-line bg-paper p-2 font-mono text-[10px] text-muted">
                  {event.signature}
                </p>
              </div>
            </div>

            {/* Endorsement Card */}
            <div className="rounded-2xl border border-line bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between border-b border-line pb-3">
                <h4 className="font-bold text-ink">Consortium Multi-Party Endorsements</h4>
                <span className="font-mono text-[11px] text-muted">2-of-3 Rule</span>
              </div>

              <div className="mt-4 space-y-3">
                {event.endorsements.map((end, idx) => (
                  <div key={idx} className="rounded-xl border border-line bg-paper/50 p-3 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-ink">{end.orgName}</span>
                      <span
                        className={`rounded-full px-2 py-0.5 font-mono text-[10px] font-semibold ${
                          end.decision === 'APPROVED'
                            ? 'bg-verified/10 text-verified'
                            : 'bg-rejected/10 text-rejected'
                        }`}
                      >
                        {end.decision}
                      </span>
                    </div>
                    <p className="mt-1 text-muted text-[11px]">{end.comment}</p>
                    <span className="mt-1.5 block font-mono text-[10px] text-muted">{end.signedAt}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}

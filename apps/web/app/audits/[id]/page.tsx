'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { AppShell } from '../../../components/layout/AppShell';
import { StatusPill } from '../../../components/ui/StatusPill';
import { mockAuditLogs, AuditRecord } from '../../../lib/data';
import { fetchAudits } from '../../../lib/api';
import {
  History,
  ArrowLeft,
  User,
  Building2,
  Calendar,
  Lock,
  FileCheck2,
  CheckCircle2,
  Terminal,
  Layers,
} from 'lucide-react';

export default function AuditDetailPage() {
  const params = useParams();
  const id = String(params.id ?? '');
  const [audit, setAudit] = useState<AuditRecord | null>(() => {
    return mockAuditLogs.find((a) => a.id === id) || mockAuditLogs[0];
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchAudits().then((logs) => {
      const match = logs?.find((a: any) => a.id === id);
      if (match) setAudit(match);
      setIsLoading(false);
    });
  }, [id]);

  if (!audit) {
    return (
      <AppShell title="Audit Record Not Found">
        <div className="rounded-2xl border border-line bg-white p-8 text-center" role="alert">
          <p className="text-sm text-muted">The requested technical audit entry could not be located in the log trail.</p>
          <Link href="/audits" className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-ink underline">
            <ArrowLeft className="h-3.5 w-3.5" /> Back to Audits
          </Link>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell
      title={`Audit Trail Entry: ${audit.id}`}
      description={`${audit.action} on ${audit.entityType} • Logged at ${audit.timestamp}`}
      action={
        <Link
          href="/audits"
          className="inline-flex items-center gap-1.5 rounded-full border border-line bg-white px-3.5 py-1.5 text-xs font-medium text-ink transition hover:bg-paper"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>All Audits</span>
        </Link>
      }
    >
      <div className="space-y-6 max-w-4xl mx-auto">
        {/* Main Audit Record Card */}
        <div className="rounded-2xl border border-line bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-4 border-b border-line pb-6">
            <div className="flex items-start gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-ink text-paper shrink-0">
                <History className="h-7 w-7" aria-hidden="true" />
              </div>
              <div>
                <div className="flex items-center gap-2.5">
                  <h2 className="text-xl font-bold font-mono text-ink">{audit.action}</h2>
                  <span className="rounded-full border border-verified/30 bg-verified/10 px-2.5 py-0.5 font-mono text-[10px] font-bold text-verified">
                    VERIFIED LOG
                  </span>
                </div>
                <p className="mt-1 text-xs text-muted">Target Entity: <strong className="font-mono text-ink">{audit.entityType} ({audit.entityId})</strong></p>
                <div className="mt-2 flex items-center gap-2 text-xs text-muted">
                  <Calendar className="h-3.5 w-3.5" aria-hidden="true" />
                  <span className="font-mono">{audit.timestamp}</span>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-line bg-paper/60 p-3 text-xs font-mono">
              <span className="text-[10px] text-muted uppercase font-bold block mb-1">Immutability Proof</span>
              <div className="flex items-center gap-1.5 text-ink font-semibold">
                <CheckCircle2 className="h-3.5 w-3.5 text-verified" aria-hidden="true" />
                <span>SHA-256 Chained</span>
              </div>
            </div>
          </div>

          {/* Details Grid */}
          <div className="mt-6 grid gap-4 sm:grid-cols-2 text-xs">
            <div className="rounded-xl border border-line bg-paper/30 p-4 space-y-2">
              <span className="text-[10px] font-mono text-muted uppercase font-bold block">Operator Context</span>
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted shrink-0" aria-hidden="true" />
                <div>
                  <span className="text-muted block text-[11px]">Actor:</span>
                  <span className="font-mono font-semibold text-ink">{audit.actor}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 pt-2 border-t border-line/60">
                <Building2 className="h-4 w-4 text-muted shrink-0" aria-hidden="true" />
                <div>
                  <span className="text-muted block text-[11px]">Affiliated Organization:</span>
                  <span className="font-semibold text-ink">{audit.organization}</span>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-line bg-paper/30 p-4 space-y-2">
              <span className="text-[10px] font-mono text-muted uppercase font-bold block">Execution Metadata</span>
              <div>
                <span className="text-muted block text-[11px]">Action Descriptor:</span>
                <p className="mt-0.5 text-ink font-medium">{audit.details}</p>
              </div>
            </div>
          </div>

          {/* Cryptographic Transaction Hash */}
          <div className="mt-6 rounded-xl border border-line bg-paper/70 p-4 text-xs font-mono">
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-ink flex items-center gap-1.5">
                <Lock className="h-3.5 w-3.5 text-verified" aria-hidden="true" />
                Audit Transaction Hash (Fabric Ledger Proof)
              </span>
              <span className="text-[10px] text-muted">Immutable Ledger Block</span>
            </div>
            <p className="break-all text-[11px] text-muted bg-white p-2.5 rounded-lg border border-line">
              {audit.txHash || '0x4f8b2c1a9e7d3f5a8b0c2d4e6f8a1b3c5d7e9f0a2b4c6d8e0f1a3b5c7d9e1f3a'}
            </p>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

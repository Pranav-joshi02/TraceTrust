'use client';

import React, { useState, useEffect } from 'react';
import { AppShell } from '../../components/layout/AppShell';
import { mockDisputes, Dispute } from '../../lib/data';
import { fetchDisputes, createDispute } from '../../lib/api';
import { Scale, AlertCircle, CheckCircle2, Search, ArrowRight, ShieldAlert, FileText, Plus, X } from 'lucide-react';
import { StatusPill } from '../../components/ui/StatusPill';

export default function DisputesPage() {
  const [disputes, setDisputes] = useState<Dispute[]>(mockDisputes);
  const [selectedDispute, setSelectedDispute] = useState<Dispute>(mockDisputes[0]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // New dispute form state
  const [eventCode, setEventCode] = useState('EVT-82A19-99');
  const [reason, setReason] = useState('');
  const [againstOrg, setAgainstOrg] = useState('TransGlobal ColdChain');

  useEffect(() => {
    fetchDisputes().then((data) => {
      if (data.length > 0) {
        setDisputes(data);
        setSelectedDispute(data[0]);
      }
    });
  }, []);

  const handleResolve = (id: string) => {
    const updated = disputes.map((d) =>
      d.id === id
        ? {
            ...d,
            status: 'RESOLVED' as const,
            resolution: 'Auditor review concluded: Event quarantined, ledger entry voided, replacement consignment approved.'
          }
        : d
    );
    setDisputes(updated);
    if (selectedDispute.id === id) {
      setSelectedDispute({
        ...selectedDispute,
        status: 'RESOLVED',
        resolution: 'Auditor review concluded: Event quarantined, ledger entry voided, replacement consignment approved.'
      });
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason) return;

    const newDsp: Dispute = {
      id: `dsp-${Date.now()}`,
      disputeCode: `DSP-${Date.now().toString().slice(-4)}`,
      eventCode,
      batchCode: 'BATCH-2026-001',
      raisedBy: 'NatureFresh Markets',
      againstOrg,
      reason,
      status: 'OPEN',
      raisedAt: new Date().toISOString().split('T')[0],
      evidenceCount: 1
    };

    setDisputes([newDsp, ...disputes]);
    setSelectedDispute(newDsp);
    setIsModalOpen(false);
    setReason('');

    await createDispute(newDsp);
  };

  return (
    <AppShell
      title="Consortium Dispute Resolution"
      description="Multi-party reconciliation for anomalous events, quantity mismatches, and signature repudiations."
      action={
        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-1.5 rounded-full bg-ink px-4 py-2 text-xs font-semibold text-paper transition hover:bg-ink/85"
        >
          <Plus className="h-4 w-4" />
          <span>Raise Dispute</span>
        </button>
      }
    >
      <div className="grid gap-8 lg:grid-cols-[1.2fr_1.8fr]">
        {/* Disputes List */}
        <div className="space-y-4">
          <span className="font-mono text-xs uppercase text-muted font-semibold">Active Inquiries</span>
          {disputes.map((disp) => {
            const isSelected = selectedDispute.id === disp.id;
            return (
              <div
                key={disp.id}
                onClick={() => setSelectedDispute(disp)}
                className={`cursor-pointer rounded-2xl border p-5 transition-all ${
                  isSelected
                    ? 'border-ink bg-white shadow-md ring-1 ring-ink/10'
                    : 'border-line bg-white/70 hover:bg-white'
                }`}
              >
                <div className="flex items-center justify-between border-b border-line pb-3">
                  <div className="flex items-center gap-2">
                    <Scale className="h-4 w-4 text-ink" />
                    <span className="font-mono text-xs font-bold text-ink">{disp.disputeCode}</span>
                  </div>
                  <StatusPill status={disp.status} />
                </div>

                <p className="mt-3 text-xs font-medium text-ink line-clamp-2">{disp.reason}</p>

                <div className="mt-4 flex items-center justify-between font-mono text-[11px] text-muted">
                  <span>Batch: {disp.batchCode}</span>
                  <span>{disp.raisedAt}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Dispute Details & Resolution View */}
        <div className="rounded-3xl border border-line bg-white p-7 shadow-sm">
          <div className="flex items-center justify-between border-b border-line pb-4">
            <div>
              <span className="font-mono text-xs font-bold text-ink">{selectedDispute.disputeCode}</span>
              <h2 className="mt-1 text-lg font-bold text-ink">Dispute Dossier</h2>
            </div>
            <StatusPill status={selectedDispute.status} />
          </div>

          <div className="mt-6 space-y-6 text-xs">
            <div>
              <h4 className="font-mono text-muted uppercase text-[10px] font-semibold">Complaint Ground</h4>
              <p className="mt-1.5 text-sm font-semibold text-ink leading-relaxed">{selectedDispute.reason}</p>
            </div>

            <div className="grid grid-cols-2 gap-4 rounded-2xl border border-line bg-paper/60 p-4 font-mono">
              <div>
                <span className="text-muted block text-[10px]">Claimant Org</span>
                <span className="font-bold text-ink text-xs">{selectedDispute.raisedBy}</span>
              </div>
              <div>
                <span className="text-muted block text-[10px]">Respondent Org</span>
                <span className="font-bold text-ink text-xs">{selectedDispute.againstOrg}</span>
              </div>
              <div>
                <span className="text-muted block text-[10px]">Target Event Code</span>
                <span className="font-bold text-ink text-xs">{selectedDispute.eventCode}</span>
              </div>
              <div>
                <span className="text-muted block text-[10px]">Associated Batch</span>
                <span className="font-bold text-ink text-xs">{selectedDispute.batchCode}</span>
              </div>
            </div>

            {selectedDispute.resolution && (
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-4">
                <span className="font-mono text-[10px] font-bold text-emerald-800 uppercase flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                  Binding Resolution
                </span>
                <p className="mt-2 text-xs font-medium text-emerald-950 leading-relaxed">{selectedDispute.resolution}</p>
              </div>
            )}

            {selectedDispute.status !== 'RESOLVED' && (
              <div className="pt-4 border-t border-line flex items-center justify-between">
                <p className="font-mono text-[11px] text-muted">Auditor quorum required to finalize.</p>
                <button
                  onClick={() => handleResolve(selectedDispute.id)}
                  className="rounded-full bg-verified px-5 py-2 font-mono text-xs font-semibold text-white shadow-sm hover:opacity-90"
                >
                  Apply Binding Resolution
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Raise Dispute Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-3xl border border-line bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-line pb-4">
              <div className="flex items-center gap-2">
                <Scale className="h-5 w-5 text-ink" />
                <h3 className="text-base font-bold text-ink">Raise Supply Chain Dispute</h3>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="rounded-full p-1 text-muted hover:bg-paper">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="mt-4 space-y-3 text-xs">
              <div>
                <label className="font-mono font-medium text-ink">Target Event Code *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. EVT-82A19-99"
                  value={eventCode}
                  onChange={(e) => setEventCode(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-line bg-paper px-3 py-2 font-mono uppercase outline-none focus:border-ink"
                />
              </div>

              <div>
                <label className="font-mono font-medium text-ink">Respondent Organization</label>
                <input
                  type="text"
                  required
                  value={againstOrg}
                  onChange={(e) => setAgainstOrg(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-line bg-paper px-3 py-2 font-mono outline-none focus:border-ink"
                />
              </div>

              <div>
                <label className="font-mono font-medium text-ink">Reason / Anomaly Description *</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Provide evidence of mismatch, physical seal compromise, or quantity discrepancy..."
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-line bg-paper px-3 py-2 font-mono outline-none focus:border-ink"
                />
              </div>

              <div className="mt-6 flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-full border border-line px-4 py-2 font-mono font-medium text-muted hover:bg-paper"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-full bg-ink px-5 py-2 font-mono font-medium text-paper hover:bg-ink/90"
                >
                  Submit Dispute to DB
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppShell>
  );
}

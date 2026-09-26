'use client';

import React, { useState, useEffect } from 'react';
import { AppShell } from '../../components/layout/AppShell';
import { mockRecalls, Recall, Batch } from '../../lib/data';
import { fetchRecalls, createRecall, fetchBatches, fetchRecallImpact } from '../../lib/api';
import { StatusPill } from '../../components/ui/StatusPill';
import { AlertTriangle, ShieldAlert, GitFork, ArrowDown, Building2, Store, Box, Plus } from 'lucide-react';

export default function RecallsPage() {
  const [recalls, setRecalls] = useState<Recall[]>(mockRecalls);
  const [selectedRecall, setSelectedRecall] = useState<Recall>(mockRecalls[0]);
  const [impactData, setImpactData] = useState<any>(null);
  const [batchList, setBatchList] = useState<Batch[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchRecalls().then((data) => {
      if (data.length > 0) {
        setRecalls(data);
        setSelectedRecall(data[0]);
      }
    });
    fetchBatches().then((data) => {
      if (data.length > 0) {
        setBatchList(data);
        setTargetBatch(data[0].batchCode);
      }
    });
  }, []);

  useEffect(() => {
    if (!selectedRecall?.id) return;
    fetchRecallImpact(selectedRecall.id).then((imp) => {
      if (imp) setImpactData(imp);
    });
  }, [selectedRecall?.id]);

  // New recall form state
  const [targetBatch, setTargetBatch] = useState('BATCH-2026-001');
  const [reason, setReason] = useState('');
  const [severity, setSeverity] = useState<'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'>('HIGH');

  const handleCreateRecall = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason) return;

    const newRec: Recall = {
      id: `rec-${Date.now()}`,
      recallCode: `REC-2026-0${recalls.length + 20}`,
      initiatedBy: 'Highland Organics Estate',
      reason,
      severity,
      status: 'OPEN',
      initiatedAt: new Date().toISOString(),
      affectedBatches: [targetBatch],
      affectedUnits: 1250,
      warehousesAffected: 2,
      retailersAffected: 5
    };

    setRecalls([newRec, ...recalls]);
    setSelectedRecall(newRec);
    setIsModalOpen(false);
    setReason('');

    await createRecall(newRec);
  };

  return (
    <AppShell
      title="Supply Chain Recall & Quarantine"
      description="Automated provenance graph traversal to identify downstream affected warehouses, distributors, and retail shelves."
      action={
        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-1.5 rounded-full bg-rejected px-4 py-2 text-xs font-semibold text-paper transition hover:bg-rejected/85"
        >
          <AlertTriangle className="h-4 w-4" />
          <span>Initiate Product Recall</span>
        </button>
      }
    >
      <div className="grid gap-8 lg:grid-cols-[1.2fr_1.8fr]">
        {/* Recalls List */}
        <div className="space-y-4">
          <span className="font-mono text-xs uppercase text-muted font-semibold">Active & Investigating Recalls</span>
          {recalls.map((rec) => {
            const isSelected = selectedRecall.id === rec.id;
            return (
              <div
                key={rec.id}
                onClick={() => setSelectedRecall(rec)}
                className={`cursor-pointer rounded-2xl border p-5 transition-all ${
                  isSelected
                    ? 'border-rejected bg-white shadow-md ring-1 ring-rejected/20'
                    : 'border-line bg-white/70 hover:bg-white hover:border-line'
                }`}
              >
                <div className="flex items-center justify-between border-b border-line pb-3">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-ink">{rec.recallCode}</span>
                    <span
                      className={`rounded-full px-2 py-0.5 font-mono text-[10px] font-bold ${
                        rec.severity === 'CRITICAL' || rec.severity === 'HIGH'
                          ? 'bg-rejected/10 text-rejected'
                          : 'bg-pending/10 text-pending'
                      }`}
                    >
                      {rec.severity} SEVERITY
                    </span>
                  </div>
                  <span className="rounded-full border border-line bg-paper px-2 py-0.5 font-mono text-[10px] text-muted">
                    {rec.status}
                  </span>
                </div>

                <p className="mt-3 text-xs leading-relaxed text-ink">{rec.reason}</p>

                <div className="mt-4 flex flex-wrap items-center justify-between text-[11px] font-mono text-muted">
                  <span>Batch: {rec.affectedBatches.join(', ')}</span>
                  <span className="font-bold text-rejected">{rec.affectedUnits} units affected</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Visual Impact Propagation Tree (Document 3 Requirement) */}
        <div className="rounded-2xl border border-line bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between border-b border-line pb-4">
            <div>
              <span className="font-mono text-xs uppercase text-muted">Downstream Blast Radius</span>
              <h3 className="text-base font-bold text-ink">
                Automated Impact Propagation: {selectedRecall.recallCode}
              </h3>
            </div>
            <span className="rounded-full border border-rejected/30 bg-rejected/10 px-3 py-1 font-mono text-xs font-bold text-rejected">
              {selectedRecall.affectedUnits} Total Units Quarantined
            </span>
          </div>

          {/* Propagation Hierarchy */}
          <div className="mt-8 flex flex-col items-center">
            {/* Origin Root */}
            <div className="rounded-xl border border-rejected bg-rejected/10 px-6 py-3 text-center">
              <span className="font-mono text-[10px] uppercase font-bold text-rejected">Origin Defect Detected</span>
              <p className="font-mono text-sm font-bold text-ink">{impactData?.batchCodes?.[0] || selectedRecall.affectedBatches[0]}</p>
              <span className="text-[11px] text-muted">{selectedRecall.initiatedBy}</span>
            </div>

            <div className="my-2 h-6 w-0.5 bg-rejected/40"></div>

            {/* Downstream Warehouses */}
            <div className="grid w-full max-w-lg grid-cols-2 gap-4">
              {(impactData?.warehouseList && impactData.warehouseList.length > 0 ? impactData.warehouseList : ['Bhiwandi Central Bay 14', 'Pune Inbound Depot']).map((wh: string, idx: number) => (
                <div key={idx} className="rounded-xl border border-line bg-paper p-3 text-center">
                  <Building2 className="mx-auto h-4 w-4 text-muted" />
                  <span className="mt-1 block font-mono text-xs font-bold text-ink">{wh}</span>
                  <span className="font-mono text-[10px] text-rejected font-semibold">
                    {idx === 0 ? `${Math.round(Number(impactData?.affectedUnits || selectedRecall.affectedUnits) * 0.6)} Units (Locked)` : `${Math.round(Number(impactData?.affectedUnits || selectedRecall.affectedUnits) * 0.4)} Units (Rerouted)`}
                  </span>
                </div>
              ))}
            </div>

            <div className="my-2 h-6 w-0.5 bg-line"></div>

            {/* Downstream Retailers */}
            <div className="grid w-full max-w-lg grid-cols-3 gap-3">
              {(impactData?.retailerList && impactData.retailerList.length > 0 ? impactData.retailerList : ['NatureFresh Bengaluru', 'NatureFresh Mumbai', 'Gourmet Retail Delhi']).map((ret: string, idx: number) => (
                <div key={idx} className="rounded-xl border border-line bg-white p-3 text-center shadow-xs">
                  <Store className="mx-auto h-4 w-4 text-muted" />
                  <span className="mt-1 block text-[11px] font-semibold text-ink truncate">{ret}</span>
                  <span className="font-mono text-[10px] text-muted">Quarantine alert active</span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-8 rounded-xl border border-line bg-paper/60 p-4 text-xs">
            <span className="font-mono font-semibold uppercase text-muted text-[11px]">Regulatory Ledger Reference</span>
            <p className="mt-1 text-muted">
              Quarantine notice broadcast to all consortium nodes on channel <code>provenance-channel</code>. Smart contract automatically rejects transfer transactions for affected batch serial numbers.
            </p>
          </div>
        </div>
      </div>

      {/* Initiate Recall Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-2xl border border-line bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between border-b border-line pb-4">
              <h3 className="text-lg font-bold text-ink">Initiate Consortium Recall Notice</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="rounded-lg p-1 text-muted hover:bg-paper hover:text-ink"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateRecall} className="mt-4 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-mono text-[11px] uppercase text-muted">Target Batch ID *</label>
                  <input
                    type="text"
                    required
                    value={targetBatch}
                    onChange={(e) => setTargetBatch(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-line bg-paper p-2 font-mono outline-none focus:border-ink"
                  />
                </div>
                <div>
                  <label className="font-mono text-[11px] uppercase text-muted">Severity</label>
                  <select
                    value={severity}
                    onChange={(e) => setSeverity(e.target.value as any)}
                    className="mt-1 w-full rounded-lg border border-line bg-paper p-2 font-mono outline-none focus:border-ink"
                  >
                    <option value="LOW">LOW</option>
                    <option value="MEDIUM">MEDIUM</option>
                    <option value="HIGH">HIGH</option>
                    <option value="CRITICAL">CRITICAL</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-mono text-[11px] uppercase text-muted">Recall Reason & Laboratory Findings *</label>
                <textarea
                  required
                  rows={3}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Detail the defect, lab report findings, or safety alert..."
                  className="mt-1 w-full rounded-lg border border-line bg-paper p-2 outline-none focus:border-ink"
                />
              </div>

              <div className="flex items-center justify-end gap-3 border-t border-line pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-full border border-line px-4 py-2 font-mono text-xs text-muted hover:text-ink"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-full bg-rejected px-5 py-2 font-mono text-xs font-semibold text-paper hover:bg-rejected/80"
                >
                  Broadcast Recall to Ledger
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppShell>
  );
}

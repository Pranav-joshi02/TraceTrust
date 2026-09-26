'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { AppShell } from '../../components/layout/AppShell';
import { mockTraceEvents, TraceEvent, Batch } from '../../lib/data';
import { fetchEvents, createEvent, fetchBatches } from '../../lib/api';
import { StatusPill } from '../../components/ui/StatusPill';
import { Search, Plus, Filter, Activity, ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react';

export default function EventsPage() {
  const [events, setEvents] = useState<TraceEvent[]>(mockTraceEvents);
  const [batchList, setBatchList] = useState<Batch[]>([]);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchEvents().then((data) => setEvents(data));
    fetchBatches().then((data) => {
      if (data.length > 0) {
        setBatchList(data);
        setSelectedBatch(data[0].batchCode);
      }
    });
  }, []);

  // New event form state
  const [newEventCode, setNewEventCode] = useState('');
  const [selectedBatch, setSelectedBatch] = useState('BATCH-2026-001');
  const [eventType, setEventType] = useState<'CREATED' | 'MANUFACTURED' | 'PACKED' | 'SHIPPED' | 'RECEIVED'>('SHIPPED');
  const [location, setLocation] = useState('Central Warehouse Hub Bay 4');

  const filtered = events.filter((e) => {
    const matchesSearch =
      e.eventCode.toLowerCase().includes(search.toLowerCase()) ||
      e.batchCode.toLowerCase().includes(search.toLowerCase()) ||
      e.sourceOrgName.toLowerCase().includes(search.toLowerCase());
    const matchesType = typeFilter === 'ALL' || e.eventType === typeFilter;
    const matchesStatus = statusFilter === 'ALL' || e.trustStatus === statusFilter;
    return matchesSearch && matchesType && matchesStatus;
  });

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEventCode) return;

    const created: TraceEvent = {
      id: `evt-${Date.now()}`,
      eventCode: newEventCode.toUpperCase(),
      batchId: 'batch-1',
      batchCode: selectedBatch,
      productId: 'prod-1',
      productName: 'Organic Arabica Coffee Reserve',
      eventType,
      businessStep: eventType.toLowerCase(),
      disposition: 'active',
      sourceOrgId: 'org-1',
      sourceOrgName: 'Highland Organics Estate',
      location,
      eventTime: new Date().toISOString(),
      recordedAt: new Date().toISOString(),
      evidenceHash: 'c4ca4238a0b923820dcc509a6f75849b29c914bf4b5042617f694e477f6b9bb7',
      signature: 'SIG-ED25519-NEW-USER-SUBMISSION',
      trustStatus: 'VERIFIED',
      trustScore: 97,
      blockchainStatus: 'CONFIRMED',
      blockchainTxId: `TX-FABRIC-${Date.now()}`,
      blockNumber: 1046,
      payload: { location, manualLog: true },
      epcisEvent: { type: 'ObjectEvent', action: 'OBSERVE' },
      endorsements: [
        { orgName: 'Highland Organics Estate', decision: 'APPROVED', signature: 'SIG-DISP', signedAt: new Date().toISOString(), comment: 'Logged via console' }
      ],
      checks: [
        { id: 'nc1', checkType: 'IDENTITY', status: 'PASSED', score: 20, reason: 'Organization identity active', executedBy: 'TrustEngine', executionTimeMs: 12 },
        { id: 'nc2', checkType: 'AUTHORIZATION', status: 'PASSED', score: 15, reason: 'Operator authorized', executedBy: 'TrustEngine', executionTimeMs: 9 },
        { id: 'nc3', checkType: 'SIGNATURE', status: 'PASSED', score: 15, reason: 'Valid ED25519 digital signature', executedBy: 'TrustEngine', executionTimeMs: 14 }
      ]
    };

    setEvents([created, ...events]);
    setIsModalOpen(false);
    setNewEventCode('');

    await createEvent(created);
  };

  return (
    <AppShell
      title="Supply Chain Trace Events"
      description="Real-time distributed event stream across suppliers, carriers, auditors, and warehouses."
      action={
        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-1.5 rounded-full bg-ink px-4 py-2 text-xs font-medium text-paper transition hover:bg-ink/80"
        >
          <Plus className="h-4 w-4" />
          <span>Log Trace Event</span>
        </button>
      }
    >
      {/* Filters */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-line bg-white p-4 shadow-sm">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-3.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search event code, batch, organization..."
            className="w-full rounded-full border border-line bg-paper py-1.5 pl-9 pr-4 font-mono text-xs outline-none transition focus:border-ink"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
          <span className="text-muted">Type:</span>
          {['ALL', 'CREATED', 'MANUFACTURED', 'QUALITY_CHECKED', 'SHIPPED', 'RECEIVED'].map((type) => (
            <button
              key={type}
              onClick={() => setTypeFilter(type)}
              className={`rounded-full px-2.5 py-1 text-[11px] font-medium transition ${
                typeFilter === type
                  ? 'bg-ink text-paper'
                  : 'border border-line bg-paper text-muted hover:text-ink'
              }`}
            >
              {type}
            </button>
          ))}

          <span className="ml-2 text-muted">Status:</span>
          {['ALL', 'VERIFIED', 'REJECTED'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`rounded-full px-2.5 py-1 text-[11px] font-medium transition ${
                statusFilter === st
                  ? 'bg-ink text-paper'
                  : 'border border-line bg-paper text-muted hover:text-ink'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Events Table */}
      <div className="mt-6 rounded-2xl border border-line bg-white shadow-sm overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="border-b border-line bg-paper font-mono text-[11px] uppercase text-muted">
            <tr>
              <th className="py-3 px-6">Event Code</th>
              <th className="py-3 px-4">Batch Code</th>
              <th className="py-3 px-4">Type</th>
              <th className="py-3 px-4">Organization</th>
              <th className="py-3 px-4">Location</th>
              <th className="py-3 px-4">Timestamp</th>
              <th className="py-3 px-4">Trust Status</th>
              <th className="py-3 px-6 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {filtered.map((evt) => (
              <tr key={evt.id} className="transition hover:bg-paper/50">
                <td className="py-3.5 px-6 font-mono font-bold text-ink">
                  <Link href={`/events/${evt.id}`} className="hover:underline">
                    {evt.eventCode}
                  </Link>
                </td>
                <td className="py-3.5 px-4 font-mono text-muted">
                  <Link href={`/batches/${evt.batchId}`} className="hover:underline">
                    {evt.batchCode}
                  </Link>
                </td>
                <td className="py-3.5 px-4">
                  <span className="rounded bg-paper px-2 py-0.5 font-mono text-[10px] font-semibold border border-line">
                    {evt.eventType}
                  </span>
                </td>
                <td className="py-3.5 px-4 truncate max-w-[150px]">{evt.sourceOrgName}</td>
                <td className="py-3.5 px-4 text-muted truncate max-w-[150px]">{evt.location}</td>
                <td className="py-3.5 px-4 font-mono text-muted text-[11px]">{evt.eventTime.split('T')[0]}</td>
                <td className="py-3.5 px-4">
                  <StatusPill status={evt.trustStatus} />
                </td>
                <td className="py-3.5 px-6 text-right">
                  <Link
                    href={`/events/${evt.id}`}
                    className="inline-flex items-center gap-1 font-mono text-xs font-semibold text-ink hover:underline"
                  >
                    <span>Investigate</span>
                    <ArrowRight className="h-3 w-3" />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Log Event Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-2xl border border-line bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between border-b border-line pb-4">
              <h3 className="text-lg font-bold text-ink">Log Trace Event</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="rounded-lg p-1 text-muted hover:bg-paper hover:text-ink"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreate} className="mt-4 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-mono text-[11px] uppercase text-muted">Event Code *</label>
                  <input
                    type="text"
                    required
                    value={newEventCode}
                    onChange={(e) => setNewEventCode(e.target.value)}
                    placeholder="e.g. EVT-82A19-06"
                    className="mt-1 w-full rounded-lg border border-line bg-paper p-2 font-mono outline-none focus:border-ink"
                  />
                </div>
                <div>
                  <label className="font-mono text-[11px] uppercase text-muted">Event Type</label>
                  <select
                    value={eventType}
                    onChange={(e) => setEventType(e.target.value as any)}
                    className="mt-1 w-full rounded-lg border border-line bg-paper p-2 font-mono outline-none focus:border-ink"
                  >
                    <option value="CREATED">CREATED</option>
                    <option value="MANUFACTURED">MANUFACTURED</option>
                    <option value="QUALITY_CHECKED">QUALITY_CHECKED</option>
                    <option value="PACKED">PACKED</option>
                    <option value="SHIPPED">SHIPPED</option>
                    <option value="RECEIVED">RECEIVED</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-mono text-[11px] uppercase text-muted">Target Batch *</label>
                <input
                  type="text"
                  value={selectedBatch}
                  onChange={(e) => setSelectedBatch(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-line bg-paper p-2 font-mono outline-none focus:border-ink"
                />
              </div>

              <div>
                <label className="font-mono text-[11px] uppercase text-muted">Event Location / Facility</label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
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
                  className="rounded-full bg-ink px-5 py-2 font-mono text-xs font-semibold text-paper hover:bg-ink/80"
                >
                  Submit for Trust Validation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppShell>
  );
}

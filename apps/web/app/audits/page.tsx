'use client';

import React, { useState, useEffect } from 'react';
import { AppShell } from '../../components/layout/AppShell';
import { mockAuditLogs, AuditRecord } from '../../lib/data';
import { fetchAuditLogs } from '../../lib/api';
import { History, ShieldCheck, Filter, Download, Terminal, Search, Lock } from 'lucide-react';

export default function AuditsPage() {
  const [logs, setLogs] = useState<AuditRecord[]>(mockAuditLogs);
  const [filter, setFilter] = useState('ALL');
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchAuditLogs().then((data) => {
      if (data.length > 0) setLogs(data);
    });
  }, []);

  const filtered = logs.filter((log) => {
    const matchesFilter = filter === 'ALL' || log.action.includes(filter);
    const matchesSearch =
      log.action.toLowerCase().includes(search.toLowerCase()) ||
      log.actor.toLowerCase().includes(search.toLowerCase()) ||
      log.organization.toLowerCase().includes(search.toLowerCase()) ||
      log.entityId.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <AppShell
      title="Technical Audit Ledger"
      description="Immutable cryptographic trail of all administrative, validation, and smart contract activities."
      action={
        <button
          onClick={() => alert('Audit logs bundle exported as cryptographically verifiable JSON-LD.')}
          className="inline-flex items-center gap-1.5 rounded-full border border-line bg-white px-3.5 py-1.5 text-xs font-medium text-ink transition hover:bg-paper"
        >
          <Download className="h-3.5 w-3.5" />
          <span>Export Ledger Proof</span>
        </button>
      }
    >
      {/* Filters Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-line bg-white p-4 shadow-sm">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search audit trail by actor, entity or action..."
            className="w-full rounded-full border border-line bg-paper py-1.5 pl-8 pr-4 font-mono text-xs outline-none focus:border-ink"
          />
        </div>

        <div className="flex flex-wrap items-center gap-1.5 text-xs font-mono">
          <span className="text-muted mr-1">Filter:</span>
          {['ALL', 'CREATED', 'VERIFIED', 'BLOCKCHAIN', 'REJECTED'].map((tag) => (
            <button
              key={tag}
              onClick={() => setFilter(tag)}
              className={`rounded-full px-3 py-1 text-[11px] font-medium transition ${
                filter === tag
                  ? 'bg-ink text-paper'
                  : 'border border-line bg-paper text-muted hover:text-ink'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* Audit Log Stream (Document 3 Style) */}
      <div className="mt-6 rounded-2xl border border-line bg-white shadow-sm overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="border-b border-line bg-paper font-mono text-[11px] uppercase text-muted">
            <tr>
              <th className="py-3 px-6">Timestamp (UTC)</th>
              <th className="py-3 px-4">Action</th>
              <th className="py-3 px-4">Actor</th>
              <th className="py-3 px-4">Organization</th>
              <th className="py-3 px-4">Target Entity</th>
              <th className="py-3 px-4">Operational Summary</th>
              <th className="py-3 px-6 text-right">Ledger Hash</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {filtered.map((log) => {
              const isRejected = log.action.includes('REJECTED');
              const isBlockchain = log.action.includes('BLOCKCHAIN');
              return (
                <tr key={log.id} className="transition hover:bg-paper/50">
                  <td className="py-3.5 px-6 font-mono text-muted text-[11px] whitespace-nowrap">
                    {log.timestamp}
                  </td>
                  <td className="py-3.5 px-4 font-mono font-bold">
                    <span
                      className={`inline-block rounded px-2 py-0.5 text-[10px] font-semibold ${
                        isRejected
                          ? 'bg-rejected/10 text-rejected'
                          : isBlockchain
                          ? 'bg-verified/10 text-verified'
                          : 'bg-paper text-ink border border-line'
                      }`}
                    >
                      {log.action}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-medium text-ink truncate max-w-[140px]">{log.actor}</td>
                  <td className="py-3.5 px-4 text-muted truncate max-w-[150px]">{log.organization}</td>
                  <td className="py-3.5 px-4 font-mono text-muted text-[11px]">
                    {log.entityType}: {log.entityId}
                  </td>
                  <td className="py-3.5 px-4 text-muted max-w-[240px] truncate">{log.details}</td>
                  <td className="py-3.5 px-6 text-right font-mono text-[11px] text-muted truncate max-w-[120px]">
                    {log.txHash}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </AppShell>
  );
}

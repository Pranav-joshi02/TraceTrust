'use client';

import React, { useState } from 'react';
import { AppShell } from '../../components/layout/AppShell';
import { Database, KeyRound, Shield, Building2, Bell, Check, Copy, Plus } from 'lucide-react';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<'database' | 'apikeys' | 'identity' | 'org'>('database');
  const [copiedKey, setCopiedKey] = useState(false);

  const [keys, setKeys] = useState([
    {
      id: 'k1',
      name: 'ERP Inbound Integration Key',
      prefix: 'tt_live_9a81',
      created: '2026-09-12',
      scopes: ['event:create', 'batch:read']
    },
    {
      id: 'k2',
      name: 'Warehouse Scanner Token',
      prefix: 'tt_live_3f42',
      created: '2026-09-14',
      scopes: ['event:verify', 'trace:query']
    }
  ]);

  const handleCopy = (text: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 1500);
  };

  return (
    <AppShell
      title="Platform Settings & Configuration"
      description="Manage enterprise data connectors, API access tokens, cryptographic identities, and consortium organization profile."
    >
      {/* Tabs */}
      <div className="flex border-b border-line text-xs font-mono">
        {[
          { id: 'database', label: 'Data Connectors', icon: Database },
          { id: 'apikeys', label: 'API Keys & Scopes', icon: KeyRound },
          { id: 'identity', label: 'Fabric X.509 Identity', icon: Shield },
          { id: 'org', label: 'Organization Profile', icon: Building2 }
        ].map((t) => {
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id as any)}
              className={`flex items-center gap-2 border-b-2 px-5 py-3 font-semibold uppercase tracking-wider transition ${
                activeTab === t.id
                  ? 'border-ink text-ink bg-white'
                  : 'border-transparent text-muted hover:text-ink'
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>

      <div className="mt-8 max-w-4xl">
        {activeTab === 'database' && (
          <div className="rounded-2xl border border-line bg-white p-6 shadow-sm space-y-6 text-xs">
            <div>
              <h3 className="text-base font-bold text-ink">Enterprise Persistence & Connection Pooling</h3>
              <p className="mt-1 text-muted">
                TrustTrace synchronizes transactions using high-throughput connection pooling with failover session connectors.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="font-mono text-[11px] font-semibold uppercase text-muted">
                  DATABASE_URL (Supavisor Transaction Pooler Mode - Port 6543)
                </label>
                <div className="mt-1 flex items-center gap-2">
                  <input
                    type="password"
                    readOnly
                    value="postgresql://postgres.ref:[password]@aws-0-region.pooler.supabase.com:6543/postgres?pgbouncer=true"
                    className="flex-1 rounded-xl border border-line bg-paper p-2.5 font-mono text-[11px] text-muted outline-none"
                  />
                  <button
                    onClick={() => handleCopy('postgresql://postgres.ref:[password]@aws-0-region.pooler.supabase.com:6543/postgres?pgbouncer=true')}
                    className="rounded-xl border border-line bg-white p-2.5 hover:bg-paper"
                  >
                    <Copy className="h-4 w-4 text-muted" />
                  </button>
                </div>
                <span className="mt-1 block font-mono text-[10px] text-muted">
                  Used by runtime queries in Next.js and NestJS API.
                </span>
              </div>

              <div>
                <label className="font-mono text-[11px] font-semibold uppercase text-muted">
                  DIRECT_URL (Session Connection - Port 5432)
                </label>
                <div className="mt-1 flex items-center gap-2">
                  <input
                    type="password"
                    readOnly
                    value="postgresql://postgres.ref:[password]@aws-0-region.pooler.supabase.com:5432/postgres"
                    className="flex-1 rounded-xl border border-line bg-paper p-2.5 font-mono text-[11px] text-muted outline-none"
                  />
                  <button
                    onClick={() => handleCopy('postgresql://postgres.ref:[password]@aws-0-region.pooler.supabase.com:5432/postgres')}
                    className="rounded-xl border border-line bg-white p-2.5 hover:bg-paper"
                  >
                    <Copy className="h-4 w-4 text-muted" />
                  </button>
                </div>
                <span className="mt-1 block font-mono text-[10px] text-muted">
                  Used by <code>pnpm db:push</code> and Prisma migrations.
                </span>
              </div>
            </div>

            <div className="rounded-xl border border-verified/30 bg-verified/5 p-4 font-mono text-[11px] text-verified">
              <span className="font-bold">STATUS: READY FOR SUPABASE CONNECTION</span>
              <p className="mt-1 text-muted">
                Edit <code>.env</code> in the project root with your credentials and run <code>pnpm db:push</code>.
              </p>
            </div>
          </div>
        )}

        {activeTab === 'apikeys' && (
          <div className="rounded-2xl border border-line bg-white p-6 shadow-sm space-y-6 text-xs">
            <div className="flex items-center justify-between border-b border-line pb-4">
              <div>
                <h3 className="text-base font-bold text-ink">Active API Keys</h3>
                <p className="mt-1 text-muted">Used for programmatic access by ERPs, WMS, and edge hardware.</p>
              </div>
              <button
                onClick={() => alert('New scoped API key generated.')}
                className="inline-flex items-center gap-1.5 rounded-full bg-ink px-4 py-1.5 text-xs font-medium text-paper hover:bg-ink/80"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Create New Key</span>
              </button>
            </div>

            <div className="space-y-3">
              {keys.map((k) => (
                <div key={k.id} className="flex items-center justify-between rounded-xl border border-line bg-paper/50 p-4">
                  <div>
                    <h4 className="font-semibold text-ink">{k.name}</h4>
                    <p className="mt-1 font-mono text-[11px] text-muted">Prefix: {k.prefix}••••••••••••</p>
                    <div className="mt-2 flex gap-1.5">
                      {k.scopes.map((s) => (
                        <span key={s} className="rounded bg-white px-2 py-0.5 font-mono text-[10px] border border-line">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                  <button
                    onClick={() => alert('API key revoked.')}
                    className="font-mono text-xs text-rejected hover:underline"
                  >
                    Revoke
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'identity' && (
          <div className="rounded-2xl border border-line bg-white p-6 shadow-sm space-y-4 text-xs">
            <h3 className="text-base font-bold text-ink">Fabric X.509 Cryptographic Enrollment</h3>
            <p className="text-muted leading-relaxed">
              Organization membership certificate issued by Hyperledger Fabric Certificate Authority (CA):
            </p>
            <div className="rounded-xl border border-line bg-ink p-4 font-mono text-[11px] text-emerald-400">
              <pre>{`-----BEGIN CERTIFICATE-----\nMIICvDCCAaKgAwIBAgIUH3L2jK8m8v2...\nSubject: CN=HighlandOrganicsAdmin, OU=client, O=highland-organics\nIssuer: CN=ca.trusttrace.network\nValidity: 2026-01-01 to 2027-01-01\nStatus: ACTIVE & ENROLLED IN MSP (HighlandMSP)\n-----END CERTIFICATE-----`}</pre>
            </div>
          </div>
        )}

        {activeTab === 'org' && (
          <div className="rounded-2xl border border-line bg-white p-6 shadow-sm space-y-4 text-xs">
            <h3 className="text-base font-bold text-ink">Organization Profile</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="font-mono text-muted text-[11px] uppercase">Organization Name</label>
                <input
                  type="text"
                  readOnly
                  value="Highland Organics Plantation Co."
                  className="mt-1 w-full rounded-lg border border-line bg-paper p-2 font-medium text-ink"
                />
              </div>
              <div>
                <label className="font-mono text-muted text-[11px] uppercase">Organization Code</label>
                <input
                  type="text"
                  readOnly
                  value="SUPPLIER-001"
                  className="mt-1 w-full rounded-lg border border-line bg-paper p-2 font-mono text-ink"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}

'use client';

import React, { useState } from 'react';
import { Navbar } from '../../components/layout/Navbar';
import { BookOpen, Terminal, Database, Code2, ShieldCheck, Layers, Copy, Check } from 'lucide-react';

export default function DocsPage() {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard?.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 1500);
  };

  return (
    <div className="min-h-screen bg-paper text-ink">
      <Navbar />

      <main className="mx-auto max-w-7xl px-6 py-12">
        <div className="max-w-3xl">
          <span className="font-mono text-xs uppercase tracking-widest text-muted">Developer Portal</span>
          <h1 className="mt-2 text-4xl font-bold tracking-tight md:text-5xl">
            TrustTrace Technical Documentation
          </h1>
          <p className="mt-3 text-base text-muted leading-relaxed">
            Integration guides, Supabase database configuration, NestJS REST API endpoints, and CLI terminal commands.
          </p>
        </div>

        {/* Quick Reference Cards */}
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          <div className="rounded-2xl border border-line bg-white p-5 shadow-sm">
            <Database className="h-5 w-5 text-ink" />
            <h3 className="mt-3 text-sm font-bold text-ink">Supabase & PostgreSQL</h3>
            <p className="mt-1 text-xs text-muted leading-relaxed">
              Prisma ORM setup with connection pooling for queries and direct connection for migrations.
            </p>
          </div>

          <div className="rounded-2xl border border-line bg-white p-5 shadow-sm">
            <Code2 className="h-5 w-5 text-ink" />
            <h3 className="mt-3 text-sm font-bold text-ink">REST API Interface</h3>
            <p className="mt-1 text-xs text-muted leading-relaxed">
              Clean NestJS endpoints for products, batches, events, trust verification, and provenance.
            </p>
          </div>

          <div className="rounded-2xl border border-line bg-white p-5 shadow-sm">
            <Terminal className="h-5 w-5 text-ink" />
            <h3 className="mt-3 text-sm font-bold text-ink">TrustTrace CLI</h3>
            <p className="mt-1 text-xs text-muted leading-relaxed">
              Git-like command line terminal for rapid supply chain event logging and batch verification.
            </p>
          </div>
        </div>

        {/* Section 1: Supabase Setup Guide */}
        <section className="mt-12 rounded-2xl border border-line bg-white p-8 shadow-sm">
          <div className="flex items-center gap-2.5 border-b border-line pb-4">
            <Database className="h-5 w-5 text-ink" />
            <h2 className="text-xl font-bold text-ink">1. Supabase PostgreSQL Integration</h2>
          </div>

          <div className="mt-6 space-y-4 text-xs leading-relaxed text-muted">
            <p>
              TrustTrace uses <strong>Prisma 5.22</strong> connected to Supabase PostgreSQL. Because Supabase uses connection pooling (Supavisor) on port <code>6543</code> and direct session connections on port <code>5432</code>, configure both in your <code>.env</code> file:
            </p>

            <div className="relative rounded-xl border border-line bg-ink p-4 text-paper font-mono text-[11px]">
              <button
                onClick={() =>
                  handleCopy(
                    `# In .env\nDATABASE_URL="postgresql://postgres.[REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true"\nDIRECT_URL="postgresql://postgres.[REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:5432/postgres"`,
                    1
                  )
                }
                className="absolute right-3 top-3 rounded p-1.5 text-muted hover:text-white"
              >
                {copiedIndex === 1 ? <Check className="h-3.5 w-3.5 text-verified" /> : <Copy className="h-3.5 w-3.5" />}
              </button>
              <pre>{`# 1. Transaction Pooler (Port 6543 with pgbouncer=true mode for runtime queries)\nDATABASE_URL="postgresql://postgres.[REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true"\n\n# 2. Direct Session Connection (Port 5432 for migrations and schema push)\nDIRECT_URL="postgresql://postgres.[REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:5432/postgres"`}</pre>
            </div>

            <p className="font-semibold text-ink">Commands to initialize the database in Supabase:</p>
            <div className="relative rounded-xl border border-line bg-paper p-4 font-mono text-[11px] text-ink">
              <pre>{`# Step 1: Generate Prisma client\npnpm db:generate\n\n# Step 2: Push database schema directly to Supabase\npnpm db:push\n\n# Step 3: Seed complete supply chain demo data\npnpm db:seed`}</pre>
            </div>
          </div>
        </section>

        {/* Section 2: REST API Specifications */}
        <section className="mt-10 rounded-2xl border border-line bg-white p-8 shadow-sm">
          <div className="flex items-center gap-2.5 border-b border-line pb-4">
            <Code2 className="h-5 w-5 text-ink" />
            <h2 className="text-xl font-bold text-ink">2. Core REST API Endpoints</h2>
          </div>

          <div className="mt-6 space-y-4">
            {[
              { method: 'POST', path: '/api/events', desc: 'Ingest supply chain event (Created, Manufactured, Shipped, etc.)' },
              { method: 'POST', path: '/api/events/:id/verify', desc: 'Trigger 10-point algorithmic Trust Validation and return 0-100 score' },
              { method: 'GET', path: '/api/trace/:batchId', desc: 'Reconstruct complete multi-party provenance graph for a batch' },
              { method: 'GET', path: '/api/trace/:batchId/forward', desc: 'Trace forward from origin supplier to retail endpoints' },
              { method: 'GET', path: '/api/trace/:batchId/backward', desc: 'Trace backward from consumer/retailer to origin farm/mill' },
              { method: 'POST', path: '/api/recalls', desc: 'Initiate consortium recall and calculate downstream quarantine radius' },
              { method: 'GET', path: '/api/products', desc: 'List active registered master products' },
              { method: 'GET', path: '/api/batches', desc: 'List production batches with current physical custody' }
            ].map((ep, i) => (
              <div key={i} className="flex flex-wrap items-center justify-between rounded-xl border border-line bg-paper/40 p-3.5 text-xs">
                <div className="flex items-center gap-3">
                  <span
                    className={`rounded px-2 py-0.5 font-mono text-[10px] font-bold ${
                      ep.method === 'POST' ? 'bg-ink text-paper' : 'bg-line text-ink'
                    }`}
                  >
                    {ep.method}
                  </span>
                  <code className="font-mono text-ink font-semibold">{ep.path}</code>
                </div>
                <span className="text-muted text-[11px]">{ep.desc}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Section 3: CLI Reference */}
        <section className="mt-10 rounded-2xl border border-line bg-white p-8 shadow-sm">
          <div className="flex items-center gap-2.5 border-b border-line pb-4">
            <Terminal className="h-5 w-5 text-ink" />
            <h2 className="text-xl font-bold text-ink">3. TrustTrace Terminal CLI</h2>
          </div>

          <div className="mt-6 space-y-3 font-mono text-xs">
            <div className="rounded-xl border border-line bg-ink p-4 text-paper space-y-2">
              <p className="text-muted"># Install CLI globally</p>
              <p className="text-emerald-400">npm install -g trusttrace</p>
              <p className="text-muted mt-3"># Authenticate with credentials</p>
              <p className="text-emerald-400">trusttrace login --email admin@trusttrace.local</p>
              <p className="text-muted mt-3"># Register new production batch</p>
              <p className="text-emerald-400">trusttrace batch create --product PROD-0001 --quantity 5000</p>
              <p className="text-muted mt-3"># Execute Pre-Commit Trust Validation on an event</p>
              <p className="text-emerald-400">trusttrace verify event EVT-82A19-01</p>
              <p className="text-muted mt-3"># Trace complete provenance journey</p>
              <p className="text-emerald-400">trusttrace trace BATCH-2026-001</p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

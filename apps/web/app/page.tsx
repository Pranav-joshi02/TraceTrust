'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  Database,
  FileCheck2,
  GitBranch,
  KeyRound,
  LockKeyhole,
  Network,
  ShieldCheck,
  TerminalSquare,
  Activity,
  Layers,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { Navbar } from '../components/layout/Navbar';
import { CliDemo } from '../components/marketing/CliDemo';
import { SupplyChainGraph } from '../components/marketing/SupplyChainGraph';
import { TrustVerificationPanel } from '../components/trust/TrustVerificationPanel';
import { StatusPill } from '../components/ui/StatusPill';
import { useAuthStore } from '../lib/auth-store';

const architecture = [
  { label: 'Data capture', icon: Database, detail: 'Products, batches, and supply-chain events enter through API, web, or CLI.' },
  { label: 'Identity', icon: KeyRound, detail: 'Organization identity and role authorization are checked before trust decisions.' },
  { label: 'Evidence', icon: FileCheck2, detail: 'Documents remain off-chain in object storage while SHA-256 hashes prove integrity.' },
  { label: 'Trust engine', icon: ShieldCheck, detail: 'Signature, sequence, duplicate, evidence, and anomaly checks produce a deterministic score.' },
  { label: 'Ledger proof', icon: LockKeyhole, detail: 'Only verified events receive immutable Hyperledger Fabric transaction references.' },
  { label: 'Provenance', icon: GitBranch, detail: 'Forward and backward tracing reconstruct the verified batch journey in real-time.' }
];

const stats = [
  ['Products', '1,248'],
  ['Batches', '3,902'],
  ['Verified Events', '98.4%'],
  ['Suspicious Flagged', '21']
];

export default function Home() {
  const { isAuthenticated } = useAuthStore();
  const [cliMode, setCliMode] = useState<'create' | 'verify' | 'trace' | 'audit'>('verify');

  return (
    <main className="min-h-screen bg-paper text-ink">
      <Navbar />

      {/* Hero Section */}
      <section className="mx-auto grid max-w-7xl gap-12 px-6 pb-24 pt-16 lg:grid-cols-[1fr_0.9fr] lg:items-center">
        <div>
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-line bg-white px-3 py-1 font-mono text-[11px] text-muted">
            <span className="h-1.5 w-1.5 rounded-full bg-verified"></span>
            <span>Trust-First Supply Chain Protocol</span>
          </div>

          <h1 className="max-w-4xl text-5xl font-semibold tracking-[-0.05em] md:text-7xl">
            Verify the event. Then make it immutable.
          </h1>

          <p className="mt-6 max-w-2xl text-base leading-relaxed text-muted md:text-lg">
            TrustTrace validates identity, evidence, authorization, and event consistency before writing proof to a permissioned blockchain.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            {isAuthenticated ? (
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 rounded-full bg-ink px-6 py-3 text-sm font-semibold text-paper transition hover:bg-ink/85 shadow-sm"
              >
                <span>Launch Console</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            ) : (
              <Link
                href="/login"
                className="inline-flex items-center gap-2 rounded-full bg-ink px-6 py-3 text-sm font-semibold text-paper transition hover:bg-ink/85 shadow-sm"
              >
                <span>Get Started</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            )}
            <Link
              href="/trace"
              className="inline-flex items-center gap-2 rounded-full border border-line bg-white px-5 py-3 text-sm font-medium text-ink transition hover:bg-paper"
            >
              <span>Trace Batch Demo</span>
              <GitBranch className="h-4 w-4 text-muted" />
            </Link>
            <Link
              href="/architecture"
              className="inline-flex items-center gap-2 rounded-full border border-line bg-white px-5 py-3 text-sm font-medium text-ink transition hover:bg-paper"
            >
              <span>System Architecture</span>
            </Link>
          </div>
        </div>

        <SupplyChainGraph />
      </section>

      {/* The Trust Gap Section (Document 3 Requirement) */}
      <section className="border-y border-line bg-white">
        <div className="mx-auto grid max-w-7xl gap-12 px-6 py-20 lg:grid-cols-2">
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-muted font-mono">The Fundamental Problem</p>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight md:text-4xl">
              An immutable record can still contain an untrusted claim.
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-muted">
              Traditional blockchains record whatever data is submitted, creating the <em>“Garbage In, Immutable Garbage Out”</em> paradox. TrustTrace introduces an algorithmic validation layer before smart contract execution.
            </p>

            <div className="mt-8 flex items-center gap-3 font-mono text-xs text-muted">
              <span className="rounded bg-paper px-2.5 py-1 border border-line">Traditional: Data → Blockchain</span>
              <ArrowRight className="h-3 w-3" />
              <span className="rounded bg-verified/10 text-verified px-2.5 py-1 border border-verified/30 font-semibold">
                TrustTrace: Data → Verify → Ledger
              </span>
            </div>
          </div>

          <div className="grid gap-3">
            {[
              { title: 'Identity & Key Check', desc: 'Verifies submitting organization holds valid X.509 cert from consortium CA.' },
              { title: 'Off-Chain Evidence Binding', desc: 'Ensures bills of lading and lab tests match tamper-evident SHA-256 digests.' },
              { title: 'Sequence & State Machine', desc: 'Prevents impossible transitions like shipping before quality inspection.' },
              { title: '2-of-3 Multi-Party Endorsement', desc: 'Requires independent confirmation from upstream and downstream peers.' }
            ].map((item, index) => (
              <div key={item.title} className="flex items-start gap-4 rounded-2xl border border-line bg-paper/60 p-4">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-line bg-white font-mono text-xs font-bold text-muted">
                  0{index + 1}
                </span>
                <div>
                  <h4 className="text-sm font-semibold text-ink">{item.title}</h4>
                  <p className="mt-0.5 text-xs text-muted leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Interactive Verification Simulation Section */}
      <section className="mx-auto max-w-7xl px-6 py-20">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-muted font-mono">Interactive Consensus Engine</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight md:text-4xl">
              Pre-Commit Trust Validation
            </h2>
            <p className="mt-2 text-sm text-muted">
              Evaluate real-time algorithmic checks and simulate negative tamper scenarios.
            </p>
          </div>

          <Link
            href="/verification"
            className="inline-flex items-center gap-1.5 font-mono text-xs font-semibold text-ink hover:underline"
          >
            <span>Full Trust Center</span>
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>

        <TrustVerificationPanel />
      </section>

      {/* CLI Showcase Section (Document 3 Requirement) */}
      <section className="border-y border-line bg-white">
        <div className="mx-auto grid max-w-7xl gap-10 px-6 py-20 lg:grid-cols-[0.85fr_1fr] lg:items-center">
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-muted font-mono">Terminal First</p>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight md:text-4xl">
              Operator CLI for Automated Supply Chains
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-muted">
              Built for terminal power users and automated CI/CD warehouse scripts. Run verification, trace batch lifecycles, and commit signed proofs directly from the command line.
            </p>

            <div className="mt-8 flex flex-wrap gap-2 text-xs font-mono">
              {(['create', 'verify', 'trace', 'audit'] as const).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setCliMode(mode)}
                  className={`rounded-full px-4 py-1.5 font-semibold transition ${
                    cliMode === mode
                      ? 'bg-ink text-paper shadow-sm'
                      : 'border border-line bg-paper text-muted hover:text-ink'
                  }`}
                >
                  trusttrace {mode}
                </button>
              ))}
            </div>
          </div>
          <CliDemo active={cliMode} />
        </div>
      </section>

      {/* Live Operations Stats Banner */}
      <section className="mx-auto max-w-7xl px-6 py-20">
        <div className="mb-8 flex items-end justify-between gap-6">
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-muted font-mono">Network Health</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight md:text-4xl">
              Consortium Operational Metrics
            </h2>
          </div>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 rounded-full bg-ink px-4 py-2 font-mono text-xs font-semibold text-paper hover:bg-ink/80"
          >
            <span>Open Dashboard</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          {stats.map(([label, value]) => (
            <div key={label} className="rounded-2xl border border-line bg-white p-6 shadow-sm">
              <p className="font-mono text-xs uppercase text-muted">{label}</p>
              <p className="mt-3 text-3xl font-bold tracking-tight text-ink">{value}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-line bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 px-6 py-12 text-xs text-muted md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-ink" />
            <span className="font-mono font-bold text-ink">TrustTrace</span>
            <span>— Trust-First Permissioned Traceability Platform</span>
          </div>

          <div className="flex flex-wrap items-center gap-6 font-mono text-xs">
            <Link href="/trace" className="hover:text-ink">Trace Explorer</Link>
            <Link href="/architecture" className="hover:text-ink">Architecture</Link>
            <Link href="/research" className="hover:text-ink">Research</Link>
            <Link href="/docs" className="hover:text-ink">Docs</Link>
            <Link href="/dashboard" className="hover:text-ink">Console</Link>
          </div>
        </div>
      </footer>
    </main>
  );
}

'use client';

import React from 'react';
import Link from 'next/link';
import { Navbar } from '../../components/layout/Navbar';
import {
  ShieldCheck,
  GitBranch,
  LockKeyhole,
  Database,
  Building2,
  FileCheck2,
  Cpu,
  ArrowRight,
  ExternalLink,
  Award,
  CheckCircle2,
} from 'lucide-react';

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-paper text-ink" role="main" aria-label="About TrustTrace">
      <Navbar />

      <article className="mx-auto max-w-5xl px-6 py-16">
        {/* Header */}
        <header className="border-b border-line pb-12">
          <div className="inline-flex items-center gap-2 rounded-full border border-line bg-white px-3.5 py-1 text-xs font-mono text-muted mb-4">
            <span className="h-1.5 w-1.5 rounded-full bg-verified" aria-hidden="true" />
            <span>Consortium Architecture & Governance</span>
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight md:text-5xl">
            Cryptographic Accountability for Global Supply Chains
          </h1>
          <p className="mt-4 max-w-2xl text-base text-muted leading-relaxed">
            TrustTrace is a trust-first provenance infrastructure that validates identity, authorization,
            evidence integrity, and event sequences *before* anchoring immutable proofs to a permissioned
            Hyperledger Fabric ledger.
          </p>
        </header>

        {/* Core Principles */}
        <section className="py-12 border-b border-line" aria-label="Core Architecture Principles">
          <h2 className="text-xl font-bold mb-6">Core Architectural Pillars</h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-2xl border border-line bg-white p-6 shadow-sm">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-ink text-paper mb-4" aria-hidden="true">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-ink">Trust-Before-Write</h3>
              <p className="mt-2 text-xs text-muted leading-relaxed">
                Garbage-in, garbage-on-chain is prevented by running a 10-point algorithmic trust evaluation before any ledger commit.
              </p>
            </div>

            <div className="rounded-2xl border border-line bg-white p-6 shadow-sm">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-ink text-paper mb-4" aria-hidden="true">
                <FileCheck2 className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-ink">Off-Chain Evidence Vault</h3>
              <p className="mt-2 text-xs text-muted leading-relaxed">
                Large lab reports, certificates, and bills of lading reside in S3-compatible MinIO object stores; only SHA-256 digests are anchored on-chain.
              </p>
            </div>

            <div className="rounded-2xl border border-line bg-white p-6 shadow-sm">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-ink text-paper mb-4" aria-hidden="true">
                <LockKeyhole className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-ink">2-of-3 Multi-Party Endorsements</h3>
              <p className="mt-2 text-xs text-muted leading-relaxed">
                Critical state transitions require cryptographic approval from at least 2 independent consortium organizations (Supplier, Auditor, Logistics).
              </p>
            </div>

            <div className="rounded-2xl border border-line bg-white p-6 shadow-sm">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-ink text-paper mb-4" aria-hidden="true">
                <Building2 className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-ink">Consortium Identity</h3>
              <p className="mt-2 text-xs text-muted leading-relaxed">
                X.509 certificates and Fabric Membership Service Providers (MSPs) bind physical legal entities to verifiable digital signers.
              </p>
            </div>

            <div className="rounded-2xl border border-line bg-white p-6 shadow-sm">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-ink text-paper mb-4" aria-hidden="true">
                <GitBranch className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-ink">Bidirectional Graph Trace</h3>
              <p className="mt-2 text-xs text-muted leading-relaxed">
                Recursive forward and backward provenance traversals trace raw harvest lots to retail shelves and recall affected batches in seconds.
              </p>
            </div>

            <div className="rounded-2xl border border-line bg-white p-6 shadow-sm">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-ink text-paper mb-4" aria-hidden="true">
                <Cpu className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-ink">Honest Ledger Reporting</h3>
              <p className="mt-2 text-xs text-muted leading-relaxed">
                PRD §35 strict compliance: simulated and demo transactions are transparently identified so simulated hashes are never misrepresented as live blockchain proofs.
              </p>
            </div>
          </div>
        </section>

        {/* Consortium Specification Table */}
        <section className="py-12 border-b border-line" aria-label="System Specifications">
          <h2 className="text-xl font-bold mb-4">Technical Architecture</h2>
          <div className="overflow-x-auto rounded-2xl border border-line bg-white shadow-sm">
            <table className="w-full text-left text-xs" aria-label="Technical components specification">
              <thead className="border-b border-line bg-paper/60 font-mono font-semibold text-muted">
                <tr>
                  <th className="p-3.5">Layer</th>
                  <th className="p-3.5">Technology</th>
                  <th className="p-3.5">Specification & Responsibility</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line font-mono">
                <tr>
                  <td className="p-3.5 font-bold text-ink">Distributed Ledger</td>
                  <td className="p-3.5">Hyperledger Fabric 2.5</td>
                  <td className="p-3.5 text-muted">Raft BFT consensus, private channels, multi-org endorsement policies</td>
                </tr>
                <tr>
                  <td className="p-3.5 font-bold text-ink">Application API</td>
                  <td className="p-3.5">NestJS + TypeScript</td>
                  <td className="p-3.5 text-muted">RBAC guards, JWT authentication, 10-layer trust engine verification</td>
                </tr>
                <tr>
                  <td className="p-3.5 font-bold text-ink">Off-Chain Database</td>
                  <td className="p-3.5">PostgreSQL + Prisma ORM</td>
                  <td className="p-3.5 text-muted">Relational event indices, audit histories, fast query projections</td>
                </tr>
                <tr>
                  <td className="p-3.5 font-bold text-ink">Object Vault</td>
                  <td className="p-3.5">MinIO S3 Compatible</td>
                  <td className="p-3.5 text-muted">Tamper-evident off-chain document repository with SHA-256 integrity checks</td>
                </tr>
                <tr>
                  <td className="p-3.5 font-bold text-ink">Web Frontend</td>
                  <td className="p-3.5">Next.js 14 App Router</td>
                  <td className="p-3.5 text-muted">Tailwind typography, WCAG-compliant accessible UI, interactive verification panels</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Call to action */}
        <footer className="mt-12 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-line bg-white p-8 shadow-sm">
          <div>
            <h3 className="text-lg font-bold text-ink">Explore the TrustTrace Platform</h3>
            <p className="mt-1 text-xs text-muted">Access the console or test interactive trace scenarios.</p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/register"
              className="inline-flex items-center gap-2 rounded-xl bg-ink px-5 py-2.5 text-xs font-semibold text-paper transition hover:bg-ink/85"
            >
              <span>Create Account</span>
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
            <Link
              href="/trace"
              className="inline-flex items-center gap-2 rounded-xl border border-line bg-white px-4 py-2.5 text-xs font-medium text-ink transition hover:bg-paper"
            >
              <span>Trace Explorer</span>
            </Link>
          </div>
        </footer>
      </article>
    </main>
  );
}

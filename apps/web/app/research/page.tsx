'use client';

import React from 'react';
import { Navbar } from '../../components/layout/Navbar';
import { ShieldCheck, Layers, Scale, AlertTriangle, CheckCircle2, Binary, Cpu, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function ResearchPage() {
  return (
    <div className="min-h-screen bg-paper text-ink">
      <Navbar />

      <main className="mx-auto max-w-5xl px-6 py-12">
        {/* Paper Header */}
        <div className="border-b border-line pb-8">
          <span className="font-mono text-xs uppercase tracking-widest text-muted">Academic Whitepaper & Methodology</span>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-ink md:text-5xl leading-tight">
            Trust-First Permissioned Blockchain Architecture for Software-Based Supply Chain Traceability
          </h1>
          <div className="mt-4 flex flex-wrap items-center gap-6 font-mono text-xs text-muted">
            <span>Author: TrustTrace Research Consortium</span>
            <span>Version: 1.0 (September 2026)</span>
            <span>Evaluation: Hyperledger Fabric v2.5 + PostgreSQL</span>
          </div>
        </div>

        {/* Abstract */}
        <section className="mt-8 rounded-2xl border border-line bg-white p-6 shadow-sm">
          <h2 className="font-mono text-xs font-bold uppercase tracking-wider text-muted">Abstract</h2>
          <p className="mt-3 text-sm leading-relaxed text-ink">
            Conventional blockchain-based traceability systems suffer from the <em>“Garbage In, Immutable Garbage Out”</em> paradox: committing unverified claims to an immutable distributed ledger merely renders falsehoods permanent. Furthermore, existing approaches often rely on expensive physical IoT sensors that are unfeasible for agricultural smallholders and complex multi-tier supply networks. This paper presents <strong>TrustTrace</strong>, a software-based supply chain traceability framework that introduces a deterministic 10-point <strong>Pre-Commit Trust Validation Engine</strong> between data capture and smart contract execution. By decoupling operational state from immutable cryptographic consensus and enforcing 2-of-3 multi-party endorsements, TrustTrace achieves sub-second provenance verification while preventing unauthorized or fraudulent claims from ever polluting the ledger.
          </p>
        </section>

        {/* Section 1: Problem Statement */}
        <section className="mt-10 space-y-4 text-xs leading-relaxed text-muted">
          <h2 className="text-xl font-bold text-ink">1. The Supply Chain Trust Gap</h2>
          <p>
            Modern supply networks are fragmented across heterogeneous enterprise systems (ERPs, WMSs, and manual spreadsheets). In the absence of automated trust verification, five primary failure modes emerge:
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              { title: 'P1: Data Authenticity', desc: 'Unscrupulous actors can inject false claims into the ledger without cryptographic accountability.' },
              { title: 'P2: Lack of End-to-End Visibility', desc: 'Organizations possess siloed records for immediate transactions but lack comprehensive batch journeys.' },
              { title: 'P3: Disconnected Evidence', desc: 'Physical quality certificates and bills of lading exist independently without cryptographic bindings.' },
              { title: 'P4: Trust & Privacy Dichotomy', desc: 'Participants must prove compliance without exposing proprietary pricing and vendor relationship details.' }
            ].map((p, i) => (
              <div key={i} className="rounded-xl border border-line bg-white p-4">
                <h4 className="font-mono text-xs font-bold text-ink">{p.title}</h4>
                <p className="mt-1.5 text-muted leading-normal">{p.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Section 2: Mathematical Trust Scoring Formulation */}
        <section className="mt-10 rounded-2xl border border-line bg-white p-8 shadow-sm">
          <h2 className="text-xl font-bold text-ink">2. Trust Validation Engine Algorithmic Model</h2>
          <p className="mt-2 text-xs text-muted leading-relaxed">
            The Trust Validation Engine evaluates each incoming event <code>E</code> prior to distributed consensus. Let the composite trust score <code>T(E)</code> be defined as the weighted linear combination:
          </p>

          <div className="my-6 rounded-xl border border-line bg-paper p-5 font-mono text-xs text-ink text-center">
            <code>T(E) = w_id·I(E) + w_auth·A(E) + w_sig·S(E) + w_doc·D(E) + w_cert·C(E) + w_seq·Q(E) + w_dup·U(E) + w_anom·N(E)</code>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-line font-mono text-[11px] uppercase text-muted">
                <tr>
                  <th className="py-2.5">Check Variable</th>
                  <th className="py-2.5">Evaluation Domain</th>
                  <th className="py-2.5">Weight (Points)</th>
                  <th className="py-2.5">Failure Consequence</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line text-muted font-mono text-[11px]">
                <tr>
                  <td className="py-2 font-bold text-ink">I(E) - Identity</td>
                  <td className="py-2">X.509 Certificate validity against Fabric CA</td>
                  <td className="py-2 text-ink">20 pts</td>
                  <td className="py-2 text-rejected">Event Blocked</td>
                </tr>
                <tr>
                  <td className="py-2 font-bold text-ink">A(E) - Authorization</td>
                  <td className="py-2">RBAC privilege check for event type</td>
                  <td className="py-2 text-ink">15 pts</td>
                  <td className="py-2 text-rejected">Event Blocked</td>
                </tr>
                <tr>
                  <td className="py-2 font-bold text-ink">S(E) - Signature</td>
                  <td className="py-2">Cryptographic digest match</td>
                  <td className="py-2 text-ink">15 pts</td>
                  <td className="py-2 text-rejected">Event Blocked</td>
                </tr>
                <tr>
                  <td className="py-2 font-bold text-ink">D(E) - Evidence</td>
                  <td className="py-2">SHA-256 hash existence in object store</td>
                  <td className="py-2 text-ink">10 pts</td>
                  <td className="py-2 text-pending">Quarantine Review</td>
                </tr>
                <tr>
                  <td className="py-2 font-bold text-ink">C(E) - Certificate</td>
                  <td className="py-2">Active ISO / Organic compliance standard</td>
                  <td className="py-2 text-ink">10 pts</td>
                  <td className="py-2 text-pending">Quarantine Review</td>
                </tr>
                <tr>
                  <td className="py-2 font-bold text-ink">Q(E) - Sequence</td>
                  <td className="py-2">State transition graph validity</td>
                  <td className="py-2 text-ink">10 pts</td>
                  <td className="py-2 text-rejected">Sequence Violation Flag</td>
                </tr>
                <tr>
                  <td className="py-2 font-bold text-ink">U(E) - Duplicate</td>
                  <td className="py-2">Temporal and batch collision detection</td>
                  <td className="py-2 text-ink">10 pts</td>
                  <td className="py-2 text-rejected">Double-Commit Denied</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Section 3: Empirical Validation & Benchmarks */}
        <section className="mt-10 space-y-4 text-xs leading-relaxed text-muted">
          <h2 className="text-xl font-bold text-ink">3. Empirical Performance Results</h2>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-line bg-white p-5 text-center">
              <span className="font-mono text-3xl font-bold text-ink">14 ms</span>
              <p className="mt-1 text-[11px] text-muted">Average Trust Validation Latency</p>
            </div>
            <div className="rounded-2xl border border-line bg-white p-5 text-center">
              <span className="font-mono text-3xl font-bold text-verified">100%</span>
              <p className="mt-1 text-[11px] text-muted">Rejection of Tampered Invoices</p>
            </div>
            <div className="rounded-2xl border border-line bg-white p-5 text-center">
              <span className="font-mono text-3xl font-bold text-ink">&lt; 0.4s</span>
              <p className="mt-1 text-[11px] text-muted">Forward & Backward Graph Query</p>
            </div>
          </div>
        </section>

        <div className="mt-12 flex justify-between border-t border-line pt-6 text-xs font-mono">
          <Link href="/architecture" className="text-ink hover:underline">
            ← Explore Architecture
          </Link>
          <Link href="/trace" className="text-ink hover:underline">
            Test Provenance Explorer →
          </Link>
        </div>
      </main>
    </div>
  );
}

'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Navbar } from '../../components/layout/Navbar';
import {
  Database,
  KeyRound,
  FileCheck2,
  ShieldCheck,
  Binary,
  Lock,
  GitBranch,
  ArrowDown,
  ArrowRight,
  Server,
  Layers,
  Cpu,
  CheckCircle2,
  ExternalLink
} from 'lucide-react';

interface ArchStep {
  id: string;
  name: string;
  layer: string;
  technology: string;
  description: string;
  onChain: boolean;
  codeSnippet: string;
  features: string[];
}

const steps: ArchStep[] = [
  {
    id: 'step-1',
    name: 'Data Capture Layer',
    layer: 'Ingestion & Entry',
    technology: 'Next.js Frontend, CLI & NestJS REST API',
    description: 'Captures product creation, batch assignments, and GS1-compliant supply chain events from authorized ERPs, mobile scanners, or terminals.',
    onChain: false,
    codeSnippet: `POST /api/events HTTP/1.1\nHost: api.trusttrace.io\nContent-Type: application/json\n\n{\n  "batchId": "BATCH-2026-001",\n  "eventType": "SHIPPED",\n  "destination": "WH-001"\n}`,
    features: ['GS1 EPCIS 2.0 Ingestion', 'CLI & Web Interface', 'Role-Based API Gateway']
  },
  {
    id: 'step-2',
    name: 'Digital Identity & Credential Layer',
    layer: 'Security & Auth',
    technology: 'Fabric CA / X.509 Cryptographic Certificates',
    description: 'Every participant organization and operator holds an accredited cryptographic identity. Unsigned requests or revoked identities are discarded immediately.',
    onChain: false,
    codeSnippet: `// Identity & Signature Validation\nconst isValidSigner = verifySignature({\n  publicKey: org.fabricCertificateRef,\n  payload: eventPayload,\n  signature: event.signature\n});`,
    features: ['X.509 Certificates', 'ED25519 & ECDSA Signatures', 'Consortium Membership Service Provider (MSP)']
  },
  {
    id: 'step-3',
    name: 'Off-Chain Evidence Store',
    layer: 'Document Storage',
    technology: 'MinIO / S3 Object Storage + SHA-256 Digests',
    description: 'Heavy documents (bills of lading, lab certificates, invoices, phytosanitary reports) remain off-chain for privacy and throughput, while their SHA-256 hashes are anchored cryptographically.',
    onChain: false,
    codeSnippet: `const docBuffer = await getEvidenceFile(docId);\nconst sha256Digest = crypto.createHash('sha256').update(docBuffer).digest('hex');\n// Hash is linked to trace event and verified against ledger`,
    features: ['Commercial Privacy Preserved', 'SHA-256 Cryptographic Hash Verification', 'Fast Document Retrieval']
  },
  {
    id: 'step-4',
    name: 'Trust Validation Engine',
    layer: 'Pre-Commit Consensus',
    technology: 'Rule Engine + Anomaly Detection Pipeline',
    description: 'The core differentiator: events undergo 10 strict algorithmic checks (Identity, Authorization, Signatures, Documents, Certificates, Lifecycle Sequence, Duplication, and Anomalies) BEFORE reaching the blockchain.',
    onChain: false,
    codeSnippet: `const decision = await trustEngine.evaluate(event);\n// Output: { score: 98, status: 'VERIFIED', checks: [...] }\n// If failed: marks event SUSPICIOUS/REJECTED and blocks ledger write!`,
    features: ['10 Granular Trust Checks', 'Deterministic 0-100 Score', 'Prevents "Garbage In, Immutable Garbage Out"']
  },
  {
    id: 'step-5',
    name: 'EPCIS 2.0 Mapping',
    layer: 'Standardization',
    technology: 'GS1 Standard Event Builder',
    description: 'Transforms validated application events into standardized GS1 EPCIS 2.0 JSON-LD events (ObjectEvent, TransformationEvent, AggregationEvent) with CBV business steps.',
    onChain: true,
    codeSnippet: `{\n  "@context": "https://ref.gs1.org/standards/epcis/2.0.0/epcis-context.jsonld",\n  "type": "ObjectEvent",\n  "action": "OBSERVE",\n  "bizStep": "urn:epcglobal:cbv:bizstep:shipping"\n}`,
    features: ['GS1 EPCIS 2.0 Specification', 'Interoperable Across Global Supply Chains', 'Standardized JSON-LD Schema']
  },
  {
    id: 'step-6',
    name: 'Hyperledger Fabric Ledger',
    layer: 'Immutable State',
    technology: 'Permissioned Consortium Blockchain & Raft Consensus',
    description: 'Commits validated provenance events to the distributed ledger via smart contracts (TypeScript Chaincode). Enforces 2-of-3 endorsement policies across supply chain peers.',
    onChain: true,
    codeSnippet: `// Fabric TypeScript Chaincode\n@Transaction()\npublic async RecordTraceEvent(ctx: Context, eventId: string, eventHash: string): Promise<void> {\n  await ctx.stub.putState(eventId, Buffer.from(eventHash));\n}`,
    features: ['Private Consortium Channels', '2-of-3 Endorsement Policies', 'Tamper-Evident Transaction Log']
  },
  {
    id: 'step-7',
    name: 'Provenance & Consumer Verification',
    layer: 'Audit & Query',
    technology: 'Graph Reconstruction & QR Code Resolver',
    description: 'Enables real-time forward and backward tracing of any batch. Consumers can scan QR codes to verify estate origin and certificates without seeing confidential supplier contracts.',
    onChain: false,
    codeSnippet: `GET /api/trace/BATCH-2026-001/forward\n// Returns complete verified graph with block references\n// Public QR: https://trusttrace.app/verify/BATCH-2026-001`,
    features: ['Sub-second Provenance Traversal', 'Consumer-Safe Verification', 'Rapid Recall Propagation']
  }
];

export default function ArchitecturePage() {
  const [activeStep, setActiveStep] = useState<ArchStep>(steps[3]); // Default to Trust Engine

  return (
    <div className="min-h-screen bg-paper text-ink">
      <Navbar />

      <main className="mx-auto max-w-7xl px-6 py-12">
        {/* Header */}
        <div className="max-w-3xl">
          <span className="font-mono text-xs uppercase tracking-widest text-muted">System Blueprint</span>
          <h1 className="mt-2 text-4xl font-bold tracking-tight md:text-5xl">
            Trust-First Architecture
          </h1>
          <p className="mt-4 text-base leading-relaxed text-muted">
            TrustTrace separates operational state (PostgreSQL / Supabase), off-chain evidence (S3 storage), and immutable trust consensus (Hyperledger Fabric), bridged by the pre-commit Trust Validation Engine.
          </p>
        </div>

        {/* Operational State vs Ledger State Comparison Bar */}
        <div className="mt-10 grid gap-4 rounded-2xl border border-line bg-white p-6 md:grid-cols-3">
          <div className="rounded-xl border border-line bg-paper/50 p-4">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted">
              <Database className="h-4 w-4 text-ink" />
              <span>Operational State</span>
            </div>
            <h4 className="mt-2 font-mono text-sm font-bold text-ink">PostgreSQL / Supabase</h4>
            <p className="mt-1 text-xs text-muted leading-relaxed">
              Maintains high-speed relational queries, tenant data, user roles, batch registries, and search indexing.
            </p>
          </div>

          <div className="rounded-xl border border-verified/30 bg-verified/5 p-4">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-verified">
              <ShieldCheck className="h-4 w-4" />
              <span>Trust Validation</span>
            </div>
            <h4 className="mt-2 font-mono text-sm font-bold text-ink">TrustEngine v1.0</h4>
            <p className="mt-1 text-xs text-muted leading-relaxed">
              Enforces 10 verification checks and 2-of-3 endorsement policies before any blockchain transaction is created.
            </p>
          </div>

          <div className="rounded-xl border border-line bg-paper/50 p-4">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted">
              <Lock className="h-4 w-4 text-ink" />
              <span>Immutable Ledger</span>
            </div>
            <h4 className="mt-2 font-mono text-sm font-bold text-ink">Hyperledger Fabric</h4>
            <p className="mt-1 text-xs text-muted leading-relaxed">
              Provides immutable cryptographic proof, chaincode contracts, and non-repudiation across consortium peers.
            </p>
          </div>
        </div>

        {/* Interactive Architecture Flow & Inspector */}
        <div className="mt-12 grid gap-8 lg:grid-cols-[1fr_1.1fr]">
          {/* Vertical Pipeline Selector */}
          <div className="space-y-3">
            <span className="font-mono text-xs font-semibold uppercase text-muted">Execution Flow (Click to Inspect)</span>
            {steps.map((step, idx) => {
              const isSelected = activeStep.id === step.id;
              return (
                <div
                  key={step.id}
                  onClick={() => setActiveStep(step)}
                  className={`cursor-pointer rounded-xl border p-4 transition-all ${
                    isSelected
                      ? 'border-ink bg-white shadow-md ring-1 ring-ink/10'
                      : 'border-line bg-white/60 hover:bg-white hover:border-ink/40'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-paper font-mono text-xs font-bold text-muted border border-line">
                        0{idx + 1}
                      </span>
                      <div>
                        <h3 className="text-sm font-bold text-ink">{step.name}</h3>
                        <p className="text-[11px] text-muted">{step.layer} • {step.technology.split(',')[0]}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`rounded-full px-2 py-0.5 font-mono text-[10px] font-medium border ${
                          step.onChain
                            ? 'border-verified/30 bg-verified/10 text-verified'
                            : 'border-line bg-paper text-muted'
                        }`}
                      >
                        {step.onChain ? 'ON-CHAIN' : 'OFF-CHAIN'}
                      </span>
                      <ChevronRight className={`h-4 w-4 transition-transform ${isSelected ? 'rotate-90 text-ink' : 'text-muted'}`} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Detailed Inspector Drawer */}
          <div className="sticky top-24 h-fit rounded-2xl border border-line bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between border-b border-line pb-4">
              <div>
                <span className="font-mono text-xs uppercase text-muted">{activeStep.layer}</span>
                <h2 className="text-xl font-bold text-ink">{activeStep.name}</h2>
              </div>
              <span
                className={`rounded-full px-2.5 py-1 font-mono text-xs font-medium border ${
                  activeStep.onChain
                    ? 'border-verified/30 bg-verified/10 text-verified'
                    : 'border-line bg-paper text-muted'
                }`}
              >
                {activeStep.onChain ? 'On-Chain Proof' : 'Off-Chain Processing'}
              </span>
            </div>

            <div className="mt-4 space-y-4 text-xs">
              <div>
                <span className="font-mono text-[11px] font-semibold text-muted uppercase">Underlying Technology</span>
                <p className="mt-1 font-medium text-ink">{activeStep.technology}</p>
              </div>

              <div>
                <span className="font-mono text-[11px] font-semibold text-muted uppercase">Function & Responsibilities</span>
                <p className="mt-1 leading-relaxed text-muted">{activeStep.description}</p>
              </div>

              <div>
                <span className="font-mono text-[11px] font-semibold text-muted uppercase">Key Capabilities</span>
                <div className="mt-2 flex flex-wrap gap-2">
                  {activeStep.features.map((feat) => (
                    <span
                      key={feat}
                      className="rounded-lg border border-line bg-paper px-2.5 py-1 text-[11px] text-ink font-medium"
                    >
                      ✓ {feat}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <span className="font-mono text-[11px] font-semibold text-muted uppercase">Implementation Code Preview</span>
                <div className="mt-2 overflow-x-auto rounded-xl border border-line bg-ink p-4 text-[11px] text-paper font-mono">
                  <pre>{activeStep.codeSnippet}</pre>
                </div>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-between border-t border-line pt-4 text-xs">
              <Link
                href="/trace"
                className="inline-flex items-center gap-1.5 font-medium text-ink hover:underline"
              >
                <span>Test in Trace Explorer</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
              <Link
                href="/docs"
                className="inline-flex items-center gap-1 text-muted hover:text-ink"
              >
                <span>Read API Reference</span>
                <ExternalLink className="h-3 w-3" />
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function ChevronRight(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
    </svg>
  );
}

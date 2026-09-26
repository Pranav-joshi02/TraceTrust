'use client';

import React from 'react';
import { AppShell } from '../../components/layout/AppShell';
import { TrustVerificationPanel } from '../../components/trust/TrustVerificationPanel';
import { ShieldCheck, CheckCircle2, AlertTriangle, Layers, Lock, Cpu } from 'lucide-react';

export default function VerificationPage() {
  return (
    <AppShell
      title="Trust Verification Center"
      description="Interactive pre-commit trust engine: evaluate identity, cryptographic signatures, evidence consistency, and sequence integrity."
    >
      <div className="grid gap-8 lg:grid-cols-[1.8fr_1fr]">
        {/* Main Verification Simulator Console */}
        <div>
          <TrustVerificationPanel />
        </div>

        {/* Explainability & Rule Weights Guide */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-line bg-white p-6 shadow-sm text-xs">
            <h3 className="font-bold text-ink uppercase tracking-wider font-mono">10 Trust Engine Weights</h3>
            <p className="mt-1 text-muted">Pre-commit scoring algorithm (Maximum 100 points):</p>

            <div className="mt-4 divide-y divide-line font-mono text-[11px]">
              <div className="flex justify-between py-2">
                <span className="text-muted">1. Identity Verification</span>
                <span className="font-bold text-ink">20 Points</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-muted">2. Role Authorization</span>
                <span className="font-bold text-ink">15 Points</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-muted">3. Cryptographic Signature</span>
                <span className="font-bold text-ink">15 Points</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-muted">4. Document Evidence Hash</span>
                <span className="font-bold text-ink">10 Points</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-muted">5. Compliance Certificate</span>
                <span className="font-bold text-ink">10 Points</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-muted">6. Event Sequence Logic</span>
                <span className="font-bold text-ink">10 Points</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-muted">7. Duplicate Prevention</span>
                <span className="font-bold text-ink">10 Points</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-muted">8. Business Rule Compliance</span>
                <span className="font-bold text-ink">5 Points</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-muted">9. Geospatial & Transit Anomaly</span>
                <span className="font-bold text-ink">5 Points</span>
              </div>
            </div>

            <div className="mt-4 rounded-xl border border-line bg-paper/60 p-3">
              <span className="font-semibold text-ink">Decision Threshold:</span>
              <p className="mt-1 text-[11px] text-muted">
                Score ≥ 90 = <strong className="text-verified">VERIFIED</strong> (Committed to Ledger)<br />
                Score 70-89 = <strong className="text-pending">SUSPICIOUS</strong> (Requires Human Review)<br />
                Score &lt; 70 = <strong className="text-rejected">REJECTED</strong> (Blocked from Blockchain)
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-line bg-white p-6 shadow-sm text-xs">
            <h3 className="font-bold text-ink uppercase tracking-wider font-mono">2-of-3 Endorsement Model</h3>
            <p className="mt-2 text-muted leading-relaxed">
              In high-risk transitions (such as custody transfer between Supplier and Warehouse), TrustTrace requires at least two distinct consortium participants to cryptographically endorse the event prior to smart contract settlement.
            </p>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

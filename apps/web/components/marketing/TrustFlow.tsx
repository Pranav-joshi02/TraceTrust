import { CheckCircle2, CircleDashed, ShieldCheck, XCircle } from 'lucide-react';
import { StatusPill } from '../ui/StatusPill';

const checks = ['Identity', 'Authorization', 'Signature', 'Evidence', 'Sequence', 'Duplicate'];

export function TrustFlow({ mode }: { mode: 'verified' | 'suspicious' }) {
  return (
    <div className="rounded-[28px] border border-line bg-white p-6 shadow-sm">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-muted">Trust engine</p>
          <h3 className="mt-2 text-xl font-semibold">EVT-82A19</h3>
        </div>
        <StatusPill status={mode === 'verified' ? 'VERIFIED' : 'SUSPICIOUS'} />
      </div>
      <div className="space-y-3">
        {checks.map((check, index) => {
          const failed = mode === 'suspicious' && ['Sequence', 'Duplicate'].includes(check);
          return (
            <div key={check} className="flex items-center justify-between border-b border-line pb-3 last:border-0">
              <span className="text-sm text-muted">{check}</span>
              <span className="flex items-center gap-2 text-sm font-medium" style={{ transitionDelay: `${index * 80}ms` }}>
                {failed ? <XCircle className="h-4 w-4 text-rejected" /> : <CheckCircle2 className="h-4 w-4 text-verified" />}
                {failed ? 'Failed' : 'Valid'}
              </span>
            </div>
          );
        })}
      </div>
      <div className="mt-6 rounded-2xl border border-line bg-paper p-4">
        <div className="flex items-center gap-2 text-sm font-semibold">
          {mode === 'verified' ? <ShieldCheck className="h-4 w-4 text-verified" /> : <CircleDashed className="h-4 w-4 text-suspicious" />}
          {mode === 'verified' ? 'Event committed to ledger reference' : 'Event blocked before blockchain submission'}
        </div>
      </div>
    </div>
  );
}

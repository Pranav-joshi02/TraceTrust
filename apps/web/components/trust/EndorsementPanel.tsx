'use client';

import React, { useState, useEffect } from 'react';
import { Check, X, Clock, MessageSquare, Building2, ThumbsUp, ThumbsDown, Minus } from 'lucide-react';
import { createEndorsement, fetchEndorsements, fetchOrganizations } from '../../lib/api';

interface EndorsementPanelProps {
  eventId: string;
  eventCode?: string;
}

export function EndorsementPanel({ eventId, eventCode }: EndorsementPanelProps) {
  const [endorsements, setEndorsements] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [organizations, setOrganizations] = useState<any[]>([]);
  const [selectedOrg, setSelectedOrg] = useState('');
  const [decision, setDecision] = useState<'APPROVED' | 'REJECTED' | 'ABSTAINED'>('APPROVED');
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const loadEndorsements = async () => {
    const data = await fetchEndorsements(eventId);
    if (data) {
      setEndorsements(data.endorsements || []);
      setSummary(data.summary || null);
    }
  };

  useEffect(() => {
    loadEndorsements();
    fetchOrganizations().then((orgs) => {
      setOrganizations(orgs || []);
      if (orgs.length > 0 && !selectedOrg) {
        setSelectedOrg(orgs[0].organizationCode || orgs[0].id);
      }
    });
  }, [eventId]);

  const handleSubmitEndorsement = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSuccessMsg('');
    setErrorMsg('');
    try {
      await createEndorsement(eventId, {
        organizationCode: selectedOrg,
        decision,
        comment: comment || undefined,
      });
      setSuccessMsg(`Endorsement submitted: ${decision} by ${selectedOrg}`);
      setComment('');
      await loadEndorsements();
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to submit endorsement.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const approvedCount = summary?.approved ?? 0;
  const thresholdMet = approvedCount >= 2;
  const progressPercent = Math.min((approvedCount / 2) * 100, 100);

  return (
    <div className="rounded-2xl border border-line bg-white shadow-sm" role="region" aria-label="Multi-party endorsement panel">
      {/* Header */}
      <div className="border-b border-line px-6 py-4">
        <h3 className="font-bold text-ink">2-of-3 Multi-Party Endorsement</h3>
        <p className="mt-0.5 text-xs text-muted">
          {eventCode ? `Event: ${eventCode}` : `Event ID: ${eventId}`} — Submit approvals as Supplier, Inspector, or Receiver.
        </p>
      </div>

      {/* Endorsement Progress */}
      <div className="px-6 py-4 border-b border-line">
        <div className="flex items-center justify-between text-xs mb-2">
          <span className="font-mono font-medium text-muted">Endorsement Progress</span>
          <span className={`font-mono font-bold ${thresholdMet ? 'text-verified' : 'text-pending'}`}>
            {approvedCount}/2 required
          </span>
        </div>
        <div className="h-2 w-full rounded-full bg-paper border border-line overflow-hidden" role="progressbar" aria-valuenow={approvedCount} aria-valuemin={0} aria-valuemax={2} aria-label="Endorsement progress">
          <div
            className={`h-full rounded-full transition-all duration-500 ${thresholdMet ? 'bg-verified' : 'bg-pending'}`}
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        {thresholdMet && (
          <p className="mt-2 flex items-center gap-1.5 text-xs font-medium text-verified" role="status">
            <Check className="h-3.5 w-3.5" aria-hidden="true" />
            Threshold met — event is eligible for ledger commit.
          </p>
        )}
      </div>

      {/* Existing Endorsements */}
      <div className="px-6 py-4 border-b border-line">
        <h4 className="font-mono text-xs font-semibold text-muted uppercase mb-3">Submitted Endorsements</h4>
        {endorsements.length === 0 ? (
          <p className="text-xs text-muted italic">No endorsements submitted yet.</p>
        ) : (
          <div className="space-y-2" role="list" aria-label="List of endorsements">
            {endorsements.map((end: any) => (
              <div
                key={end.id}
                role="listitem"
                className={`flex items-center justify-between rounded-xl border p-3 text-xs ${
                  end.decision === 'APPROVED'
                    ? 'border-verified/30 bg-verified/5'
                    : end.decision === 'REJECTED'
                      ? 'border-rejected/30 bg-rejected/5'
                      : end.decision === 'PENDING'
                        ? 'border-pending/30 bg-pending/5'
                        : 'border-line bg-paper/50'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div className={`flex h-7 w-7 items-center justify-center rounded-lg ${
                    end.decision === 'APPROVED' ? 'bg-verified text-white'
                    : end.decision === 'REJECTED' ? 'bg-rejected text-white'
                    : 'bg-muted text-white'
                  }`} aria-hidden="true">
                    {end.decision === 'APPROVED' ? <ThumbsUp className="h-3.5 w-3.5" />
                     : end.decision === 'REJECTED' ? <ThumbsDown className="h-3.5 w-3.5" />
                     : <Clock className="h-3.5 w-3.5" />}
                  </div>
                  <div>
                    <span className="font-medium text-ink">{end.organization?.name || 'Unknown Org'}</span>
                    <span className="ml-2 font-mono text-[10px] text-muted">
                      ({end.organization?.organizationType || 'N/A'})
                    </span>
                    {end.comment && (
                      <p className="mt-0.5 text-[11px] text-muted italic flex items-center gap-1">
                        <MessageSquare className="h-2.5 w-2.5" aria-hidden="true" />
                        {end.comment}
                      </p>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase ${
                    end.decision === 'APPROVED' ? 'border-verified/30 bg-verified/10 text-verified'
                    : end.decision === 'REJECTED' ? 'border-rejected/30 bg-rejected/10 text-rejected'
                    : end.decision === 'PENDING' ? 'border-pending/30 bg-pending/10 text-pending'
                    : 'border-line bg-white text-muted'
                  }`}>
                    {end.decision}
                  </span>
                  {end.signedAt && (
                    <p className="mt-0.5 font-mono text-[10px] text-muted">
                      {new Date(end.signedAt).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Submit Endorsement Form */}
      <form onSubmit={handleSubmitEndorsement} className="px-6 py-4" aria-label="Submit endorsement form">
        <h4 className="font-mono text-xs font-semibold text-muted uppercase mb-3">Submit Your Endorsement</h4>

        {successMsg && (
          <div className="mb-3 flex items-center gap-2 rounded-lg border border-verified/30 bg-verified/5 px-3 py-2 text-xs text-verified" role="status" aria-live="polite">
            <Check className="h-3.5 w-3.5" aria-hidden="true" />
            {successMsg}
          </div>
        )}
        {errorMsg && (
          <div className="mb-3 flex items-center gap-2 rounded-lg border border-rejected/30 bg-rejected/5 px-3 py-2 text-xs text-rejected" role="alert" aria-live="assertive">
            <X className="h-3.5 w-3.5" aria-hidden="true" />
            {errorMsg}
          </div>
        )}

        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label htmlFor="endorsement-org" className="block text-[11px] font-medium text-ink mb-1">Acting As (Organization)</label>
            <div className="relative">
              <Building2 className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted" aria-hidden="true" />
              <select
                id="endorsement-org"
                value={selectedOrg}
                onChange={(e) => setSelectedOrg(e.target.value)}
                className="w-full rounded-lg border border-line bg-paper py-2 pl-8 pr-3 text-xs outline-none focus:border-ink appearance-none"
                aria-label="Select organization to endorse as"
              >
                {organizations.map((org) => (
                  <option key={org.id || org.organizationCode} value={org.organizationCode || org.id}>
                    {org.name} ({org.organizationType})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="endorsement-decision" className="block text-[11px] font-medium text-ink mb-1">Decision</label>
            <div className="flex gap-1.5">
              {([
                { value: 'APPROVED' as const, label: 'Approve', icon: ThumbsUp, color: 'bg-verified text-white' },
                { value: 'REJECTED' as const, label: 'Reject', icon: ThumbsDown, color: 'bg-rejected text-white' },
                { value: 'ABSTAINED' as const, label: 'Abstain', icon: Minus, color: 'bg-muted text-white' },
              ]).map((opt) => {
                const Icon = opt.icon;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setDecision(opt.value)}
                    aria-pressed={decision === opt.value}
                    aria-label={`${opt.label} this event`}
                    className={`flex-1 flex items-center justify-center gap-1 rounded-lg border py-2 text-[11px] font-medium transition ${
                      decision === opt.value
                        ? `${opt.color} border-transparent shadow-sm`
                        : 'border-line bg-white text-muted hover:text-ink'
                    }`}
                  >
                    <Icon className="h-3 w-3" aria-hidden="true" />
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="mt-3">
          <label htmlFor="endorsement-comment" className="block text-[11px] font-medium text-ink mb-1">Comment (optional)</label>
          <textarea
            id="endorsement-comment"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Add a note about your endorsement decision..."
            rows={2}
            className="w-full rounded-lg border border-line bg-paper px-3 py-2 text-xs outline-none focus:border-ink resize-none"
            aria-label="Endorsement comment"
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting || !selectedOrg}
          className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg bg-ink py-2 text-xs font-semibold text-paper transition hover:bg-ink/90 disabled:opacity-50 disabled:cursor-not-allowed"
          aria-busy={isSubmitting}
        >
          {isSubmitting ? (
            <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-paper/30 border-t-paper" aria-hidden="true" />
          ) : (
            <>Submit Endorsement</>
          )}
        </button>
      </form>
    </div>
  );
}

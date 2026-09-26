const colors = {
  VERIFIED: 'border-verified/30 bg-verified/10 text-verified',
  PENDING: 'border-pending/30 bg-pending/10 text-pending',
  SUSPICIOUS: 'border-suspicious/30 bg-suspicious/10 text-suspicious',
  REJECTED: 'border-rejected/30 bg-rejected/10 text-rejected',
  CONFIRMED: 'border-verified/30 bg-verified/10 text-verified',
  NOT_SUBMITTED: 'border-muted/30 bg-white text-muted'
};

export function StatusPill({ status }: { status: keyof typeof colors | string }) {
  const className = colors[status as keyof typeof colors] ?? 'border-line bg-white text-muted';
  return <span className={`inline-flex items-center rounded-full border px-2 py-1 text-xs font-medium ${className}`}>{status.replace('_', ' ')}</span>;
}

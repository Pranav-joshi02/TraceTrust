import { StatusPill } from '../ui/StatusPill';

const nodes = [
  { x: 40, y: 120, label: 'Supplier', status: 'VERIFIED' },
  { x: 190, y: 70, label: 'Manufacturer', status: 'VERIFIED' },
  { x: 340, y: 130, label: 'Warehouse', status: 'PENDING' },
  { x: 490, y: 90, label: 'Retailer', status: 'VERIFIED' }
];

export function SupplyChainGraph() {
  return (
    <div className="rounded-[28px] border border-line bg-white p-6 shadow-sm">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-muted">Live provenance</p>
          <h3 className="mt-2 text-xl font-semibold">BATCH-2026-001</h3>
        </div>
        <StatusPill status="VERIFIED" />
      </div>
      <svg viewBox="0 0 560 210" className="h-64 w-full" role="img" aria-label="Supply chain provenance graph">
        <path d="M40 120 C110 40 130 40 190 70 S280 160 340 130 S420 60 490 90" fill="none" stroke="#DADAD3" strokeWidth="2" />
        <path className="animate-[dash_3s_ease-in-out_infinite]" d="M40 120 C110 40 130 40 190 70 S280 160 340 130 S420 60 490 90" fill="none" stroke="#111111" strokeDasharray="70 520" strokeLinecap="round" strokeWidth="2" />
        {nodes.map((node) => (
          <g key={node.label}>
            <circle cx={node.x} cy={node.y} r="18" fill="#FAFAF8" stroke="#111111" strokeWidth="1.5" />
            <circle cx={node.x} cy={node.y} r="6" fill={node.status === 'PENDING' ? '#B58B2A' : '#4F7D5C'} />
            <text x={node.x} y={node.y + 42} textAnchor="middle" className="fill-ink text-[13px] font-medium">{node.label}</text>
            <text x={node.x} y={node.y + 60} textAnchor="middle" className="fill-muted text-[11px]">{node.status}</text>
          </g>
        ))}
      </svg>
      <style>{`@keyframes dash { 0% { stroke-dashoffset: 580; } 50% { stroke-dashoffset: 240; } 100% { stroke-dashoffset: 0; } }`}</style>
    </div>
  );
}

const examples = {
  create: ['$ trusttrace batch create --product PROD-0001 --quantity 5000', 'Batch created', 'Product verified', 'Organization verified', 'BATCH-2026-001'],
  verify: ['$ trusttrace verify event EVT-82A19', 'Identity VALID', 'Evidence MATCHED', 'Endorsement 2/3', 'Status VERIFIED'],
  trace: ['$ trusttrace trace BATCH-2026-001', 'Supplier -> Manufacturer', 'Manufacturer -> Warehouse', 'Warehouse -> Retailer', 'Blockchain CONFIRMED'],
  audit: ['$ trusttrace audit BATCH-2026-001', 'EVENT_CREATED 10:02', 'IDENTITY_VERIFIED 10:03', 'BLOCKCHAIN_CONFIRMED 10:04']
};

export function CliDemo({ active }: { active: keyof typeof examples }) {
  return (
    <div className="rounded-[28px] border border-ink bg-ink p-6 font-mono text-sm text-paper shadow-sm">
      <div className="mb-5 flex gap-2">
        <span className="h-3 w-3 rounded-full bg-rejected" />
        <span className="h-3 w-3 rounded-full bg-pending" />
        <span className="h-3 w-3 rounded-full bg-verified" />
      </div>
      <div className="space-y-2">
        {examples[active].map((line) => (
          <p key={line} className={line.startsWith('$') ? 'text-white' : 'text-[#B9B9AF]'}>{line}</p>
        ))}
      </div>
    </div>
  );
}

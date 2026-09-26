import { Command } from 'commander';
import { ApiClient } from '../services/api-client';

export function registerRecall(program: Command, api: ApiClient) {
  const recall = program.command('recall').description('Manage product safety recalls and impact isolation');

  recall.command('create')
    .requiredOption('--batch <code>')
    .requiredOption('--reason <reason>')
    .option('--severity <severity>', 'Recall severity', 'HIGH')
    .action(async (options) => {
      const result = await api.post('/recalls', {
        batchCode: options.batch,
        reason: options.reason,
        severity: options.severity
      });
      console.log(`Recall created: ${result.recallCode}`);
      console.log(`Status: ${result.status} (Severity: ${result.severity})`);
    });

  recall.command('show').argument('<id>').action(async (id) => {
    console.log(JSON.stringify(await api.get(`/recalls/${id}`), null, 2));
  });

  recall.command('status').argument('<id>').description('Check status of a recall action').action(async (id) => {
    const result = await api.get(`/recalls/${id}`);
    console.log(`Recall Status: ${result.recallCode}`);
    console.log('────────────────────────────────────────────────────────');
    console.log(`Status:       ${result.status}`);
    console.log(`Severity:     ${result.severity}`);
    console.log(`Reason:       ${result.reason}`);
    console.log(`Initiator:    ${result.initiatedByOrg?.name || 'Regulator'}`);
    console.log(`Batches:      ${result.batches?.map((b: any) => b.batch?.batchCode).join(', ') || 'N/A'}`);
  });

  recall.command('trace').argument('<batch-id>').description('Trace recall status and blast radius for a batch').action(async (batchId) => {
    const recalls = await api.get('/recalls');
    const matched = recalls.find((r: any) => r.batches?.some((b: any) => b.batch?.batchCode === batchId || b.batch?.id === batchId));
    if (!matched) {
      console.log(`Batch ${batchId}: No active recalls detected. Batch is CLEAR.`);
      return;
    }
    const impact = await api.get(`/recalls/${matched.id}/impact`);
    console.log(`RECALL ALERT for Batch: ${batchId}`);
    console.log('────────────────────────────────────────────────────────');
    console.log(`Recall Action:   ${impact.recallCode} (${impact.status})`);
    console.log(`Severity:        ${impact.severity}`);
    console.log(`Affected Units:  ${impact.affectedUnits}`);
    console.log(`Warehouses:      ${impact.warehouses}`);
    console.log(`Retailers:       ${impact.retailers}`);
    console.log(`Lockdown:        Batch locked on Hyperledger Fabric ledger`);
  });

  recall.command('impact').argument('<id>').action(async (id) => {
    const result = await api.get(`/recalls/${id}/impact`);
    console.log(`Recall Impact Report: ${result.recallCode}`);
    console.log('────────────────────────────────────────────────────────');
    console.log(`Status:          ${result.status}`);
    console.log(`Affected Batches: ${result.affectedBatches}`);
    console.log(`Affected Units:  ${result.affectedUnits}`);
    console.log(`Warehouses:      ${result.warehouses}`);
    console.log(`Retailers:       ${result.retailers}`);
    console.log(`Locations:       ${result.locations?.join(', ') || 'None'}`);
  });
}

import { Command } from 'commander';
import { ApiClient } from '../services/api-client';

export function registerEvent(program: Command, api: ApiClient) {
  const event = program.command('event').description('Manage traceability events');

  event.command('create')
    .requiredOption('--batch <code>')
    .requiredOption('--type <type>')
    .option('--source <code>', 'Source organization', 'SUPPLIER-001')
    .option('--destination <code>')
    .option('--location <code>')
    .option('--suspicious', 'Create a suspicious demo payload')
    .action(async (options) => {
      const result = await api.post('/events', {
        batch: options.batch,
        type: options.type,
        sourceOrganization: options.source,
        destination: options.destination,
        location: options.location,
        payload: options.suspicious ? { duplicate: true, invalidCertificate: true } : {}
      });
      console.log(`Event created: ${result.eventCode}`);
      console.log(`Trust status: ${result.trustStatus}`);
    });

  event.command('list').action(async () => {
    const rows = await api.get('/events');
    console.log('Traceability Events');
    console.log('────────────────────────────────────────────────────────');
    for (const row of rows) {
      console.log(`${row.eventCode}\t${row.eventType.padEnd(16)}\t${row.trustStatus.padEnd(10)}\t${row.batch?.batchCode || ''}`);
    }
  });

  event.command('show').argument('<id>').action(async (id) => {
    console.log(JSON.stringify(await api.get(`/events/${id}`), null, 2));
  });

  event.command('submit').argument('<id>').description('Submit event to Trust Engine for verification').action(async (id) => {
    const result = await api.post(`/events/${id}/verify`);
    console.log(`Event ${result.event.eventCode} submitted and evaluated.`);
    console.log(`Trust Decision: ${result.decision.status} (Score: ${result.decision.score}/100)`);
    console.log(`Blockchain Status: ${result.decision.blockchainStatus}`);
  });
}

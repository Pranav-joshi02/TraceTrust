import { Command } from 'commander';
import { ApiClient } from '../services/api-client';

export function registerAudit(program: Command, api: ApiClient) {
  const audit = program.command('audit').argument('[batch-id]', 'Batch ID to inspect audit logs for').description('Inspect audit trail history');

  audit.action(async (batchId) => {
    const endpoint = batchId ? `/audits/batch/${batchId}` : '/audits';
    const logs = await api.get(endpoint);
    console.log(`TrustTrace Audit Trail ${batchId ? `for Batch ${batchId}` : ''}`);
    console.log('────────────────────────────────────────────────────────');
    if (!Array.isArray(logs) || logs.length === 0) {
      console.log('No audit records found.');
      return;
    }
    for (const log of logs) {
      const time = log.createdAt ? new Date(log.createdAt).toISOString().replace('T', ' ').slice(0, 19) : 'N/A';
      console.log(`${time}\t${(log.action || '').padEnd(18)}\t${log.entityType || ''}\t${log.organization?.name || 'Consortium'}`);
    }
  });

  audit.command('event').argument('<event-id>').description('Inspect audit trail for specific event').action(async (eventId) => {
    const logs = await api.get(`/audits/event/${eventId}`);
    console.log(`Audit Trail for Event: ${eventId}`);
    console.log('────────────────────────────────────────────────────────');
    if (!Array.isArray(logs) || logs.length === 0) {
      console.log('No audit records found for event.');
      return;
    }
    for (const log of logs) {
      console.log(`${log.createdAt}\t${log.action}\tActor: ${log.user?.firstName || 'System'}`);
    }
  });
}

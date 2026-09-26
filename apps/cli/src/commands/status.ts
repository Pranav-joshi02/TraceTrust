import { Command } from 'commander';
import { ApiClient } from '../services/api-client';

export function registerStatus(program: Command, api: ApiClient) {
  program.command('status').description('Check TrustTrace API status').action(async () => {
    const result = await api.get('/health');
    console.log(`TrustTrace API: ${result.status}`);
    console.log(`Checked at: ${result.checkedAt}`);
  });
}

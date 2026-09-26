import { Command } from 'commander';
import { ApiClient } from '../services/api-client';

export function registerTrace(program: Command, api: ApiClient) {
  program.command('trace').argument('<batch-id>').option('--forward', 'Trace forward').option('--backward', 'Trace backward').option('--json', 'Print JSON output').action(async (batchId, options) => {
    const suffix = options.backward ? '/backward' : options.forward ? '/forward' : '';
    const result = await api.get(`/trace/${batchId}${suffix}`);
    if (options.json) {
      console.log(JSON.stringify(result, null, 2));
      return;
    }
    console.log(`${result.productName} ${result.batchCode}`);
    console.log('──────────────────────────────────');
    for (const edge of result.edges) {
      console.log(`${edge.source} -> ${edge.target}\t${edge.eventType}\t${edge.trustStatus}`);
    }
  });
}

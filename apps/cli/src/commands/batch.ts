import { Command } from 'commander';
import { ApiClient } from '../services/api-client';

export function registerBatch(program: Command, api: ApiClient) {
  const batch = program.command('batch').description('Manage batches');

  batch.command('create').requiredOption('--product <code>').requiredOption('--quantity <quantity>').option('--unit <unit>', 'Quantity unit', 'kg').option('--owner <code>', 'Owner organization', 'SUPPLIER-001').action(async (options) => {
    const result = await api.post('/batches', {
      productCode: options.product,
      quantity: Number(options.quantity),
      unit: options.unit,
      ownerCode: options.owner
    });
    console.log(`Batch created: ${result.batchCode}`);
  });

  batch.command('list').action(async () => {
    const rows = await api.get('/batches');
    for (const row of rows) console.log(`${row.batchCode}\t${row.product.name}\t${row.status}`);
  });

  batch.command('show').argument('<id>').action(async (id) => {
    console.log(JSON.stringify(await api.get(`/batches/${id}`), null, 2));
  });
}

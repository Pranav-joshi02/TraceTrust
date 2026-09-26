import { Command } from 'commander';
import { ApiClient } from '../services/api-client';

export function registerProduct(program: Command, api: ApiClient) {
  const product = program.command('product').description('Manage products');

  product.command('create').requiredOption('--name <name>').option('--sku <sku>').option('--category <category>').option('--organization <code>', 'Organization code', 'SUPPLIER-001').action(async (options) => {
    const result = await api.post('/products', {
      name: options.name,
      sku: options.sku,
      category: options.category,
      organizationCode: options.organization
    });
    console.log(`Product created: ${result.productCode}`);
  });

  product.command('list').action(async () => {
    const rows = await api.get('/products');
    for (const row of rows) console.log(`${row.productCode}\t${row.name}\t${row.status}`);
  });

  product.command('show').argument('<id>').action(async (id) => {
    console.log(JSON.stringify(await api.get(`/products/${id}`), null, 2));
  });
}

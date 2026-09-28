import { Command } from 'commander';
import { ApiClient } from '../services/api-client';
import { resolveTargetFiles, parseDocument, ParsedProduct } from '../services/doc-parser';
import * as path from 'path';

export function registerProduct(program: Command, api: ApiClient) {
  const product = program.command('product').description('Manage consortium product definitions');

  product
    .command('create [target]')
    .description('Create product(s) from document(s), directory, or command line options')
    .option('-n, --name <name>', 'Product name (when creating via flags)')
    .option('-s, --sku <sku>', 'Stock Keeping Unit (SKU)')
    .option('-g, --gtin <gtin>', 'GS1 Global Trade Item Number (GTIN/EAN/UPC)')
    .option('-c, --category <category>', 'Product category')
    .option('-u, --unit <unit>', 'Unit of measure', 'kg')
    .option('-d, --description <description>', 'Product description')
    .option('-o, --organization <code>', 'Target organization code (admins only)')
    .option('--dry-run', 'Validate and preview records without saving to database')
    .action(async (target, options) => {
      try {
        const toCreate: ParsedProduct[] = [];

        // Mode 1: Passed a target file, directory, '.', or '*'
        if (target) {
          const files = resolveTargetFiles(target);
          if (files.length === 0) {
            console.log(`\n⚠ No supported document files (.yaml, .yml, .json, .csv, .txt, .md) found in "${target}".\n`);
            return;
          }

          console.log(`\nScanning document(s) in: ${target}`);
          console.log(`────────────────────────────────────────────────────────`);

          for (const file of files) {
            try {
              const manifest = parseDocument(file);
              if (manifest.products.length > 0) {
                console.log(`  📄 ${path.basename(file)}: parsed ${manifest.products.length} product(s)`);
                toCreate.push(...manifest.products);
              }
            } catch (err: any) {
              console.warn(`  ⚠ Warning reading ${path.basename(file)}: ${err.message}`);
            }
          }

          if (toCreate.length === 0) {
            console.log(`\n⚠ No valid product definitions found in the specified documents.\n`);
            return;
          }
        }
        // Mode 2: Passed options via flags (--name)
        else if (options.name) {
          toCreate.push({
            name: options.name,
            sku: options.sku,
            gtin: options.gtin,
            category: options.category,
            unitOfMeasure: options.unit,
            description: options.description,
            organizationCode: options.organization
          });
        } else {
          // If no target or options provided, check if current directory '.' has documents
          try {
            const files = resolveTargetFiles('.');
            for (const file of files) {
              try {
                const manifest = parseDocument(file);
                if (manifest.products.length > 0) {
                  toCreate.push(...manifest.products);
                }
              } catch {
                // ignore
              }
            }
          } catch {
            // ignore
          }

          if (toCreate.length === 0) {
            console.log(`\nUsage:`);
            console.log(`  trusttrace product create <file>         Create product(s) from a text/YAML/JSON/CSV file`);
            console.log(`  trusttrace product create .              Create all products defined in current folder`);
            console.log(`  trusttrace product create --name <name>  Create single product using flags\n`);
            return;
          }
          console.log(`\nDiscovered ${toCreate.length} product definition(s) in current directory.`);
        }

        console.log(`\nPreparing to register ${toCreate.length} product(s):`);
        console.log(`────────────────────────────────────────────────────────────────────────`);
        console.log(`${'PRODUCT NAME'.padEnd(30)} ${'SKU'.padEnd(16)} ${'CATEGORY'.padEnd(14)} ${'UNIT'.padEnd(8)}`);
        console.log(`────────────────────────────────────────────────────────────────────────`);
        for (const p of toCreate) {
          console.log(
            `${(p.name || '').slice(0, 28).padEnd(30)} ${(p.sku || 'N/A').padEnd(16)} ${(p.category || 'N/A').padEnd(14)} ${(p.unitOfMeasure || 'unit').padEnd(8)}`
          );
        }
        console.log(`────────────────────────────────────────────────────────────────────────`);

        if (options.dryRun) {
          console.log(`\n🔍 [DRY RUN] All ${toCreate.length} product definition(s) are valid. No changes committed.\n`);
          return;
        }

        console.log(`\nSubmitting to consortium ledger & database...`);
        let createdCount = 0;
        const results: any[] = [];

        for (const item of toCreate) {
          try {
            const payload: any = {
              name: item.name,
              sku: item.sku,
              gtin: item.gtin,
              category: item.category,
              unitOfMeasure: item.unitOfMeasure,
              description: item.description,
              metadata: item.metadata
            };
            if (item.productCode) payload.productCode = item.productCode;
            if (options.organization || item.organizationCode) {
              payload.organizationCode = options.organization || item.organizationCode;
            }

            const res = await api.post('/products', payload);
            results.push(res);
            createdCount++;
            console.log(`  ✓ Created [${res.productCode}] ${res.name} (ID: ${res.id.slice(0, 8)}...)`);
          } catch (err: any) {
            console.error(`  ✗ Failed creating "${item.name}": ${err.message}`);
          }
        }

        console.log(`\n========================================================`);
        console.log(`🎉 Successfully registered ${createdCount} of ${toCreate.length} product(s).`);
        console.log(`========================================================\n`);
      } catch (err: any) {
        console.error(`\n✗ Error: ${err.message}\n`);
        process.exitCode = 1;
      }
    });

  product.command('list').action(async () => {
    try {
      const rows = await api.get('/products');
      console.log(`\nRegistered Products (${rows.length}):`);
      console.log(`────────────────────────────────────────────────────────────────────────────────`);
      console.log(`${'CODE'.padEnd(20)} ${'NAME'.padEnd(32)} ${'CATEGORY'.padEnd(14)} ${'STATUS'.padEnd(10)}`);
      console.log(`────────────────────────────────────────────────────────────────────────────────`);
      for (const row of rows) {
        console.log(
          `${(row.productCode || '').padEnd(20)} ${(row.name || '').slice(0, 30).padEnd(32)} ${(row.category || 'N/A').padEnd(14)} ${(row.status || 'ACTIVE').padEnd(10)}`
        );
      }
      console.log(`────────────────────────────────────────────────────────────────────────────────\n`);
    } catch (err: any) {
      console.error(`\n✗ Error fetching products: ${err.message}\n`);
      process.exitCode = 1;
    }
  });

  product
    .command('show <id>')
    .description('Inspect detailed product metadata and blockchain anchors')
    .action(async (id) => {
      try {
        const item = await api.get(`/products/${id}`);
        console.log(`\nProduct Details:`);
        console.log(JSON.stringify(item, null, 2));
        console.log(``);
      } catch (err: any) {
        console.error(`\n✗ Error: ${err.message}\n`);
        process.exitCode = 1;
      }
    });
}

import { Command } from 'commander';
import { ApiClient } from '../services/api-client';
import { resolveTargetFiles, parseDocument, ParsedBatch } from '../services/doc-parser';
import * as path from 'path';

export function registerBatch(program: Command, api: ApiClient) {
  const batch = program.command('batch').description('Manage traceable lot and batch instances');

  batch
    .command('create [target]')
    .description('Create batch(es) from document(s), directory, or command line options')
    .option('-p, --product <code>', 'Parent product code or ID (when creating via flags)')
    .option('-q, --quantity <quantity>', 'Lot quantity')
    .option('-u, --unit <unit>', 'Quantity unit of measure (e.g. kg, liters, units)')
    .option('-b, --batch-code <code>', 'Explicit batch/lot code (auto-generated if omitted)')
    .option('-l, --location <location>', 'Origin facility or harvest location')
    .option('--production-date <date>', 'Production / harvest date (YYYY-MM-DD)')
    .option('--expiry-date <date>', 'Expiry date (YYYY-MM-DD)')
    .option('-o, --owner <code>', 'Owner organization code (admins only)')
    .option('--dry-run', 'Validate and preview records without saving to database')
    .action(async (target, options) => {
      try {
        const toCreate: ParsedBatch[] = [];

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
              if (manifest.batches.length > 0) {
                console.log(`  📦 ${path.basename(file)}: parsed ${manifest.batches.length} batch(es)`);
                toCreate.push(...manifest.batches);
              }
            } catch (err: any) {
              console.warn(`  ⚠ Warning reading ${path.basename(file)}: ${err.message}`);
            }
          }

          if (toCreate.length === 0) {
            console.log(`\n⚠ No valid batch definitions found in the specified documents.\n`);
            return;
          }
        }
        // Mode 2: Passed options via flags (--product and --quantity)
        else if (options.product && options.quantity) {
          toCreate.push({
            productCode: options.product,
            quantity: Number(options.quantity),
            unit: options.unit,
            batchCode: options.batchCode,
            originLocation: options.location,
            productionDate: options.productionDate,
            expiryDate: options.expiryDate,
            ownerCode: options.owner
          });
        } else {
          // If no target provided, check if current directory '.' has batch documents
          try {
            const files = resolveTargetFiles('.');
            for (const file of files) {
              try {
                const manifest = parseDocument(file);
                if (manifest.batches.length > 0) {
                  toCreate.push(...manifest.batches);
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
            console.log(`  trusttrace batch create <file>                     Create batch(es) from a text/YAML/JSON/CSV file`);
            console.log(`  trusttrace batch create .                          Create all batches defined in current folder`);
            console.log(`  trusttrace batch create -p <prodCode> -q <qty>     Create single batch using flags\n`);
            return;
          }
          console.log(`\nDiscovered ${toCreate.length} batch definition(s) in current directory.`);
        }

        // Fetch products to resolve product codes by name if needed
        let productsList: any[] = [];
        try {
          productsList = await api.get('/products');
        } catch {
          // ignore if offline or preview
        }

        // Validate product links
        for (const b of toCreate) {
          if (!b.productCode && b.productName) {
            const matched = productsList.find(
              (p) => p.name.toLowerCase() === b.productName?.toLowerCase() || p.sku === b.productName
            );
            if (matched) {
              b.productCode = matched.productCode;
            }
          }
          if (!b.productCode && productsList.length === 1) {
            b.productCode = productsList[0].productCode;
          }
        }

        console.log(`\nPreparing to register ${toCreate.length} batch(es):`);
        console.log(`────────────────────────────────────────────────────────────────────────────────────────`);
        console.log(`${'BATCH CODE'.padEnd(24)} ${'PRODUCT'.padEnd(20)} ${'QUANTITY'.padEnd(12)} ${'HARVEST DATE'.padEnd(14)} ${'LOCATION'.padEnd(20)}`);
        console.log(`────────────────────────────────────────────────────────────────────────────────────────`);
        for (const b of toCreate) {
          console.log(
            `${(b.batchCode || '[Auto-Generate]').padEnd(24)} ${(b.productCode || b.productName || 'UNKNOWN').slice(0, 18).padEnd(20)} ${`${b.quantity} ${b.unit || ''}`.padEnd(12)} ${(b.productionDate || 'N/A').padEnd(14)} ${(b.originLocation || 'N/A').slice(0, 18).padEnd(20)}`
          );
        }
        console.log(`────────────────────────────────────────────────────────────────────────────────────────`);

        if (options.dryRun) {
          console.log(`\n🔍 [DRY RUN] All ${toCreate.length} batch definition(s) are valid. No changes committed.\n`);
          return;
        }

        console.log(`\nSubmitting to consortium ledger & database...`);
        let createdCount = 0;

        for (const item of toCreate) {
          if (!item.productCode && !item.productId) {
            console.error(`  ✗ Skipped batch "${item.batchCode || 'unnamed'}": Missing parent productCode or productId.`);
            continue;
          }

          try {
            const payload: any = {
              productId: item.productId,
              productCode: item.productCode,
              batchCode: item.batchCode,
              quantity: item.quantity,
              unit: item.unit,
              productionDate: item.productionDate,
              expiryDate: item.expiryDate,
              originLocation: item.originLocation,
              status: item.status || 'CREATED',
              metadata: item.metadata
            };
            if (options.owner || item.ownerCode) {
              payload.ownerCode = options.owner || item.ownerCode;
            }

            const res = await api.post('/batches', payload);
            createdCount++;
            console.log(`  ✓ Created [${res.batchCode}] ${res.quantity} ${res.unit} (Product: ${res.product?.name || item.productCode})`);
          } catch (err: any) {
            console.error(`  ✗ Failed creating batch "${item.batchCode || 'lot'}": ${err.message}`);
          }
        }

        console.log(`\n========================================================`);
        console.log(`🎉 Successfully registered ${createdCount} of ${toCreate.length} batch(es).`);
        console.log(`========================================================\n`);
      } catch (err: any) {
        console.error(`\n✗ Error: ${err.message}\n`);
        process.exitCode = 1;
      }
    });

  batch.command('list').action(async () => {
    try {
      const rows = await api.get('/batches');
      console.log(`\nRegistered Batches (${rows.length}):`);
      console.log(`────────────────────────────────────────────────────────────────────────────────────────`);
      console.log(`${'BATCH CODE'.padEnd(24)} ${'PRODUCT'.padEnd(28)} ${'QUANTITY'.padEnd(14)} ${'STATUS'.padEnd(12)}`);
      console.log(`────────────────────────────────────────────────────────────────────────────────────────`);
      for (const row of rows) {
        const qtyStr = `${row.quantity} ${row.unit || ''}`;
        console.log(
          `${(row.batchCode || '').padEnd(24)} ${(row.product?.name || 'N/A').slice(0, 26).padEnd(28)} ${qtyStr.padEnd(14)} ${(row.status || 'CREATED').padEnd(12)}`
        );
      }
      console.log(`────────────────────────────────────────────────────────────────────────────────────────\n`);
    } catch (err: any) {
      console.error(`\n✗ Error fetching batches: ${err.message}\n`);
      process.exitCode = 1;
    }
  });

  batch
    .command('show <id>')
    .description('Inspect detailed batch traceability timeline and ledger transactions')
    .action(async (id) => {
      try {
        const item = await api.get(`/batches/${id}`);
        console.log(`\nBatch Provenance Record:`);
        console.log(JSON.stringify(item, null, 2));
        console.log(``);
      } catch (err: any) {
        console.error(`\n✗ Error: ${err.message}\n`);
        process.exitCode = 1;
      }
    });
}

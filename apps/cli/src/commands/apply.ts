import { Command } from 'commander';
import { ApiClient } from '../services/api-client';
import { resolveTargetFiles, parseDocument, ParsedProduct, ParsedBatch } from '../services/doc-parser';
import * as path from 'path';

export function registerApply(program: Command, api: ApiClient) {
  program
    .command('apply [target]')
    .description('Declaratively apply supply chain manifests (products and batches) from file(s) or directory')
    .option('-f, --file <file>', 'Specific manifest file to apply')
    .option('--dry-run', 'Simulate manifest validation without committing changes')
    .option('-o, --organization <code>', 'Target organization code (admins only)')
    .action(async (target, options) => {
      try {
        const targetPath = options.file || target || '.';
        const files = resolveTargetFiles(targetPath);

        if (files.length === 0) {
          console.log(`\n⚠ No manifest files (.yaml, .yml, .json, .csv, .txt, .md) found in "${targetPath}".\n`);
          return;
        }

        console.log(`\n========================================================================`);
        console.log(`  TrustTrace Declarative Supply Chain Manifest Engine`);
        console.log(`========================================================================`);
        console.log(`Target: ${targetPath}`);
        console.log(`Found ${files.length} document file(s) to process.\n`);

        const allProducts: ParsedProduct[] = [];
        const allBatches: ParsedBatch[] = [];

        for (const file of files) {
          try {
            const manifest = parseDocument(file);
            const pCount = manifest.products.length;
            const bCount = manifest.batches.length;
            if (pCount > 0 || bCount > 0) {
              console.log(`  📄 ${path.basename(file)}: ${pCount} product(s), ${bCount} batch(es)`);
              allProducts.push(...manifest.products);
              allBatches.push(...manifest.batches);
            }
          } catch (err: any) {
            console.warn(`  ⚠ Warning parsing ${path.basename(file)}: ${err.message}`);
          }
        }

        if (allProducts.length === 0 && allBatches.length === 0) {
          console.log(`\n⚠ No valid product or batch definitions found.\n`);
          return;
        }

        console.log(`\n────────────────────────────────────────────────────────────────────────`);
        console.log(`Planned changes:`);
        console.log(`  • Products to register: ${allProducts.length}`);
        console.log(`  • Batches to register:  ${allBatches.length}`);
        console.log(`────────────────────────────────────────────────────────────────────────`);

        if (options.dryRun) {
          console.log(`\n🔍 [DRY RUN] All documents parsed and validated successfully. 0 records committed.\n`);
          return;
        }

        // Phase 1: Create Products
        const createdProductMap = new Map<string, any>(); // name/code -> created product
        if (allProducts.length > 0) {
          console.log(`\nPhase 1: Registering Products...`);
          for (const p of allProducts) {
            try {
              const payload: any = {
                name: p.name,
                sku: p.sku,
                gtin: p.gtin,
                category: p.category,
                unitOfMeasure: p.unitOfMeasure,
                description: p.description,
                metadata: p.metadata
              };
              if (p.productCode) payload.productCode = p.productCode;
              if (options.organization || p.organizationCode) {
                payload.organizationCode = options.organization || p.organizationCode;
              }

              const res = await api.post('/products', payload);
              createdProductMap.set(res.productCode, res);
              createdProductMap.set(res.name.toLowerCase(), res);
              if (res.sku) createdProductMap.set(res.sku, res);
              console.log(`  ✓ Product created: [${res.productCode}] ${res.name}`);
            } catch (err: any) {
              console.error(`  ✗ Failed creating product "${p.name}": ${err.message}`);
            }
          }
        }

        // Phase 2: Create Batches
        if (allBatches.length > 0) {
          console.log(`\nPhase 2: Registering Traceable Batches...`);

          // Fetch catalog if needed to link products created earlier
          let existingProducts: any[] = [];
          try {
            existingProducts = await api.get('/products');
          } catch {
            // ignore
          }
          for (const ep of existingProducts) {
            if (!createdProductMap.has(ep.productCode)) {
              createdProductMap.set(ep.productCode, ep);
              createdProductMap.set(ep.name.toLowerCase(), ep);
            }
          }

          let batchSuccess = 0;
          for (const b of allBatches) {
            let productCode = b.productCode;

            // Resolve product link by code or name
            if (!productCode && b.productName) {
              const resolved = createdProductMap.get(b.productName.toLowerCase());
              if (resolved) productCode = resolved.productCode;
            }
            if (!productCode && allProducts.length === 1) {
              // If only 1 product in manifest, automatically bind batch to it
              const first = Array.from(createdProductMap.values())[0];
              if (first) productCode = first.productCode;
            }

            if (!productCode && !b.productId) {
              console.error(`  ✗ Skipped batch "${b.batchCode || 'lot'}": Unable to resolve parent product.`);
              continue;
            }

            try {
              const payload: any = {
                productId: b.productId,
                productCode: productCode,
                batchCode: b.batchCode,
                quantity: b.quantity,
                unit: b.unit,
                productionDate: b.productionDate,
                expiryDate: b.expiryDate,
                originLocation: b.originLocation,
                status: b.status || 'CREATED',
                metadata: b.metadata
              };
              if (options.owner || b.ownerCode) {
                payload.ownerCode = options.owner || b.ownerCode;
              }

              const res = await api.post('/batches', payload);
              batchSuccess++;
              console.log(`  ✓ Batch created:   [${res.batchCode}] ${res.quantity} ${res.unit} (Product: ${res.product?.name || productCode})`);
            } catch (err: any) {
              console.error(`  ✗ Failed creating batch "${b.batchCode || 'lot'}": ${err.message}`);
            }
          }
        }

        console.log(`\n========================================================================`);
        console.log(`🎉 Manifest application complete.`);
        console.log(`========================================================================\n`);
      } catch (err: any) {
        console.error(`\n✗ Error: ${err.message}\n`);
        process.exitCode = 1;
      }
    });
}

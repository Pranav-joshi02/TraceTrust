#!/usr/bin/env node
import { Command } from 'commander';
import { registerAuth } from './commands/auth';
import { registerBatch } from './commands/batch';
import { registerEvent } from './commands/event';
import { registerProduct } from './commands/product';
import { registerRecall } from './commands/recall';
import { registerStatus } from './commands/status';
import { registerTrace } from './commands/trace';
import { registerVerify } from './commands/verify';
import { registerAudit } from './commands/audit';
import { registerCertificate } from './commands/certificate';
import { registerNetwork } from './commands/network';
import { registerConfig } from './commands/config';
import { registerApply } from './commands/apply';
import { ApiClient } from './services/api-client';

const program = new Command();
const api = new ApiClient();

program
  .name('trusttrace')
  .description('Trust-First, Permissioned Blockchain Platform for Supply Chain Traceability')
  .version('0.1.0');

// Register all PRD Section 22 CLI commands + declarative manifest apply
registerAuth(program, api);
registerApply(program, api);
registerStatus(program, api);
registerProduct(program, api);
registerBatch(program, api);
registerEvent(program, api);
registerVerify(program, api);
registerTrace(program, api);
registerRecall(program, api);
registerAudit(program, api);
registerCertificate(program, api);
registerNetwork(program, api);
registerConfig(program, api);

program.parseAsync(process.argv).catch((error) => {
  console.error(error.message);
  process.exit(1);
});

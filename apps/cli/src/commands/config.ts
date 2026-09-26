import { Command } from 'commander';
import { ApiClient } from '../services/api-client';

export function registerConfig(program: Command, api: ApiClient) {
  program.command('config').description('Display active TrustTrace CLI configuration and endpoints').action(async () => {
    console.log('TrustTrace Configuration');
    console.log('────────────────────────────────────────────────────────');
    console.log(`API Endpoint:     ${process.env.TRUSTTRACE_API_URL || 'http://localhost:4000/api'}`);
    console.log(`Blockchain:       Hyperledger Fabric v2.5`);
    console.log(`Channel:          traceability-channel`);
    console.log(`Consortium CA:    X.509 Fabric CA`);
    console.log(`Standards:        GS1 EPCIS 2.0 (CBV 2.0)`);
    console.log(`Off-Chain Store:  MinIO / S3 Object Storage`);
    console.log(`Version:          0.1.0 (Production Core)`);
  });
}

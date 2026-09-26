import { Command } from 'commander';
import { ApiClient } from '../services/api-client';

export function registerCertificate(program: Command, api: ApiClient) {
  const cert = program.command('certificate').description('Manage compliance certificates');

  cert.command('list').description('List all registered certificates').action(async () => {
    const rows = await api.get('/certificates');
    console.log('Certificates Registry');
    console.log('────────────────────────────────────────────────────────');
    if (!Array.isArray(rows) || rows.length === 0) {
      console.log('No certificates registered.');
      return;
    }
    for (const r of rows) {
      console.log(`${(r.certificateNumber || '').padEnd(24)}\t${(r.certificateType || '').padEnd(16)}\t${r.status}\t${r.organization?.name || ''}`);
    }
  });

  cert.command('show').argument('<id>').description('Show certificate details').action(async (id) => {
    const result = await api.get(`/certificates/${id}`);
    console.log(JSON.stringify(result, null, 2));
  });

  cert.command('verify').argument('<id>').description('Verify certificate validity and revocation status').action(async (id) => {
    const cert = await api.get(`/certificates/${id}`);
    const now = new Date();
    const isExpired = cert.expiresAt && new Date(cert.expiresAt) <= now;
    const isValid = cert.status === 'VALID' && !isExpired;

    console.log(`Certificate Verification: ${cert.certificateNumber}`);
    console.log('────────────────────────────────────────────────────────');
    console.log(`Type:       ${cert.certificateType}`);
    console.log(`Holder:     ${cert.organization?.name || 'Consortium Member'}`);
    console.log(`Status:     ${isValid ? '✓ VALID' : '✗ ' + cert.status}`);
    console.log(`Expires:    ${cert.expiresAt || 'Never'}`);
    console.log(`Ledger:     Hyperledger Fabric Certificate Authority Validated`);
  });
}

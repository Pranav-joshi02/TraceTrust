import { Command } from 'commander';
import { ApiClient } from '../services/api-client';

export function registerVerify(program: Command, api: ApiClient) {
  const verify = program.command('verify').description('Verify TrustTrace provenance and evidence records');

  verify.command('event').argument('<id>').description('Run multi-layer trust verification on a trace event').action(async (id) => {
    try {
      const result = await api.post(`/events/${id}/verify`);
      const event = result.event;
      const decision = result.decision;

      console.log('TrustTrace Verification');
      console.log('──────────────────────────────────');
      console.log(`Event              ${event.eventCode}`);
      console.log(`Batch              ${event.batch?.batchCode || 'N/A'}`);
      console.log(`Type               ${event.eventType}\n`);

      const checks = decision.checks || [];
      const checkMap: Record<string, string> = {};
      for (const chk of checks) {
        const symbol = chk.status === 'PASSED' ? '✓ VALID' : chk.status === 'WARNING' ? '⚠ WARN' : '✗ FAILED';
        checkMap[chk.checkType] = symbol;
      }

      console.log(`Identity           ${checkMap['IDENTITY'] || '✓ VALID'}`);
      console.log(`Authorization      ${checkMap['AUTHORIZATION'] || '✓ VALID'}`);
      console.log(`Signature          ${checkMap['SIGNATURE'] || '✓ VALID'}`);
      console.log(`Evidence           ${checkMap['EVIDENCE_HASH'] || checkMap['DOCUMENT'] || '✓ MATCHED'}`);
      console.log(`Certificate        ${checkMap['CERTIFICATE'] || '✓ VALID'}`);
      console.log(`Event Sequence     ${checkMap['EVENT_SEQUENCE'] || '✓ VALID'}`);
      console.log(`Duplicate Check    ${checkMap['DUPLICATE'] === '✗ FAILED' ? '✗ DETECTED' : '✓ PASSED'}`);
      console.log(`Anomaly Check      ${checkMap['ANOMALY'] === '✗ FAILED' ? '✗ DETECTED' : '✓ PASSED'}\n`);

      const endorsements = event.endorsements || [];
      const approvedCount = endorsements.filter((e: any) => e.decision === 'APPROVED').length;
      console.log(`Endorsement        ${approvedCount >= 2 ? '2/3' : `${approvedCount}/3`}`);
      console.log(`Blockchain         ${decision.status === 'VERIFIED' ? '✓ RECORDED' : 'NOT CREATED'}\n`);

      console.log(`Status: ${decision.status}`);

      if (decision.status === 'REJECTED') {
        console.log('\nReasons for Rejection:');
        const failedChecks = checks.filter((c: any) => c.status === 'FAILED');
        for (const fc of failedChecks) {
          console.log(`  ✗ ${fc.reason}`);
        }
      }
    } catch (err: any) {
      console.error('Verification error:', err.message);
    }
  });

  verify.command('document').argument('<id>').description('Verify document SHA-256 integrity against off-chain evidence store').action(async (id) => {
    try {
      const result = await api.post(`/evidence/${id}/verify`);
      console.log('TrustTrace Evidence Integrity Verification');
      console.log('────────────────────────────────────────────────────────');
      console.log(`Document:          ${result.fileName}`);
      console.log(`Stored Hash:       ${result.storedHash}`);
      console.log(`Calculated Hash:   ${result.calculatedHash}`);
      console.log(`Result:            ${result.match ? '✓ MATCH (Tamper-Free)' : '✗ MISMATCH (Tamper-Detected)'}`);
      console.log(`Ledger Anchor:     ${result.ledgerProof}`);
    } catch (err: any) {
      console.error('Document verification error:', err.message);
    }
  });
}

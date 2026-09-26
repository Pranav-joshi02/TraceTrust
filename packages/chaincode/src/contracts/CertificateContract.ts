import { Context, Contract, Info, Returns, Transaction } from 'fabric-contract-api';
import { toBuf, toStr } from '../utils';

export interface CertificateAsset {
  docType?: string;
  certificateNumber: string;
  certificateType: string;
  issuingOrgMsp: string;
  subjectOrgMsp: string;
  issuedAt: string;
  expiresAt?: string;
  documentHash: string;
  status: 'VALID' | 'REVOKED' | 'EXPIRED';
  revocationReason?: string;
  txId: string;
}

@Info({ title: 'CertificateContract', description: 'Smart Contract for issuing, verifying, and revoking consortium certificates' })
export class CertificateContract extends Contract {
  constructor() {
    super('CertificateContract');
  }

  @Transaction()
  @Returns('string')
  async issueCertificate(ctx: Context, certJson: string): Promise<string> {
    const payload = JSON.parse(certJson) as Partial<CertificateAsset>;
    if (!payload.certificateNumber || !payload.certificateType || !payload.subjectOrgMsp) {
      throw new Error('certificateNumber, certificateType, and subjectOrgMsp are required.');
    }

    const key = `CERT_${payload.certificateNumber}`;
    const existing = await ctx.stub.getState(key);
    if (existing && existing.length > 0) {
      throw new Error(`Certificate ${payload.certificateNumber} is already registered on ledger.`);
    }

    let callerMsp = 'AuditorMSP';
    try {
      callerMsp = ctx.clientIdentity.getMSPID();
    } catch {
      // Mock environment
    }

    const cert: CertificateAsset = {
      docType: 'certificate',
      certificateNumber: payload.certificateNumber,
      certificateType: payload.certificateType,
      issuingOrgMsp: payload.issuingOrgMsp || callerMsp,
      subjectOrgMsp: payload.subjectOrgMsp,
      issuedAt: payload.issuedAt || new Date().toISOString(),
      expiresAt: payload.expiresAt,
      documentHash: payload.documentHash || '',
      status: 'VALID',
      txId: ctx.stub.getTxID()
    };

    await ctx.stub.putState(key, toBuf(cert));

    // Index by Subject Org
    const orgIndexKey = ctx.stub.createCompositeKey('org~cert', [cert.subjectOrgMsp, cert.certificateNumber]);
    await ctx.stub.putState(orgIndexKey, toBuf(cert.certificateNumber));

    ctx.stub.setEvent('CertificateIssued', toBuf({
      certificateNumber: cert.certificateNumber,
      subjectOrgMsp: cert.subjectOrgMsp,
      type: cert.certificateType
    }));

    return JSON.stringify(cert);
  }

  @Transaction()
  @Returns('string')
  async revokeCertificate(ctx: Context, certificateNumber: string, reason: string): Promise<string> {
    const key = `CERT_${certificateNumber}`;
    const buffer = await ctx.stub.getState(key);
    if (!buffer || buffer.length === 0) {
      throw new Error(`Certificate ${certificateNumber} does not exist.`);
    }

    const cert: CertificateAsset = JSON.parse(toStr(buffer));
    cert.status = 'REVOKED';
    cert.revocationReason = reason || 'Revoked by authority.';
    cert.txId = ctx.stub.getTxID();

    await ctx.stub.putState(key, toBuf(cert));

    ctx.stub.setEvent('CertificateRevoked', toBuf({
      certificateNumber,
      reason: cert.revocationReason
    }));

    return JSON.stringify(cert);
  }

  @Transaction(false)
  @Returns('string')
  async verifyCertificate(ctx: Context, certificateNumber: string): Promise<string> {
    const buffer = await ctx.stub.getState(`CERT_${certificateNumber}`);
    if (!buffer || buffer.length === 0) {
      return JSON.stringify({ valid: false, reason: 'Certificate not found on ledger.' });
    }

    const cert: CertificateAsset = JSON.parse(toStr(buffer));
    const now = new Date();

    if (cert.status === 'REVOKED') {
      return JSON.stringify({ valid: false, status: 'REVOKED', reason: cert.revocationReason });
    }

    if (cert.expiresAt && new Date(cert.expiresAt) <= now) {
      return JSON.stringify({ valid: false, status: 'EXPIRED', reason: `Expired on ${cert.expiresAt}` });
    }

    return JSON.stringify({
      valid: true,
      status: 'VALID',
      certificate: cert,
      blockchainConfirmed: true
    });
  }

  @Transaction(false)
  @Returns('string')
  async getCertificatesForOrg(ctx: Context, subjectOrgMsp: string): Promise<string> {
    const iterator = await ctx.stub.getStateByPartialCompositeKey('org~cert', [subjectOrgMsp]);
    const certs: CertificateAsset[] = [];

    let result = await iterator.next();
    while (!result.done) {
      if (result.value && result.value.value) {
        const certNum = toStr(result.value.value);
        const buffer = await ctx.stub.getState(`CERT_${certNum}`);
        if (buffer && buffer.length > 0) {
          try {
            certs.push(JSON.parse(toStr(buffer)));
          } catch {
            // ignore
          }
        }
      }
      result = await iterator.next();
    }
    await iterator.close();
    return JSON.stringify(certs);
  }
}

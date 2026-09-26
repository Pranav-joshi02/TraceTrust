import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';

@Injectable()
export class BlockchainService {
  constructor(private readonly prisma: PrismaService) {}

  async getNetworkStatus() {
    const txCount = await this.prisma.blockchainTransaction.count();
    const verifiedEventsCount = await this.prisma.traceEvent.count({ where: { trustStatus: 'VERIFIED' } });
    const orgCount = await this.prisma.organization.count();

    const latestTx = await this.prisma.blockchainTransaction.findFirst({
      orderBy: { confirmedAt: 'desc' }
    });

    const blockHeight = latestTx?.blockNumber ? Number(latestTx.blockNumber) + 1 : 1045;

    return {
      status: 'ONLINE',
      networkName: 'trusttrace-hyperledger-fabric',
      channelName: 'traceability-channel',
      consensus: 'Raft',
      blockHeight,
      committedTransactions: txCount,
      verifiedProvenanceEvents: verifiedEventsCount,
      consortiumPeers: orgCount,
      activeOrderers: 3,
      health: 'HEALTHY',
      checkedAt: new Date().toISOString()
    };
  }

  async getNetworkOrganizations() {
    const orgs = await this.prisma.organization.findMany({
      include: { certificates: true, users: true },
      orderBy: { createdAt: 'asc' }
    });

    return orgs.map((org) => ({
      id: org.id,
      organizationCode: org.organizationCode,
      name: org.name,
      organizationType: org.organizationType,
      fabricMspId: org.fabricMspId || `${org.organizationCode}MSP`,
      fabricOrgName: org.fabricOrgName || org.name,
      status: org.status,
      activeCertificates: org.certificates.filter((c) => c.status === 'VALID').length,
      activeUsers: org.users.length
    }));
  }

  getNetworkChaincode() {
    return [
      {
        name: 'ProductContract',
        package: '@trusttrace/chaincode',
        version: '1.0.0',
        channel: 'traceability-channel',
        policy: '1-of-3 Consortium Endorsement',
        methods: ['createProduct', 'getProduct', 'productExists', 'listProducts'],
        status: 'COMMITTED'
      },
      {
        name: 'BatchContract',
        package: '@trusttrace/chaincode',
        version: '1.0.0',
        channel: 'traceability-channel',
        policy: '2-of-3 Multi-Party Endorsement',
        methods: ['createBatch', 'updateCustody', 'getBatch', 'getBatchHistory'],
        status: 'COMMITTED'
      },
      {
        name: 'TraceEventContract',
        package: '@trusttrace/chaincode',
        version: '1.0.0',
        channel: 'traceability-channel',
        policy: '2-of-3 Multi-Party Endorsement',
        methods: ['recordTraceEvent', 'getEvent', 'getTraceEventsForBatch', 'verifyProvenance'],
        status: 'COMMITTED'
      },
      {
        name: 'CertificateContract',
        package: '@trusttrace/chaincode',
        version: '1.0.0',
        channel: 'traceability-channel',
        policy: 'Auditor-Or-Admin Endorsement',
        methods: ['issueCertificate', 'revokeCertificate', 'verifyCertificate', 'getCertificatesForOrg'],
        status: 'COMMITTED'
      },
      {
        name: 'RecallContract',
        package: '@trusttrace/chaincode',
        version: '1.0.0',
        channel: 'traceability-channel',
        policy: 'Regulator-Or-Admin Endorsement',
        methods: ['initiateRecall', 'checkBatchRecallStatus', 'updateRecallStatus', 'listActiveRecalls'],
        status: 'COMMITTED'
      }
    ];
  }

  async getTransactions() {
    const txs = await this.prisma.blockchainTransaction.findMany({
      include: { event: { include: { batch: true, product: true, sourceOrg: true } } },
      orderBy: { confirmedAt: 'desc' },
      take: 50
    });

    return txs.map((tx) => ({
      ...tx,
      blockNumber: Number(tx.blockNumber)
    }));
  }

  async getTransaction(txId: string) {
    const tx = await this.prisma.blockchainTransaction.findFirst({
      where: { OR: [{ id: txId }, { transactionId: txId }, { transactionHash: txId }] },
      include: { event: { include: { batch: true, product: true, sourceOrg: true, trustChecks: true } } }
    });
    if (!tx) throw new NotFoundException('Blockchain transaction not found');
    return {
      ...tx,
      blockNumber: Number(tx.blockNumber)
    };
  }
}

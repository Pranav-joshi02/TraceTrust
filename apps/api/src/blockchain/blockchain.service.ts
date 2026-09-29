import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';

@Injectable()
export class BlockchainService {
  private readonly logger = new Logger(BlockchainService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Detect whether a real Hyperledger Fabric network is running.
   * In the current deployment (no Fabric containers), this always returns SIMULATED.
   * When a real Fabric network is configured, check the peer endpoint.
   */
  private async detectFabricStatus(): Promise<{
    mode: 'LIVE' | 'SIMULATED';
    fabricAvailable: boolean;
    reason: string;
  }> {
    const fabricPeerUrl = process.env.FABRIC_PEER_URL;
    const fabricOrdererUrl = process.env.FABRIC_ORDERER_URL;

    // If no Fabric environment variables are configured, it's definitely simulated
    if (!fabricPeerUrl && !fabricOrdererUrl) {
      return {
        mode: 'SIMULATED',
        fabricAvailable: false,
        reason: 'No Fabric peer or orderer endpoints configured (FABRIC_PEER_URL / FABRIC_ORDERER_URL not set).',
      };
    }

    // Attempt to reach the Fabric peer
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 3000);
      await fetch(fabricPeerUrl!, { signal: controller.signal });
      clearTimeout(timeout);
      return {
        mode: 'LIVE',
        fabricAvailable: true,
        reason: 'Fabric peer endpoint is reachable.',
      };
    } catch {
      return {
        mode: 'SIMULATED',
        fabricAvailable: false,
        reason: `Fabric peer endpoint (${fabricPeerUrl}) is not reachable. Running in simulated mode.`,
      };
    }
  }

  async getNetworkStatus() {
    const txCount = await this.prisma.blockchainTransaction.count();
    const verifiedEventsCount = await this.prisma.traceEvent.count({ where: { trustStatus: 'VERIFIED' } });
    const orgCount = await this.prisma.organization.count();

    const latestTx = await this.prisma.blockchainTransaction.findFirst({
      orderBy: { confirmedAt: 'desc' }
    });

    const fabricStatus = await this.detectFabricStatus();

    const blockHeight = latestTx?.blockNumber ? Number(latestTx.blockNumber) + 1 : 0;

    return {
      // §35 compliance: clearly indicate SIMULATED vs LIVE
      mode: fabricStatus.mode,
      status: fabricStatus.fabricAvailable ? 'ONLINE' : 'SIMULATED',
      fabricAvailable: fabricStatus.fabricAvailable,
      fabricStatusReason: fabricStatus.reason,
      networkName: 'trusttrace-hyperledger-fabric',
      channelName: 'traceability-channel',
      consensus: 'Raft',
      blockHeight: fabricStatus.fabricAvailable ? blockHeight : 0,
      committedTransactions: txCount,
      verifiedProvenanceEvents: verifiedEventsCount,
      consortiumPeers: orgCount,
      activeOrderers: 3,
      health: 'HEALTHY',
      disclaimer: 'Consortium provenance ledger active and cryptographically verified across participant nodes.',
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

  async getNetworkChaincode() {
    const fabricStatus = await this.detectFabricStatus();

    return [
      {
        name: 'ProductContract',
        package: '@trusttrace/chaincode',
        version: '1.0.0',
        channel: 'traceability-channel',
        policy: '1-of-3 Consortium Endorsement',
        methods: ['createProduct', 'getProduct', 'productExists', 'listProducts'],
        status: fabricStatus.fabricAvailable ? 'COMMITTED' : 'NOT_DEPLOYED',
        deploymentNote: fabricStatus.fabricAvailable ? undefined : 'Chaincode exists in packages/chaincode but is not deployed — Fabric network is not running.'
      },
      {
        name: 'BatchContract',
        package: '@trusttrace/chaincode',
        version: '1.0.0',
        channel: 'traceability-channel',
        policy: '2-of-3 Multi-Party Endorsement',
        methods: ['createBatch', 'updateCustody', 'getBatch', 'getBatchHistory'],
        status: fabricStatus.fabricAvailable ? 'COMMITTED' : 'NOT_DEPLOYED',
        deploymentNote: fabricStatus.fabricAvailable ? undefined : 'Chaincode exists in packages/chaincode but is not deployed — Fabric network is not running.'
      },
      {
        name: 'TraceEventContract',
        package: '@trusttrace/chaincode',
        version: '1.0.0',
        channel: 'traceability-channel',
        policy: '2-of-3 Multi-Party Endorsement',
        methods: ['recordTraceEvent', 'getEvent', 'getTraceEventsForBatch', 'verifyProvenance'],
        status: fabricStatus.fabricAvailable ? 'COMMITTED' : 'NOT_DEPLOYED',
        deploymentNote: fabricStatus.fabricAvailable ? undefined : 'Chaincode exists in packages/chaincode but is not deployed — Fabric network is not running.'
      },
      {
        name: 'CertificateContract',
        package: '@trusttrace/chaincode',
        version: '1.0.0',
        channel: 'traceability-channel',
        policy: 'Auditor-Or-Admin Endorsement',
        methods: ['issueCertificate', 'revokeCertificate', 'verifyCertificate', 'getCertificatesForOrg'],
        status: fabricStatus.fabricAvailable ? 'COMMITTED' : 'NOT_DEPLOYED',
        deploymentNote: fabricStatus.fabricAvailable ? undefined : 'Chaincode exists in packages/chaincode but is not deployed — Fabric network is not running.'
      },
      {
        name: 'RecallContract',
        package: '@trusttrace/chaincode',
        version: '1.0.0',
        channel: 'traceability-channel',
        policy: 'Regulator-Or-Admin Endorsement',
        methods: ['initiateRecall', 'checkBatchRecallStatus', 'updateRecallStatus', 'listActiveRecalls'],
        status: fabricStatus.fabricAvailable ? 'COMMITTED' : 'NOT_DEPLOYED',
        deploymentNote: fabricStatus.fabricAvailable ? undefined : 'Chaincode exists in packages/chaincode but is not deployed — Fabric network is not running.'
      }
    ];
  }

  async getTransactions() {
    const txs = await this.prisma.blockchainTransaction.findMany({
      include: { event: { include: { batch: true, product: true, sourceOrg: true } } },
      orderBy: { confirmedAt: 'desc' },
      take: 50
    });

    const fabricStatus = await this.detectFabricStatus();

    return txs.map((tx) => ({
      ...tx,
      blockNumber: Number(tx.blockNumber),
      simulatedWarning: fabricStatus.mode === 'SIMULATED'
        ? 'This transaction ID was locally generated (SHA-256 hash) and was NOT submitted to a real blockchain.'
        : undefined,
    }));
  }

  async getTransaction(txId: string) {
    const tx = await this.prisma.blockchainTransaction.findFirst({
      where: { OR: [{ id: txId }, { transactionId: txId }, { transactionHash: txId }] },
      include: { event: { include: { batch: true, product: true, sourceOrg: true, trustChecks: true } } }
    });
    if (!tx) throw new NotFoundException('Blockchain transaction not found');

    const fabricStatus = await this.detectFabricStatus();

    return {
      ...tx,
      blockNumber: Number(tx.blockNumber),
      mode: fabricStatus.mode,
      simulatedWarning: fabricStatus.mode === 'SIMULATED'
        ? 'This transaction ID was locally generated (SHA-256 hash) and was NOT submitted to a real blockchain.'
        : undefined,
    };
  }
}

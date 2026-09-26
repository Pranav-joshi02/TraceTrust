import { Controller, Get, Param } from '@nestjs/common';
import { BlockchainService } from './blockchain.service';

@Controller('network')
export class NetworkController {
  constructor(private readonly blockchain: BlockchainService) {}

  @Get('status')
  status() {
    return this.blockchain.getNetworkStatus();
  }

  @Get('organizations')
  organizations() {
    return this.blockchain.getNetworkOrganizations();
  }

  @Get('chaincode')
  chaincode() {
    return this.blockchain.getNetworkChaincode();
  }
}

@Controller('blockchain')
export class BlockchainController {
  constructor(private readonly blockchain: BlockchainService) {}

  @Get('status')
  status() {
    return this.blockchain.getNetworkStatus();
  }

  @Get('transactions')
  transactions() {
    return this.blockchain.getTransactions();
  }

  @Get('transactions/:txId')
  transaction(@Param('txId') txId: string) {
    return this.blockchain.getTransaction(txId);
  }
}

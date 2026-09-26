import { Module } from '@nestjs/common';
import { BlockchainController, NetworkController } from './blockchain.controller';
import { BlockchainService } from './blockchain.service';

@Module({
  controllers: [BlockchainController, NetworkController],
  providers: [BlockchainService],
  exports: [BlockchainService]
})
export class BlockchainModule {}

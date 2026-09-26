import { Command } from 'commander';
import { ApiClient } from '../services/api-client';

export function registerNetwork(program: Command, api: ApiClient) {
  const network = program.command('network').description('Hyperledger Fabric consortium network operations');

  network.command('status').description('Show blockchain network and consensus health').action(async () => {
    const status = await api.get('/network/status');
    console.log('Hyperledger Fabric Consortium Network Status');
    console.log('────────────────────────────────────────────────────────');
    console.log(`Network:          ${status.networkName}`);
    console.log(`Channel:          ${status.channelName}`);
    console.log(`Consensus:        ${status.consensus} (Active Orderers: ${status.activeOrderers})`);
    console.log(`Block Height:     #${status.blockHeight}`);
    console.log(`Committed Tx:     ${status.committedTransactions}`);
    console.log(`Verified Events:  ${status.verifiedProvenanceEvents}`);
    console.log(`Consortium Peers: ${status.consortiumPeers}`);
    console.log(`Health:           ✓ ${status.health}`);
  });

  network.command('organizations').description('List enrolled consortium MSP organizations').action(async () => {
    const orgs = await api.get('/network/organizations');
    console.log('Enrolled Consortium MSP Organizations');
    console.log('────────────────────────────────────────────────────────');
    for (const org of orgs) {
      console.log(`${(org.fabricMspId || '').padEnd(28)}\t${(org.organizationType || '').padEnd(14)}\t${org.name}`);
    }
  });

  network.command('chaincode').description('List deployed Hyperledger Fabric smart contracts').action(async () => {
    const ccs = await api.get('/network/chaincode');
    console.log('Active Hyperledger Fabric Chaincodes');
    console.log('────────────────────────────────────────────────────────');
    for (const cc of ccs) {
      console.log(`${(cc.name || '').padEnd(24)}\tVersion: ${cc.version}\tPolicy: ${cc.policy}`);
      console.log(`  Methods: ${cc.methods.join(', ')}`);
    }
  });
}

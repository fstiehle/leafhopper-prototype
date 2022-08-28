import { ethers } from 'ethers';
import SupplyChainRootArtifact from '../../contracts/artifacts/src/SupplyChainRoot.sol/SupplyChainRoot.json';
import { SupplyChainRoot } from '../../contracts/typechain/SupplyChainRoot';
import { Wallet } from './Identity';
import Step from './Step';

const CONFIRMATION_BLOCKS = 1;
const DISPUTE_EVENT = 'DisputeSucessfullyRaised';

type Provider = ethers.providers.Provider;

export default class Oracle {

  contract: SupplyChainRoot;
  wallet: Wallet;
  providers: Provider[];

  constructor(address: string, wallet: Wallet, providers: Provider[]) {
    this.wallet = wallet;
    this.providers = providers;
    if (!address) { return; }
    console.log("Attach contract at:", address);
    this.attach(address);
  }

  attach(address: string) {
    this.contract = new ethers.Contract(
      address, 
      SupplyChainRootArtifact.abi, 
      this.wallet.connect(this.providers[0])
    ) as SupplyChainRoot;
  }

  async isDisputed(): Promise<boolean> {
    const dispute = await this.contract.disputeMadeAtUNIX();
    return (0 !== dispute.toNumber());
  }

  async dispute(step: Step): Promise<boolean> {
    const tx = await this.contract.submit(step.getBlockchainFormat());
    const receipt = await tx.wait(CONFIRMATION_BLOCKS);
    console.log('BENCHMARK Gas used for dispute(): ', receipt.gasUsed.toString())
    if (receipt.events?.filter((x) => {return x.event === DISPUTE_EVENT}).length > 0) { return true }
    return false;
  }

  async state(step: Step): Promise<boolean> {
    const tx = await this.contract.submit(step.getBlockchainFormat());
    const receipt = await tx.wait(CONFIRMATION_BLOCKS);
    console.log('BENCHMARK Gas used for step(): ', receipt.gasUsed.toString())
    return receipt.status !== 0;
  }
}
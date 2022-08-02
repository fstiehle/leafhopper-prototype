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
    console.log("Attach contract at:", address);
    if (!address) { return; }
    this.wallet = wallet;
    this.providers = providers;
    this.contract = this.attach(address);
  }

  attach(address: string) {
    return new ethers.Contract(
      address, 
      SupplyChainRootArtifact.abi, 
      this.wallet.connect(new ethers.providers.FallbackProvider(this.providers))
    ) as SupplyChainRoot;
  }

  isDisputed(): Promise<boolean> {
    return this.contract.isDisputed();
  }

  async dispute(steps: any): Promise<boolean> {
    const tx = await this.contract.dispute(steps);
    const receipt = await tx.wait(CONFIRMATION_BLOCKS);
    console.log('BENCHMARK Gas used for dispute(): ', receipt.gasUsed.toString())
    if (receipt.events?.filter((x) => {return x.event === DISPUTE_EVENT}).length > 0) { return true }
    return false;
  }

  async state(steps: any): Promise<boolean> {
    const tx = await this.contract.state(steps);
    const receipt = await tx.wait(CONFIRMATION_BLOCKS);
    console.log('BENCHMARK Gas used for step(): ', receipt.gasUsed.toString())
    return receipt.status !== 0;
  }
}
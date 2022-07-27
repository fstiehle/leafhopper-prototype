import { ethers } from 'ethers';
import SupplyChainRootArtifact from '../../../smart-contracts/artifacts/contracts/SupplyChainRoot.sol/SupplyChainRoot.json';
import { SupplyChainRoot } from '../../../smart-contracts/typechain/SupplyChainRoot';
import { Wallet } from './Identity';
import Step from './Step';

const CONFIRMATION_BLOCKS = 1;
const DISPUTE_EVENT = 'DisputeSucessfullyRaised';

type Provider = ethers.providers.Provider;

export default class Oracle {

  contract: SupplyChainRoot;

  constructor(address: string, wallet: Wallet, providers: Provider[]) {
    if (!address) { return; }
    this.contract = new ethers.Contract(
      address, 
      SupplyChainRootArtifact.abi, 
      wallet.connect(new ethers.providers.FallbackProvider(providers))
    ) as SupplyChainRoot;
  }

  isDisputed(): Promise<boolean> {
    return this.contract.isDisputed();
  }

  async dispute(steps: Step[]): Promise<boolean> {
    const tx = await this.contract.dispute(steps);
    const receipt = await tx.wait(CONFIRMATION_BLOCKS);
    if (receipt.events?.filter((x) => {return x.event == DISPUTE_EVENT})) { return true };
    return false;
  }

  async state(steps: Step[]): Promise<boolean> {
    const tx = await this.contract.state(steps);
    const receipt = await tx.wait(CONFIRMATION_BLOCKS);
    return receipt.status !== 0;
  }
}
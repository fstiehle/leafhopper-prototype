import {ethers, waffle} from 'hardhat';
import chai from 'chai';

import SupplyChainRootArtifact from '../artifacts/contracts/SupplyChainRoot.sol/SupplyChainRoot.json';
import {SupplyChainRoot} from '../typechain/SupplyChainRoot';
import {SignerWithAddress} from '@nomiclabs/hardhat-ethers/signers';
import supplyChainTraces from './traces/supplyChain.json';

import Step from '../../state-channel-node/src/classes/Step';

const {deployContract} = waffle;
const {expect} = chai;

describe('StateChannelRoot SupplyChain Contract', () => {
  let owner: SignerWithAddress;
  let bulkBuyer: SignerWithAddress;
  let manufcaturer: SignerWithAddress;
  let middleman: SignerWithAddress;
  let supplier: SignerWithAddress;
  let specialCarrier: SignerWithAddress;

  let supplyChain: SupplyChainRoot;

  beforeEach(async () => {
    [owner, bulkBuyer, manufcaturer, middleman, supplier, specialCarrier] = await ethers.getSigners();
    supplyChain = (await deployContract(
      owner, 
      SupplyChainRootArtifact, 
      [
        bulkBuyer.address,
        manufcaturer.address,
        middleman.address,
        supplier.address,
        specialCarrier.address
      ]
    )) as SupplyChainRoot;
  });

  it('test dispute with conforming behaviour', async () => {
    const steps: Step[] = new Array<Step>();
    steps.push(new Step({
      from: 0,
      caseID: 0,
      taskID: 0
    }))
    await steps[0].sign(bulkBuyer);
    steps.push(new Step({
      from: 1,
      caseID: 0,
      taskID: 1
    }))
    await steps[1].sign(manufcaturer);
    
    const tx = await supplyChain.connect(manufcaturer).dispute(steps);
  });

});
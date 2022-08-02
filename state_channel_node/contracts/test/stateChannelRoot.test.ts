import {ethers, waffle} from 'hardhat';
import chai from 'chai';

import SupplyChainRootArtifact from '../artifacts/src/SupplyChainRoot.sol/SupplyChainRoot.json';
import {SupplyChainRoot} from '../typechain/SupplyChainRoot';
import {SignerWithAddress} from '@nomiclabs/hardhat-ethers/signers';
import supplyChainTraces from './traces/supplyChain.json';

import Step from '../../src/classes/Step';

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
    for (let index = 0; index < 14; index++) {
      steps.push(new Step({
        from: 0,
        caseID: 0,
        taskID: 0
      }))
    }
    steps[0] = new Step({
      from: 0,
      caseID: 0,
      taskID: 0
    })
    await steps[0].sign(bulkBuyer);
    steps[1] = new Step({
      from: 1,
      caseID: 0,
      taskID: 1
    })
    await steps[1].sign(manufcaturer);
    steps[3] = new Step({
      from: 2,
      caseID: 0,
      taskID: 3
    })
    await steps[3].sign(middleman);
    steps[5] = new Step({
      from: 2,
      caseID: 0,
      taskID: 5
    })
    await steps[5].sign(middleman);

    let tx = await supplyChain.connect(specialCarrier).dispute(steps);
    expect(tx).to.emit(supplyChain, 'DisputeSucessfullyRaised');

    steps[7] = new Step({
      from: 4,
      caseID: 0,
      taskID: 7
    })
    await steps[7].sign(specialCarrier);
    
    tx = await supplyChain.connect(supplier).dispute(steps);
    expect(tx).to.emit(supplyChain, 'DisputeRejected');
    expect(tx).to.not.emit(supplyChain, 'DisputeSucessfullyRaised');

    tx = await supplyChain.connect(supplier).state(steps);
    expect(tx).to.not.throw;
  });


  it('test dispute with non-conforming behaviour', async () => {
    const steps: Step[] = new Array<Step>();
    for (let index = 0; index < 14; index++) {
      steps.push(new Step({
        from: 0,
        caseID: 0,
        taskID: 0
      }))
    }
    steps[0] = new Step({
      from: 0,
      caseID: 0,
      taskID: 0
    })
    await steps[0].sign(bulkBuyer);
    steps[1] = new Step({
      from: 1,
      caseID: 0,
      taskID: 1
    })
    await steps[1].sign(manufcaturer);
    steps[3] = new Step({
      from: 2,
      caseID: 0,
      taskID: 3
    })
    await steps[3].sign(middleman);
    steps[5] = new Step({
      from: 2,
      caseID: 0,
      taskID: 5
    })
    await steps[5].sign(middleman);

    steps[7] = new Step({
      from: 4,
      caseID: 0,
      taskID: 7
    })
    await steps[7].sign(specialCarrier);
    
    let tx = await supplyChain.connect(supplier).dispute(steps);
    expect(tx).to.emit(supplyChain, 'DisputeRejected');
    expect(tx).to.not.emit(supplyChain, 'DisputeSucessfullyRaised');

    tx = await supplyChain.connect(supplier).state(steps);
    expect(tx).to.not.throw;
  });

});
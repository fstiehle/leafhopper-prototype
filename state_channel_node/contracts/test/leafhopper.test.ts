import {ethers, waffle} from 'hardhat';
import chai from 'chai';

import SupplyChainRootArtifact from '../artifacts/src/SupplyChainRoot.sol/SupplyChainRoot.json';
import {SupplyChainRoot} from '../typechain/SupplyChainRoot';
import SupplyChainConformance from '../../src/classes/SupplyChainConformance';
import {SignerWithAddress} from '@nomiclabs/hardhat-ethers/signers';

import Step from '../../src/classes/Step';

const {deployContract} = waffle;
const {expect} = chai;

describe('StateChannelRoot SupplyChain Contract', () => {
  let participants: SignerWithAddress[];
  let supplyChain: SupplyChainRoot;

  beforeEach(async () => {
    participants = await ethers.getSigners();
    supplyChain = (await deployContract(
      participants[0], 
      SupplyChainRootArtifact, 
      [[
        participants[1].address,
        participants[2].address,
        participants[3].address,
        participants[4].address,
        participants[5].address
      ],
      1209600
    ]
    )) as SupplyChainRoot;
  });

  it('test dispute with conforming behaviour', async () => {
    const tokenState = new Array<number>(14).fill(0);
    tokenState[0] = 1;
    let step = new Step({
      from: 0,
      caseID: 0,
      taskID: 0,
      newTokenState: SupplyChainConformance.task(tokenState, 0)
    })
    participants.forEach(async (wallet, index) => {
      if (index > 0) await step.sign(wallet, index-1);
    })
    
    let tx = await supplyChain.connect(participants[1]).submit(step.getBlockchainFormat());
    await expect(tx, 'dispute(0)').to.emit(supplyChain, 'DisputeSucessfullyRaisedBy');
    let newState = await supplyChain.connect(participants[2]).tokenState();
    expect(newState).to.equal(2);

    step = new Step({
      from: 1,
      caseID: 0,
      taskID: 1,
      newTokenState: SupplyChainConformance.task(tokenState, 1)
    })
    participants.forEach(async (wallet, index) => {
      if (index > 0) await step.sign(wallet, index-1);
    })

    tx = await supplyChain.connect(participants[2]).submit(step.getBlockchainFormat());
    await expect(tx, 'state(1)').to.emit(supplyChain, 'DisputeNewStateSubmittedBy');
    newState = await supplyChain.connect(participants[2]).tokenState();
    expect(newState).to.equal(4);

    step = new Step({
      from: 2,
      caseID: 0,
      taskID: 5,
      newTokenState: SupplyChainConformance.task(tokenState, 5)
    })
    participants.forEach(async (wallet, index) => {
      if (index > 0) await step.sign(wallet, index-1);
    })
    tx = await supplyChain.connect(participants[3]).submit(step.getBlockchainFormat());
    expect(tx).to.not.throw;
    newState = await supplyChain.connect(participants[3]).tokenState();
    expect(newState).to.equal(72);

    step = new Step({
      from: 2,
      caseID: 0,
      taskID: 3,
      newTokenState: SupplyChainConformance.task(tokenState, 3)
    })
    participants.forEach(async (wallet, index) => {
      if (index > 0) await step.sign(wallet, index-1);
    })
  
    tx = await supplyChain.connect(participants[3]).submit(step.getBlockchainFormat());
    expect(tx).to.not.throw;
    newState = await supplyChain.connect(participants[3]).tokenState();
    expect(newState).to.equal(80)
  });

  it('test dispute with non-conforming behaviour', async () => {
    const tokenState = new Array<number>(14).fill(0);
    tokenState[0] = 1;
    let step = new Step({
      from: 0,
      caseID: 0,
      taskID: 0,
      newTokenState: SupplyChainConformance.task(tokenState, 0)
    })
    const replay_later = new Step({...step});
    participants.forEach(async (wallet, index) => {
      if (index > 1) await step.sign(wallet, index-1);
    })
  
    let tx = await supplyChain.connect(participants[1]).submit(step.getBlockchainFormat());
    await expect(tx, 'not all have signed').to.emit(supplyChain, 'DisputeRejectedOf');
    let _newState = await supplyChain.connect(participants[2]).tokenState();
    expect(_newState).to.equal(1);

    participants.forEach(async (wallet, index) => {
      if (index > 0) await step.sign(wallet, index-1);
    })
    tx = await supplyChain.connect(participants[1]).submit(step.getBlockchainFormat());
    await expect(tx, 'all have signed now').to.emit(supplyChain, 'DisputeSucessfullyRaisedBy');
    _newState = await supplyChain.connect(participants[2]).tokenState();
    expect(_newState).to.equal(2);

    step = new Step({
      from: 1,
      caseID: 0,
      taskID: 1,
      newTokenState: SupplyChainConformance.task(tokenState, 1)
    })
    participants.forEach(async (wallet, index) => {
      if (index > 0) await step.sign(wallet, index-1);
    })

    tx = await supplyChain.connect(participants[2]).submit(step.getBlockchainFormat());
    await expect(tx).to.emit(supplyChain, 'DisputeNewStateSubmittedBy');
    expect(tx).to.not.throw;
    let newState = await supplyChain.connect(participants[2]).tokenState();
    expect(newState).to.equal(4)

    tx = await supplyChain.connect(participants[2]).submit(replay_later.getBlockchainFormat());
    await expect(tx, 'try to replay step').to.not.emit(supplyChain, 'DisputeNewStateSubmittedBy');
    newState = await supplyChain.connect(participants[2]).tokenState();
    expect(newState).to.equal(4)
  });

});
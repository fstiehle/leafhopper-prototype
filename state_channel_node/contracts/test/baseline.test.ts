import {ethers, waffle} from 'hardhat';
import chai from 'chai';

import SupplyChainArtifact from '../artifacts/src/baseline/SupplyChain.sol/SupplyChain.json';
import {SupplyChain} from '../typechain/SupplyChain';
import {SignerWithAddress} from '@nomiclabs/hardhat-ethers/signers';
import supplyChainTraces from './traces/supplyChain.json';

const {deployContract} = waffle;
const {expect} = chai;

describe('SupplyChain Contract', () => {
  let participants: SignerWithAddress[];
  let supplyChain: SupplyChain;

  beforeEach(async () => {
    participants = await ethers.getSigners();
    supplyChain = (await deployContract(
      participants[0], 
      SupplyChainArtifact,
      [[
        participants[1].address,
        participants[2].address,
        participants[3].address,
        participants[4].address,
        participants[5].address
      ]]
      )) as SupplyChain;
  });

  it(`replay conforming trace:`, async () => {
    let tx = await supplyChain.connect(participants[1]).begin(0);
    expect(tx).to.not.emit(supplyChain, "NonConformingTrace")

    tx = await supplyChain.connect(participants[2]).begin(1);
    expect(tx).to.not.emit(supplyChain, "NonConformingTrace")

    tx = await supplyChain.connect(participants[3]).begin(3);
    expect(tx).to.not.emit(supplyChain, "NonConformingTrace")

    tx = await supplyChain.connect(participants[3]).begin(5);
    expect(tx).to.not.emit(supplyChain, "NonConformingTrace")

    tx = await supplyChain.connect(participants[4]).begin(7);
    expect(tx).to.not.emit(supplyChain, "NonConformingTrace")

    tx = await supplyChain.connect(participants[5]).begin(8);
    expect(tx).to.not.emit(supplyChain, "NonConformingTrace")

    tx = await supplyChain.connect(participants[4]).begin(9);
    expect(tx).to.not.emit(supplyChain, "NonConformingTrace")

    tx = await supplyChain.connect(participants[5]).begin(10);
    expect(tx).to.not.emit(supplyChain, "NonConformingTrace")

    tx = await supplyChain.connect(participants[2]).begin(11);
    expect(tx).to.not.emit(supplyChain, "NonConformingTrace")

    tx = await supplyChain.connect(participants[2]).begin(12);
    expect(tx).to.not.emit(supplyChain, "NonConformingTrace")
    expect(tx).to.emit(supplyChain, "EndEvent")
  });

  it(`test non-conforming trace:`, async () => {
    let tx = await supplyChain.connect(participants[2]).begin(0);
    expect(tx).to.emit(supplyChain, "NonConformingTrace")
  });

});
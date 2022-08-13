import {ethers, waffle} from 'hardhat';
import chai from 'chai';

import SupplyChainArtifact from '../artifacts/src/baseline/SupplyChain.sol/SupplyChain.json';
import {SupplyChain} from '../typechain/SupplyChain';
import {SignerWithAddress} from '@nomiclabs/hardhat-ethers/signers';

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
    await expect(tx, 'begin(0)').to.not.emit(supplyChain, "NonConformingTrace")

    tx = await supplyChain.connect(participants[2]).begin(1);
    await expect(tx, 'begin(1)').to.not.emit(supplyChain, "NonConformingTrace")

    tx = await supplyChain.connect(participants[3]).begin(3);
    await expect(tx, 'begin(3)').to.not.emit(supplyChain, "NonConformingTrace")

    tx = await supplyChain.connect(participants[3]).begin(5);
    await expect(tx, 'begin(5)').to.not.emit(supplyChain, "NonConformingTrace")

    tx = await supplyChain.connect(participants[5]).begin(7);
    await expect(tx, 'begin(7)').to.not.emit(supplyChain, "NonConformingTrace")

    tx = await supplyChain.connect(participants[4]).begin(8);
    await expect(tx, 'begin(8)').to.not.emit(supplyChain, "NonConformingTrace")

    tx = await supplyChain.connect(participants[4]).begin(9);
    await expect(tx, 'begin(9)').to.not.emit(supplyChain, "NonConformingTrace")

    tx = await supplyChain.connect(participants[5]).begin(10);
    await expect(tx, 'begin(10)').to.not.emit(supplyChain, "NonConformingTrace")

    tx = await supplyChain.connect(participants[2]).begin(11);
    await expect(tx, 'begin(11)').to.not.emit(supplyChain, "NonConformingTrace")

    tx = await supplyChain.connect(participants[2]).begin(12);
    await expect(tx, 'begin(12)').to.not.emit(supplyChain, "NonConformingTrace")
    await expect(tx, 'begin(12)').to.emit(supplyChain, "EndEvent")
  });

  it(`test non-conforming trace:`, async () => {
    let tx = await supplyChain.connect(participants[3]).begin(3);
    await expect(tx, 'begin(0) with wrong participant').to.emit(supplyChain, "NonConformingTrace")
  });

});
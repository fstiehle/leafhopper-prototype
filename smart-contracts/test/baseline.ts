import {ethers, waffle} from 'hardhat';
import chai from 'chai';

import SupplyChainArtifact from '../artifacts/contracts/baseline/SupplyChain.sol/SupplyChain.json';
import {SupplyChain} from '../typechain/SupplyChain';
import {SignerWithAddress} from '@nomiclabs/hardhat-ethers/signers';
import supplyChainTraces from './traces/supplyChain.json';

const {deployContract} = waffle;
const {expect} = chai;

describe('SupplyChain Contract', () => {
  let owner: SignerWithAddress;
  let addr1: SignerWithAddress;

  let supplyChain: SupplyChain;

  beforeEach(async () => {
    [owner, addr1] = await ethers.getSigners();
    supplyChain = (await deployContract(owner, SupplyChainArtifact)) as SupplyChain;
  });

  supplyChainTraces.conforming.forEach(trace => {
    it(`replay conforming trace: [${trace}]`, async () => {
      let tx;
      for (const event of trace) {
        tx = await supplyChain.connect(addr1).begin(event, "0xFF");
        expect(tx).to.not.emit(supplyChain, "NonConformingTrace")
      }
      expect(tx).to.emit(supplyChain, "EndEvent")
    });
  });

  supplyChainTraces.nonConforming.forEach(trace => {
    it(`replay non-conforming trace: [${trace}]`, async () => {
      let tx;
      for (const event of trace) {
        tx = await supplyChain.connect(addr1).begin(event, "0xFF");
      }
      expect(tx).to.not.emit(supplyChain, "EndEvent")
    });
  });
});
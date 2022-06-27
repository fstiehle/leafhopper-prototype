import {ethers, waffle} from 'hardhat';
import chai from 'chai';

import SupplyChainEnactmentArtifact from '../artifacts/contracts/SupplyChainEnactment.sol/SupplyChainEnactment.json';
import {SupplyChainEnactment} from '../typechain/SupplyChainEnactment';
import {SignerWithAddress} from '@nomiclabs/hardhat-ethers/signers';
import supplyChainTraces from './traces/supplyChain.json';

const {deployContract} = waffle;
const {expect} = chai;

describe('SupplyChainEnactment Contract', () => {
  let owner: SignerWithAddress;
  let addr1: SignerWithAddress;

  let supplyChainEnactment: SupplyChainEnactment;

  beforeEach(async () => {
    [owner, addr1] = await ethers.getSigners();
    supplyChainEnactment = (await deployContract(owner, SupplyChainEnactmentArtifact)) as SupplyChainEnactment;
  });

  describe('Test conforming traces', () => {
    supplyChainTraces.conforming.forEach(trace => {
      it("replay conforming log", async () => {
        let tx;
        for (const event of trace) {
          tx = await supplyChainEnactment.connect(addr1).begin(event, "0xFF");
        }
        expect(tx).to.emit(supplyChainEnactment, "EndEvent")
      });
    });
  });
});
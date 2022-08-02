import {ethers, waffle} from 'hardhat';
import chai from 'chai';

import SupplyChainArtifact from '../artifacts/src/baseline/SupplyChain.sol/SupplyChain.json';
import {SupplyChain} from '../typechain/SupplyChain';
import {SignerWithAddress} from '@nomiclabs/hardhat-ethers/signers';
import supplyChainTraces from './traces/supplyChain.json';

const {deployContract} = waffle;
const {expect} = chai;

describe('SupplyChain Contract', () => {
  let owner: SignerWithAddress;
  let bulkBuyer: SignerWithAddress;
  let manufcaturer: SignerWithAddress;
  let middleman: SignerWithAddress;
  let supplier: SignerWithAddress;
  let specialCarrier: SignerWithAddress;

  let supplyChain: SupplyChain;

  beforeEach(async () => {
    [owner, bulkBuyer, manufcaturer, middleman, supplier, specialCarrier] = await ethers.getSigners();
    supplyChain = (await deployContract(
      owner, 
      SupplyChainArtifact,
      [
        bulkBuyer.address,
        manufcaturer.address,
        middleman.address,
        supplier.address,
        specialCarrier.address
      ]
      )) as SupplyChain;
  });

  it(`replay conforming trace:`, async () => {
    let tx = await supplyChain.connect(bulkBuyer).begin(0);
    expect(tx).to.not.emit(supplyChain, "NonConformingTrace")

    tx = await supplyChain.connect(manufcaturer).begin(1);
    expect(tx).to.not.emit(supplyChain, "NonConformingTrace")

    tx = await supplyChain.connect(middleman).begin(3);
    expect(tx).to.not.emit(supplyChain, "NonConformingTrace")

    tx = await supplyChain.connect(middleman).begin(5);
    expect(tx).to.not.emit(supplyChain, "NonConformingTrace")

    tx = await supplyChain.connect(specialCarrier).begin(7);
    expect(tx).to.not.emit(supplyChain, "NonConformingTrace")

    tx = await supplyChain.connect(supplier).begin(8);
    expect(tx).to.not.emit(supplyChain, "NonConformingTrace")

    tx = await supplyChain.connect(supplier).begin(9);
    expect(tx).to.not.emit(supplyChain, "NonConformingTrace")

    tx = await supplyChain.connect(specialCarrier).begin(10);
    expect(tx).to.not.emit(supplyChain, "NonConformingTrace")

    tx = await supplyChain.connect(manufcaturer).begin(11);
    expect(tx).to.not.emit(supplyChain, "NonConformingTrace")

    tx = await supplyChain.connect(manufcaturer).begin(12);
    expect(tx).to.not.emit(supplyChain, "NonConformingTrace")
    expect(tx).to.emit(supplyChain, "EndEvent")
  });

  it(`test non-conforming trace:`, async () => {
    let tx = await supplyChain.connect(manufcaturer).begin(0);
    expect(tx).to.emit(supplyChain, "NonConformingTrace")
  });

});
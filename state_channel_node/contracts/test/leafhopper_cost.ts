import {ethers, network, waffle} from 'hardhat';
import fs from 'fs';
import { parse } from 'json2csv';
import SupplyChainRootArtifact from '../artifacts/src/SupplyChainRoot.sol/SupplyChainRoot.json';
import {SupplyChainRoot} from '../typechain/SupplyChainRoot';
import trace from './traces/supplyChain.json';
import {SignerWithAddress} from '@nomiclabs/hardhat-ethers/signers';

import Step from '../../src/classes/Step';

const {deployContract} = waffle;

const SAVE_TO_FILE = true;

describe('BENCHMARK COST: StateChannelRoot', () => {
  let participants: SignerWithAddress[];
  let supplyChain: SupplyChainRoot;
  const gasCost = new Map<string, number>();

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

  after(async () => {
    const receipt = await supplyChain.deployTransaction.wait(0);
    gasCost.set("Deployment", receipt.gasUsed.toNumber());

    console.log('Gas cost leafhopper');
    console.table(Array.from(gasCost).map(([key, value]) => [key.padStart(32), value]));

    if (SAVE_TO_FILE) {
      let csv;
      try {
        csv = parse(Array.from(gasCost), ['entry', 'cost']);
        console.log(csv);
        fs.writeFile("leafhopper_cost.csv", csv, err => {
          if (err) {
            console.log(err);
          }
        });
      } catch (err) {
        console.error(err);
      }
    }
  })

  it(`best case:`, async () => {
    const endTokenState = new Array<number>(14).fill(0);
    endTokenState[12] = 1;
    const step = new Step({
      from: 1,
      caseID: 0,
      taskID: 12,
      newTokenState: endTokenState
    });
    participants.forEach(async (wallet, index) => {
      if (index > 0) await step.sign(wallet, index-1);
    });
    const tx = await supplyChain.connect(participants[1]).submit(step.getBlockchainFormat());
    const receipt = await tx.wait(0);
    gasCost.set('Best Case (Submit End State)'.padEnd(20), receipt.gasUsed.toNumber());
  });

  it(`average case:`, async () => {
    const endTokenState = new Array<number>(14).fill(0);
    endTokenState[8] = 1;
    const step = new Step({
      from: 4,
      caseID: 0,
      taskID: 7,
      newTokenState: endTokenState
    });
    participants.forEach(async (wallet, index) => {
      if (index > 0) await step.sign(wallet, index-1);
    });
    let tx = await supplyChain.connect(participants[1]).submit(step.getBlockchainFormat());
    let receipt = await tx.wait(0);
    const average_case_cost = receipt.gasUsed.toNumber();

    await network.provider.request({method: "evm_increaseTime", params: [1209601]});
    let begin_cost = 0;
    for (const [task, par] of trace.conforming[0]) {
      if (task <= 7) continue;
      const tx = await supplyChain.connect(participants[par+1]).begin(task);
      const receipt = await tx.wait(0);
      begin_cost += receipt.gasUsed.toNumber();
    }

    gasCost.set('__Submit Dispute State at task 7', average_case_cost);
    gasCost.set('__begin() from 7 to 12', begin_cost);
    gasCost.set('Average cast cost', average_case_cost + begin_cost);
  });

  it(`worst case:`, async () => {
    let tx = await supplyChain.connect(participants[1]).dispute()
    let receipt = await tx.wait(0);
    let worst_case_cost = receipt.gasUsed.toNumber();
    gasCost.set('__Trigger Dispute at Start', worst_case_cost);
    const endTokenState = new Array<number>(14).fill(0);
    endTokenState[2] = 1;
    const step = new Step({
      from: 1,
      caseID: 0,
      taskID: 0,
      newTokenState: endTokenState
    });
    participants.forEach(async (wallet, index) => {
      if (index > 0) await step.sign(wallet, index-1);
    });
    tx = await supplyChain.connect(participants[1]).submit(step.getBlockchainFormat());
    receipt = await tx.wait(0);
    worst_case_cost += receipt.gasUsed.toNumber();
    gasCost.set('__Submit State for Task 0', receipt.gasUsed.toNumber());

    await network.provider.request({method: "evm_increaseTime", params: [1209601]});
    let begin_cost = 0;
    for (const [task, par] of trace.conforming[0]) {
      if (task <= 1) continue;
      const tx = await supplyChain.connect(participants[par+1]).begin(task);
      const receipt = await tx.wait(0);
      begin_cost += receipt.gasUsed.toNumber();
    }

    gasCost.set('__begin() from 0 to 12', begin_cost);
    gasCost.set('Worst cast cost', worst_case_cost + begin_cost);
  });

});
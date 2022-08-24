import {ethers, waffle} from 'hardhat';
import fs from 'fs';
import { parse } from 'json2csv';
import SupplyChainArtifact from '../artifacts/src/baseline/SupplyChain.sol/SupplyChain.json';
import {SupplyChain} from '../typechain/SupplyChain';
import {SignerWithAddress} from '@nomiclabs/hardhat-ethers/signers';
import trace from './traces/supplyChain.json';

const {deployContract} = waffle;
const SAVE_TO_FILE = true;

describe('BENCHMARK COST: Baseline', () => {
  let participants: SignerWithAddress[];
  let supplyChain: SupplyChain;
  const gasCost = new Map<string, number>();

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

  after(async () => {
    const receipt = await supplyChain.deployTransaction.wait(0);
    gasCost.set("Deployment", receipt.gasUsed.toNumber());

    console.log("baseline cost");
    console.table(Array.from(gasCost).map(([key, value]) => [key.padStart(25), value]));

    if (SAVE_TO_FILE) {
      let csv;
      try {
        csv = parse(Array.from(gasCost), ['entry', 'cost']);
        console.log(csv);
        fs.writeFile("baseline_cost.csv", csv, function(err) {
          if (err) {
            console.log(err);
          }
        });
      } catch (err) {
        console.error(err);
      }
    }
  })

  it(`replay conforming trace:`, async () => {
    const begin_gasCost = new Array<number>();
    const cases_gasCost = new Array<number>();
    const repeat = 2;
    for (let index = 0; index < repeat; index++) {
        for (const t of trace.conforming) {
          let case_gasCost = 0;
          for (const [task, par] of t) {
            const tx = await supplyChain.connect(participants[par+1]).begin(task);
            const receipt = await tx.wait(0);
            begin_gasCost.push(receipt.gasUsed.toNumber());
            case_gasCost += receipt.gasUsed.toNumber();
          }
          cases_gasCost.push(case_gasCost);
        }
    }

    console.log('Gas cost baseline.');
    gasCost.set('Mean of ' + begin_gasCost.length + ' begin() calls', mean(begin_gasCost));
    gasCost.set('Mean of ' + cases_gasCost.length + ' case cost', mean(cases_gasCost));
  });

});

// From: https://vhudyma-blog.eu/mean-median-mode-and-range-in-javascript/
const mean = arr => {
  let total = 0;
  for (let i = 0; i < arr.length; i++) {
    total += arr[i];
  }
  return total / arr.length;
};
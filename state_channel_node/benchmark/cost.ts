import leafhopper from '../leafhopper.config';
import Oracle from '../src/classes/Oracle';
import Replayer from './classes/Replayer';
import { ethers } from 'ethers';
import { getProvidersFromConfig } from '../src/helpers/util';
import assert from 'assert';
import Participant from '../src/classes/Participant';
import { Wallet } from '../src/classes/Identity';
import SupplyChainArtifact from '../contracts/artifacts/src/baseline/SupplyChain.sol/SupplyChain.json';
import { SupplyChain } from '../contracts/typechain/SupplyChain';
import SupplyChainConformance from '../src/classes/SupplyChainConformance';

const providers = getProvidersFromConfig(leafhopper.contract);

const reset = async (replayer: Replayer) => {
  const address = replayer.deployContract("stateChannel");
  const oracle = new Oracle(
    address, 
    ethers.Wallet.fromMnemonic(leafhopper.mnemonic), 
    providers
  );
  assert(false === await oracle.isDisputed());
  return oracle;
}

(async () => {
  const replayer = new Replayer();
  const signers = new Map<Participant, Wallet>();
  for (const p of leafhopper.participants) {
    signers.set(p.id, ethers.Wallet.fromMnemonic(p.test_mnemonic));
  }

  let oracle = await reset(replayer);
  let steps = Replayer.getEmptySteps();

  console.log("Assess cost of dispute ...");
  console.log("Worst case scenario");
  console.log("Dispute with one step");
  steps = await Replayer.insertConformingStep(signers, steps, 0);
  assert(true === await oracle.dispute(steps));

  console.log("Submit additional steps ...");
  for (let id = 1; id < 13; id++) {
    if (id === 2 || id === 4 || id === 6) continue;
    steps = await Replayer.insertConformingStep(signers, steps, id);
    assert(true === await oracle.state(steps)); 
  }

  console.log("Cost scaling of dispute")
  let count = 0;
  for (let i = 1; i < 13; i++) {
    count = 0;
    oracle = await reset(replayer);
    steps = Replayer.getEmptySteps();
    for (let j = 0; j < i; j++) {
      if (j === 2 || j === 4 || j === 6) continue;
      steps = await Replayer.insertConformingStep(signers, steps, j);
      count++;
    }
    console.log("Cost of dispute with", count , 'steps');
    assert(true === await oracle.dispute(steps));
  }

  console.log("Cost of baseline")
  // Deploy baseline contract
  const baseline = new ethers.Contract(
    replayer.deployContract("baseline"), 
    SupplyChainArtifact.abi, 
    providers[0]
  ) as SupplyChain;
  const participants = leafhopper.participants.flatMap(p => ethers.Wallet.fromMnemonic(p.test_mnemonic));

  let tx, receipt;
  for (let i = 1; i < 13; i++) {
    if (i === 2 || i === 4 || i === 6) continue;
    tx = await baseline.connect(
      participants[SupplyChainConformance.routing(i)].connect(providers[0])
    ).begin(i);
    receipt = await tx.wait(1);
    console.log("BENCHMARK Gas used for baseline task", i, ":", receipt.gasUsed.toString());
  }

})()
.then(() => process.exit(0))
  .catch((err) => {
    console.error(err.message);
    process.exit(1);
  });
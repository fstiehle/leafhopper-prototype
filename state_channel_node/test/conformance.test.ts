process.env.NODE_ENV = 'test';

import chai from 'chai';
import SupplyChainConformance from '../src/classes/SupplyChainConformance';
import Participant from "../src/classes/Participant";
import RoutingInformation from '../src/classes/RoutingInformation';
import Step from "../src/classes/Step";
import {ethers} from 'ethers';
import traces from './traces/supplyChain.json'
const {expect} = chai;

const participants = new Map<Participant, RoutingInformation>([
  [Participant.BulkBuyer, new RoutingInformation(Participant.BulkBuyer, 'localhost', 9001)],
  [Participant.Manufacturer, new RoutingInformation(Participant.Manufacturer, 'localhost', 9002)],
  [Participant.Middleman, new RoutingInformation(Participant.Middleman, 'localhost', 9003)],
  [Participant.Supplier, new RoutingInformation(Participant.Supplier, 'localhost', 9004)],
  [Participant.SpecialCarrier, new RoutingInformation(Participant.SpecialCarrier, 'localhost', 9005)],
]);

const pubKeys = new Map<Participant, string>();
const keys =  new Map<Participant, ethers.Wallet>();
for (const [participant, _] of participants) {
  const wallet = ethers.Wallet.createRandom();
  keys.set(participant, wallet);
  pubKeys.set(participant, wallet.address)
}

const getNewConformanceService = (participants: Map<Participant, string>) => {
  return new SupplyChainConformance(participants);
}

const getNewStep = async (
  from: Participant,
  conformance: SupplyChainConformance, 
  taskID: number
  ) => {
  const step = new Step({
    from,
    taskID,
    caseID: 0,
    newTokenState: SupplyChainConformance.task(conformance.tokenState, taskID)
  });
  await step.sign(keys.get(from), from);
  return step;
}

describe('Dry test conformance check functions', () => {
  let conformance: SupplyChainConformance;

  beforeEach(() => {
    conformance = getNewConformanceService(pubKeys);
  });

  it('test token game by replaying conforming traces', (done) => {
    for (const trace of traces.conforming) {
      const tokenState: number[] = [...conformance.tokenState];
      for (const taskID of trace) {
        const prevtokenState = [...tokenState];
        expect(
          SupplyChainConformance.task(tokenState, taskID)
          ).to.not.eql(prevtokenState)
      }
      const endState = Array<number>(14).fill(0);
      endState[13] = 1;
      expect(tokenState).to.eql(endState);
    }
    done();
  });

  it('test token game by replaying non-conforming traces', (done) => {
    for (const trace of traces.nonConforming) {
      const tokenState: number[] = [...conformance.tokenState];
      for (const taskID of trace) {
        SupplyChainConformance.task(tokenState, taskID);
      }
      const endState = Array<number>(14).fill(0);
      endState[13] = 1;
      expect(tokenState).to.not.eql(endState);
    }
    done();
  });

  it('try to submit a task twice', (done) => {
    const tokenState: number[] = [...conformance.tokenState];
    SupplyChainConformance.task(tokenState, 0);
    SupplyChainConformance.task(tokenState, 1);
    const prevtokenState = [...tokenState];
    expect(
      SupplyChainConformance.task(tokenState, 1)
    ).to.eql(prevtokenState);
    done();
  });
  
});
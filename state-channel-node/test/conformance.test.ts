process.env.NODE_ENV = 'test';

import chai from 'chai';
import SupplyChainConformance from '../src/services/SupplyChainConformance';
import { Participants } from '../src/services/RoutingInformation';
import { RoutingInformation } from '../src/services/RoutingInformation';
import { Step } from '../src/services/ConformanceCheck';
import traces from './traces/supplyChain.json'

const {expect} = chai;

const participants = new Map<Participants, RoutingInformation>([
  [Participants.BulkBuyer, new RoutingInformation(Participants.BulkBuyer, 'localhost', 9001)],
  [Participants.Manufacturer, new RoutingInformation(Participants.Manufacturer, 'localhost', 9002)],
  [Participants.Middleman, new RoutingInformation(Participants.Middleman, 'localhost', 9003)],
  [Participants.Supplier, new RoutingInformation(Participants.Supplier, 'localhost', 9004)],
  [Participants.SpecialCarrier, new RoutingInformation(Participants.SpecialCarrier, 'localhost', 9005)],
]);

const configureConformanceService = (participants: Map<Participants, RoutingInformation>) => {
  return new SupplyChainConformance([
    participants.get(Participants.Manufacturer),
    participants.get(Participants.BulkBuyer),
    participants.get(Participants.Supplier),
    participants.get(Participants.SpecialCarrier),
    participants.get(Participants.Supplier),
    participants.get(Participants.SpecialCarrier),
    participants.get(Participants.SpecialCarrier),
    participants.get(Participants.Manufacturer),
    participants.get(Participants.BulkBuyer),
    participants.get(Participants.BulkBuyer)]);
}

const getNewStepBlueprint = (taskID: number) => {
  const step = new Step({
    caseID: 0,
    taskID: taskID,
    salt: "x",
    signature: "x"
  });
  return step;
}

describe('Dry test conformance check functions', () => {
  let conformance: SupplyChainConformance;

  beforeEach(() => {
    conformance = configureConformanceService(participants);
  });

  it('test conforming steps, where the middleman sends the message first to the supplier', (done) => {
    let nextStep = getNewStepBlueprint(0);
    const manufacturer = configureConformanceService(participants);
    // Bulk Buyer to Manufacturer
    expect(manufacturer.checkStep(nextStep), "test checkStep").to.be.true
    expect(manufacturer.step(nextStep, []), "0: Bulk Buyer to Manufacturer").to.be.true;

    // Manufacturer to Middleman
    nextStep = getNewStepBlueprint(1);
    const middleman = configureConformanceService(participants);
    expect(middleman.step(nextStep, manufacturer.steps), "1: Manufacturer to Middleman").to.be.true;

    // Middleman to Supplier
    nextStep = getNewStepBlueprint(3);

    const supplier = configureConformanceService(participants);
    expect(supplier.step(nextStep, middleman.steps), "3: Middleman to Supplier").to.be.true;

    // Middleman has to wait for his ack so the step can be added before 
    // it is submitted to the special carrier
    // Middleman to Special Carrier
    nextStep = getNewStepBlueprint(5);

    const specialCarrier = configureConformanceService(participants);
    expect(specialCarrier.step(nextStep, middleman.steps), "5: Middleman to Special Carrier").to.be.true;

    // SpecialCarrier to Supplier
    nextStep = getNewStepBlueprint(7);
    expect(supplier.step(nextStep, specialCarrier.steps), "7: SpecialCarrier to Supplier").to.be.true;

    done();
  });

  it('test conforming steps, where the middleman sends the message first to the special carrier', (done) => {
    let nextStep = getNewStepBlueprint(0);
    const manufacturer = configureConformanceService(participants);
    // Bulk Buyer to Manufacturer
    expect(manufacturer.checkStep(nextStep), "test checkStep").to.be.true
    expect(manufacturer.step(nextStep, []), "0: Bulk Buyer to Manufacturer").to.be.true;

    // Manufacturer to Middleman
    nextStep = getNewStepBlueprint(1);
    const middleman = configureConformanceService(participants);
    expect(middleman.step(nextStep, manufacturer.steps), "1: Manufacturer to Middleman").to.be.true;

    // Middleman to Special Carrier
    nextStep = getNewStepBlueprint(5);
    const specialCarrier = configureConformanceService(participants);
    expect(specialCarrier.step(nextStep, middleman.steps), "5: Middleman to Special Carrier").to.be.true;

    // Middleman to Supplier
    nextStep = getNewStepBlueprint(3);
    const supplier = configureConformanceService(participants);
    expect(supplier.step(nextStep, middleman.steps), "3: Middleman to Supplier").to.be.true;

    // SpecialCarrier to Supplier
    nextStep = getNewStepBlueprint(7);

    expect(supplier.step(nextStep, specialCarrier.steps), "7: SpecialCarrier to Supplier").to.be.true;

    // Supplier to SpecialCarrier
    nextStep = getNewStepBlueprint(8);
    expect(specialCarrier.step(nextStep, supplier.steps), "8: Supplier to SpecialCarrier").to.be.true;
 
    done();
  });

  it('test non-conforming steps, where the supplier or the special carrier try to hide their involvement', (done) => {
    let nextStep = getNewStepBlueprint(0);
    const manufacturer = configureConformanceService(participants);
    // Bulk Buyer to Manufacturer
    expect(manufacturer.checkStep(nextStep), "test checkStep").to.be.true
    expect(manufacturer.step(nextStep, []), "0: Bulk Buyer to Manufacturer").to.be.true;

    // Manufacturer to Middleman
    nextStep = getNewStepBlueprint(1);
    const middleman = configureConformanceService(participants);
    expect(middleman.step(nextStep, manufacturer.steps), "1: Manufacturer to Middleman").to.be.true;

    // Middleman to Special Carrier
    nextStep = getNewStepBlueprint(5);

    const specialCarrier = configureConformanceService(participants);
    expect(specialCarrier.step(nextStep, middleman.steps), "5: Middleman to Special Carrier").to.be.true;

    // Middleman to Supplier
    nextStep = getNewStepBlueprint(3);
    const supplier = configureConformanceService(participants);
    expect(supplier.step(nextStep, middleman.steps), "3: Middleman to Supplier").to.be.true;

    // SpecialCarrier to Supplier
    // SpecialCarrier tries to hide his involvement in the AND Fork
    specialCarrier.steps[5] = undefined;
    nextStep = getNewStepBlueprint(7);
    expect(supplier.step(nextStep, specialCarrier.steps), "7: SpecialCarrier to Supplier").to.be.false;

    // Supplier to SpecialCarrier
    // Now, Supplier tries to hide his involvement in the AND Fork
    nextStep = getNewStepBlueprint(8);
    supplier.steps[3] = undefined;
    expect(specialCarrier.step(nextStep, supplier.steps), "7: SpecialCarrier to Supplier").to.be.false;

    done();
  });

  it('test conforming traces', (done) => {
    for (const trace of traces.conforming) {
      const tokenState: number[] = [...conformance.tokenState];
      for (const taskID of trace) {
        const prevtokenState = {...tokenState};
        expect(
          conformance.task(tokenState, taskID)
          ).to.not.eq(prevtokenState)
      }
      const endState = Array<number>(14).fill(0);
      endState[13] = 1;
      expect(tokenState).to.eql(endState);
    }
    done();
  });

});
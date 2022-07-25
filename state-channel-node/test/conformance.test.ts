process.env.NODE_ENV = 'test';

import chai from 'chai';
import SupplyChainConformance from '../src/classes/SupplyChainConformance';
import Participant from "../src/classes/Participant";
import RoutingInformation from '../src/classes/RoutingInformation';
import Step from "../src/classes/Step";
import crypto from "crypto";
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
const keys =  new Map<Participant, [string, string]>();
for (const [participant, routingInformation] of participants) {
  const { publicKey, privateKey } = crypto.generateKeyPairSync("rsa", {
    // The standard secure default length for RSA keys is 2048 bits
    modulusLength: 4096,
    publicKeyEncoding: {
      type: 'spki',
      format: 'pem'
    },
    privateKeyEncoding: {
      type: 'pkcs8',
      format: 'pem',
      cipher: 'aes-256-cbc',
      passphrase: 'test'
    }
  });
  routingInformation.pubKey = publicKey;
  keys.set(participant, [publicKey, privateKey]);
  pubKeys.set(participant, publicKey)
}

const getNewConformanceService = (participants: Map<Participant, string>) => {
  return new SupplyChainConformance(participants);
}

const getNewStep = (from: Participant, taskID: number) => {
  const step = new Step({
    from,
    taskID,
    caseID: 0
  });
  const [_, privateKey] = keys.get(from);
  step.sign(privateKey, 'test')
  return step;
}

describe('Dry test conformance check functions', () => {
  let conformance: SupplyChainConformance;

  beforeEach(() => {
    conformance = getNewConformanceService(pubKeys);
  });

  it('test conforming steps, where the middleman sends the message first to the supplier', (done) => {
    let nextStep = getNewStep(Participant.BulkBuyer, 0);
    const manufacturer = getNewConformanceService(pubKeys);
    // Bulk Buyer to Manufacturer
    expect(manufacturer.checkStep(nextStep), "test checkStep").to.be.true
    expect(manufacturer.step(nextStep, []), "0: Bulk Buyer to Manufacturer").to.be.true;

    // Manufacturer to Middleman
    nextStep = getNewStep(Participant.Manufacturer, 1);
    const middleman = getNewConformanceService(pubKeys);
    expect(middleman.step(nextStep, manufacturer.steps), "1: Manufacturer to Middleman").to.be.true;

    // Middleman to Supplier
    nextStep = getNewStep(Participant.Middleman, 3);

    const supplier = getNewConformanceService(pubKeys);
    expect(supplier.step(nextStep, middleman.steps), "3: Middleman to Supplier").to.be.true;

    // Middleman has to wait for his ack so the step can be added before 
    // it is submitted to the special carrier
    // Middleman to Special Carrier
    nextStep = getNewStep(Participant.Middleman, 5);

    const specialCarrier = getNewConformanceService(pubKeys);
    expect(specialCarrier.step(nextStep, middleman.steps), "5: Middleman to Special Carrier").to.be.true;

    // SpecialCarrier to Supplier
    nextStep = getNewStep(Participant.SpecialCarrier, 7);
    expect(supplier.step(nextStep, specialCarrier.steps), "7: SpecialCarrier to Supplier").to.be.true;

    done();
  });

  it('test conforming steps, where the middleman sends the message first to the special carrier', (done) => {
    let nextStep = getNewStep(Participant.BulkBuyer, 0);
    const manufacturer = getNewConformanceService(pubKeys);
    // Bulk Buyer to Manufacturer
    expect(manufacturer.checkStep(nextStep), "test checkStep").to.be.true
    expect(manufacturer.step(nextStep, []), "0: Bulk Buyer to Manufacturer").to.be.true;

    // Manufacturer to Middleman
    nextStep = getNewStep(Participant.Manufacturer, 1);
    const middleman = getNewConformanceService(pubKeys);
    expect(middleman.step(nextStep, manufacturer.steps), "1: Manufacturer to Middleman").to.be.true;

    // Middleman to Special Carrier
    nextStep = getNewStep(Participant.Middleman, 5);
    const specialCarrier = getNewConformanceService(pubKeys);
    expect(specialCarrier.step(nextStep, middleman.steps), "5: Middleman to Special Carrier").to.be.true;

    // Middleman to Supplier
    nextStep = getNewStep(Participant.Middleman, 3);
    const supplier = getNewConformanceService(pubKeys);
    expect(supplier.step(nextStep, middleman.steps), "3: Middleman to Supplier").to.be.true;

    // SpecialCarrier to Supplier
    nextStep = getNewStep(Participant.SpecialCarrier, 7);

    expect(supplier.step(nextStep, specialCarrier.steps), "7: SpecialCarrier to Supplier").to.be.true;

    // Supplier to SpecialCarrier
    nextStep = getNewStep(Participant.Supplier, 8);
    expect(specialCarrier.step(nextStep, supplier.steps), "8: Supplier to SpecialCarrier").to.be.true;
 
    done();
  });

  it('test non-conforming steps, where the supplier or the special carrier try to hide their involvement', (done) => {
    let nextStep = getNewStep(Participant.BulkBuyer, 0);
    const manufacturer = getNewConformanceService(pubKeys);
    // Bulk Buyer to Manufacturer
    expect(manufacturer.checkStep(nextStep), "test checkStep").to.be.true
    expect(manufacturer.step(nextStep, []), "0: Bulk Buyer to Manufacturer").to.be.true;

    // Manufacturer to Middleman
    nextStep = getNewStep(Participant.Manufacturer, 1);
    const middleman = getNewConformanceService(pubKeys);
    expect(middleman.step(nextStep, manufacturer.steps), "1: Manufacturer to Middleman").to.be.true;

    // Middleman to Special Carrier
    nextStep = getNewStep(Participant.Middleman, 5);

    const specialCarrier = getNewConformanceService(pubKeys);
    expect(specialCarrier.step(nextStep, middleman.steps), "5: Middleman to Special Carrier").to.be.true;

    // Middleman to Supplier
    nextStep = getNewStep(Participant.Middleman, 3);
    const supplier = getNewConformanceService(pubKeys);
    expect(supplier.step(nextStep, middleman.steps), "3: Middleman to Supplier").to.be.true;

    // SpecialCarrier to Supplier
    // SpecialCarrier tries to hide his involvement in the AND Fork
    specialCarrier.steps[5] = undefined;
    nextStep = getNewStep(Participant.SpecialCarrier, 7);
    expect(supplier.step(nextStep, specialCarrier.steps), "7: SpecialCarrier to Supplier").to.be.false;

    // Supplier to SpecialCarrier
    // Now, Supplier tries to hide his involvement in the AND Fork
    nextStep = getNewStep(Participant.Supplier, 8);
    supplier.steps[3] = undefined;
    expect(specialCarrier.step(nextStep, supplier.steps), "7: SpecialCarrier to Supplier").to.be.false;

    done();
  });

  it('test token game by replaying conforming traces', (done) => {
    for (const trace of traces.conforming) {
      const tokenState: number[] = [...conformance.tokenState];
      for (const taskID of trace) {
        const prevtokenState = [...tokenState];
        expect(
          conformance.task(tokenState, taskID)
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
        conformance.task(tokenState, taskID);
      }
      const endState = Array<number>(14).fill(0);
      endState[13] = 1;
      expect(tokenState).to.not.eql(endState);
    }
    done();
  });

  it('try to submit a task twice', (done) => {
    const tokenState: number[] = [...conformance.tokenState];
    conformance.task(tokenState, 0);
    conformance.task(tokenState, 1);
    const prevtokenState = [...tokenState];
    expect(
      conformance.task(tokenState, 1)
    ).to.eql(prevtokenState);
    done();
  });
  
});
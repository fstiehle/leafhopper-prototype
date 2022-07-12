process.env.NODE_ENV = 'test';

import chai from 'chai';
import SupplyChainConformance from '../src/services/SupplyChainConformance';
import Participant from "../src/services/Participant";
import RoutingInformation from '../src/services/RoutingInformation';
import Step from "../src/services/Step";
import crypto, { sign } from "crypto";
import traces from './traces/supplyChain.json'
const {expect} = chai;

const participants = new Map<Participant, RoutingInformation>([
  [Participant.BulkBuyer, new RoutingInformation(Participant.BulkBuyer, 'localhost', 9001)],
  [Participant.Manufacturer, new RoutingInformation(Participant.Manufacturer, 'localhost', 9002)],
  [Participant.Middleman, new RoutingInformation(Participant.Middleman, 'localhost', 9003)],
  [Participant.Supplier, new RoutingInformation(Participant.Supplier, 'localhost', 9004)],
  [Participant.SpecialCarrier, new RoutingInformation(Participant.SpecialCarrier, 'localhost', 9005)],
]);

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
      passphrase: 'test environment ' + participant
    }
  });
  routingInformation.pubKey = publicKey;
  keys.set(participant, [publicKey, privateKey]);
}

const getNewConformanceService = (participants: Map<Participant, RoutingInformation>) => {
  return new SupplyChainConformance([
    participants.get(Participant.Manufacturer),
    participants.get(Participant.BulkBuyer),
    participants.get(Participant.Supplier),
    participants.get(Participant.SpecialCarrier),
    participants.get(Participant.Supplier),
    participants.get(Participant.SpecialCarrier),
    participants.get(Participant.SpecialCarrier),
    participants.get(Participant.Manufacturer),
    participants.get(Participant.BulkBuyer),
    participants.get(Participant.BulkBuyer)]);
}

const getNewStep = (from: Participant, taskID: number) => {
  const step = new Step({
    from,
    taskID,
    caseID: 0,
    salt: "x",
    signature: "x"
  });
  const [_, privateKey] = keys.get(from);
  step.sign(privateKey)
  return step;
}

describe('Dry test conformance check functions', () => {
  let conformance: SupplyChainConformance;

  beforeEach(() => {
    conformance = getNewConformanceService(participants);
  });

  it('test conforming steps, where the middleman sends the message first to the supplier', (done) => {
    let nextStep = getNewStep(Participant.BulkBuyer, 0);
    const manufacturer = getNewConformanceService(participants);
    // Bulk Buyer to Manufacturer
    expect(manufacturer.checkStep(nextStep), "test checkStep").to.be.true
    expect(manufacturer.step(nextStep, []), "0: Bulk Buyer to Manufacturer").to.be.true;

    // Manufacturer to Middleman
    nextStep = getNewStep(Participant.Manufacturer, 1);
    const middleman = getNewConformanceService(participants);
    expect(middleman.step(nextStep, manufacturer.steps), "1: Manufacturer to Middleman").to.be.true;

    // Middleman to Supplier
    nextStep = getNewStep(Participant.Middleman, 3);

    const supplier = getNewConformanceService(participants);
    expect(supplier.step(nextStep, middleman.steps), "3: Middleman to Supplier").to.be.true;

    // Middleman has to wait for his ack so the step can be added before 
    // it is submitted to the special carrier
    // Middleman to Special Carrier
    nextStep = getNewStep(Participant.Middleman, 5);

    const specialCarrier = getNewConformanceService(participants);
    expect(specialCarrier.step(nextStep, middleman.steps), "5: Middleman to Special Carrier").to.be.true;

    // SpecialCarrier to Supplier
    nextStep = getNewStep(Participant.SpecialCarrier, 7);
    expect(supplier.step(nextStep, specialCarrier.steps), "7: SpecialCarrier to Supplier").to.be.true;

    done();
  });

  it('test conforming steps, where the middleman sends the message first to the special carrier', (done) => {
    let nextStep = getNewStep(Participant.BulkBuyer, 0);
    const manufacturer = getNewConformanceService(participants);
    // Bulk Buyer to Manufacturer
    expect(manufacturer.checkStep(nextStep), "test checkStep").to.be.true
    expect(manufacturer.step(nextStep, []), "0: Bulk Buyer to Manufacturer").to.be.true;

    // Manufacturer to Middleman
    nextStep = getNewStep(Participant.Manufacturer, 1);
    const middleman = getNewConformanceService(participants);
    expect(middleman.step(nextStep, manufacturer.steps), "1: Manufacturer to Middleman").to.be.true;

    // Middleman to Special Carrier
    nextStep = getNewStep(Participant.Middleman, 5);
    const specialCarrier = getNewConformanceService(participants);
    expect(specialCarrier.step(nextStep, middleman.steps), "5: Middleman to Special Carrier").to.be.true;

    // Middleman to Supplier
    nextStep = getNewStep(Participant.Middleman, 3);
    const supplier = getNewConformanceService(participants);
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
    const manufacturer = getNewConformanceService(participants);
    // Bulk Buyer to Manufacturer
    expect(manufacturer.checkStep(nextStep), "test checkStep").to.be.true
    expect(manufacturer.step(nextStep, []), "0: Bulk Buyer to Manufacturer").to.be.true;

    // Manufacturer to Middleman
    nextStep = getNewStep(Participant.Manufacturer, 1);
    const middleman = getNewConformanceService(participants);
    expect(middleman.step(nextStep, manufacturer.steps), "1: Manufacturer to Middleman").to.be.true;

    // Middleman to Special Carrier
    nextStep = getNewStep(Participant.Middleman, 5);

    const specialCarrier = getNewConformanceService(participants);
    expect(specialCarrier.step(nextStep, middleman.steps), "5: Middleman to Special Carrier").to.be.true;

    // Middleman to Supplier
    nextStep = getNewStep(Participant.Middleman, 3);
    const supplier = getNewConformanceService(participants);
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
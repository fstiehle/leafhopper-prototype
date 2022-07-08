process.env.NODE_ENV = 'test';

import chai from 'chai';
import SupplyChainConformance from '../src/services/SupplyChainConformance';
import { Participants } from '../src/services/RoutingInformation';
import { RoutingInformation } from '../src/services/RoutingInformation';
import { Step } from '../src/services/ConformanceCheck';

const {expect} = chai;

describe('Dry test conformance check functions', () => {
  let conformance: SupplyChainConformance;

  const participants = new Map<Participants, RoutingInformation>([
    [Participants.BulkBuyer, new RoutingInformation(Participants.BulkBuyer, 'localhost', 9001)],
    [Participants.Manufacturer, new RoutingInformation(Participants.Manufacturer, 'localhost', 9002)],
    [Participants.Middleman, new RoutingInformation(Participants.Middleman, 'localhost', 9003)],
    [Participants.Supplier, new RoutingInformation(Participants.Supplier, 'localhost', 9004)],
    [Participants.SpecialCarrier, new RoutingInformation(Participants.SpecialCarrier, 'localhost', 9005)],
  ]);

  conformance = new SupplyChainConformance([
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

  it('test conforming steps', (done) => {
    conformance.steps = [new Step(0,0,[0],"","")]
    expect(conformance.check(new Step(0,1,[0,1],"",""), [new Step(0,0,[0],"","")]), "test conforming behaviour").to.be.true
    
    conformance.steps = [new Step(0,1,[0],"","")]
    expect(conformance.check(new Step(0,1,[0,1],"",""), [new Step(0,0,[0],"","")]), "test non-equal steps").to.be.false
   
    conformance.steps = [new Step(0,0,[0],"",""), new Step(0,0,[0],"","")]
    expect(conformance.check(new Step(0,1,[0,1],"",""), [new Step(0,0,[0],"","")]), "test more steps").to.be.false
   
    conformance.steps = [new Step(0,0,[0],"","")]
    expect(conformance.check(new Step(0,1,[0,1],"",""), [new Step(0,0,[0],"",""),, new Step(0,0,[0],"","")]), "test more previous steps").to.be.false
   
    done();
  });

});


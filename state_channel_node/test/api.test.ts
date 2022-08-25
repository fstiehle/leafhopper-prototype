process.env.NODE_ENV = 'test';
import fs from 'fs';
import express from 'express';
import chai from 'chai';
import chaiHttp from 'chai-http';
import https from 'https';
import {ethers} from 'ethers';
import { configureServer } from '../src/helpers/util';
import Participant from '../src/classes/Participant';
import RoutingInformation from '../src/classes/RoutingInformation';
import SupplyChainRouting from '../src/classes/SupplyChainRouting';
import SupplyChainConformance from '../src/classes/SupplyChainConformance';
import { Server } from 'node:http';
import Oracle from '../src/classes/Oracle';
import RequestServer from '../src/classes/RequestServer';
import Step from '../src/classes/Step';
const {expect} = chai;

// ignore certificate not signed for localhost
process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = '0'; 

chai.use(chaiHttp);
describe('/begin and /step', () => {
  let keys: Map<Participant, ethers.Wallet>;
  let servers: Map<Participant, Server>;
  let participants: Map<Participant, RoutingInformation>;
  let rootCA: string;
  let prevSteps: Step[];

  before(() => {
    participants = new Map<Participant, RoutingInformation>([
      [Participant.BulkBuyer, new RoutingInformation(Participant.BulkBuyer, 'localhost', 9001)],
      [Participant.Manufacturer, new RoutingInformation(Participant.Manufacturer, 'localhost', 9002)],
      [Participant.Middleman, new RoutingInformation(Participant.Middleman, 'localhost', 9003)],
      [Participant.Supplier, new RoutingInformation(Participant.Supplier, 'localhost', 9004)],
      [Participant.SpecialCarrier, new RoutingInformation(Participant.SpecialCarrier, 'localhost', 9005)],
    ]);
    try {
      rootCA = fs.readFileSync('./keys/rootCA.crt').toString();
    } catch (err) {
      console.error(err);
    }
  })

  beforeEach(() => {
    servers = new Map<Participant, Server>();
    keys = new Map<Participant, ethers.Wallet>();
    const pubKeys = new Map<Participant, string>();
    prevSteps = new Array<Step>();

    for (const [participant, routingInformation] of participants) {
      let sK, cert;
      try {
        sK = fs.readFileSync('./keys/' + participant + '.key').toString();
        cert = fs.readFileSync('./keys/' + participant + '.crt').toString();
      } catch (err) {
        console.error(err);
      }

      const wallet = ethers.Wallet.createRandom();
      keys.set(participant, wallet);
      pubKeys.set(participant, wallet.address)

      const app = configureServer(
        express(), 
        {
          me: participant,
          wallet: wallet
        },
        new SupplyChainRouting(participants),
        new SupplyChainConformance(pubKeys),
        new Oracle(null, wallet, [ethers.providers.getDefaultProvider()]),
        new RequestServer(rootCA)
      );

      const httpsServer = https.createServer({cert: cert, key: sK, ca: rootCA}, app)
      .listen(routingInformation.port, () => console.log(`${participant} Running on ${routingInformation.port} ⚡`))
      servers.set(participant, httpsServer);
    }
  })

  afterEach(() => {
    for (const [_, server] of servers) {
      server.close();
    }
  });

  it('test with conforming behaviour', async () => {
    // Bulk Buyer to Manufacturer
    await chai.request('https://localhost:' + participants.get(Participant.BulkBuyer).port)
      .post('/begin/0')
      .ca(Buffer.from(rootCA))
      .set('content-type', 'application/json')
      .then(res => {
        expect(res).to.have.status(200);
        expect(res.body.step).to.have.property('signature');
        prevSteps.push(new Step(res.body.step));
      })
      .catch(err => {
        console.log(err);
        expect(err).to.be.null;
     });

    // Manufacturer to Middleman
    await chai.request('https://localhost:' + participants.get(Participant.Manufacturer).port)
      .post('/begin/1')
      .ca(Buffer.from(rootCA))
      .set('content-type', 'application/json')
      .send(JSON.stringify({prevSteps: [prevSteps[0]]}))
      .then(res => {
        expect(res).to.have.status(200);
        prevSteps.push(new Step(res.body.step));
      })
      .catch(err => {
        expect(err).to.be.null;
        console.log(err);
     });

    
    // Middleman to Supplier
    await chai.request('https://localhost:' + participants.get(Participant.Middleman).port)
    .post('/begin/3')
    .ca(Buffer.from(rootCA))
    .set('content-type', 'application/json')
    .send(JSON.stringify({prevSteps: [prevSteps[1]]}))
    .then(res => {
      expect(res).to.have.status(200);
      prevSteps.push(new Step(res.body.step));
    })
    .catch(err => {
      expect(err).to.be.null;
      console.log(err);
    });

    // Middleman to SpecialCarrier
    await chai.request('https://localhost:' + participants.get(Participant.Middleman).port)
    .post('/begin/5')
    .ca(Buffer.from(rootCA))
    .set('content-type', 'application/json')
    .send(JSON.stringify({prevSteps: [prevSteps[2]]}))
    .then(res => {
      expect(res).to.have.status(200);
      prevSteps.push(new Step(res.body.step));
    })
    .catch(err => {
      expect(err).to.be.null;
      console.log(err);
    });

    // SpecialCarrier to Supplier
    await chai.request('https://localhost:' + participants.get(Participant.SpecialCarrier).port)
    .post('/begin/7')
    .ca(Buffer.from(rootCA))
    .set('content-type', 'application/json')
    .send(JSON.stringify({prevSteps: [prevSteps[3]]}))
    .then(res => {
      expect(res).to.have.status(200);
      prevSteps.push(new Step(res.body.step));
    })
    .catch(err => {
      expect(err).to.be.null;
      console.log(err);
    });
  });

  it('test with non-conforming behaviour', async () => {
    // Bulk Buyer to Manufacturer
    let prevStep;
    await chai.request('https://localhost:' + participants.get(Participant.BulkBuyer).port)
      .post('/begin/0')
      .ca(Buffer.from(rootCA))
      .then(res => {
        expect(res).to.have.status(200);
        prevSteps.push(new Step(res.body.step));
      })
      .catch(err => {
        console.log(err);
        expect(err).to.be.null;
     });

    // Manufacturer to Middleman
    await chai.request('https://localhost:' + participants.get(Participant.Manufacturer).port)
      .post('/begin/1')
      .ca(Buffer.from(rootCA))
      .set('content-type', 'application/json')
      .send(JSON.stringify({prevSteps: [prevSteps.pop()]}))
      .then(res => {
        expect(res).to.have.status(200);
        prevSteps.push(new Step(res.body.step));
      })
      .catch(err => {
        expect(err).to.be.null;
        console.log(err);
     });

    // Middleman to Supplier
    // Skip

    // Middleman to SpecialCarrier
    await chai.request('https://localhost:' + participants.get(Participant.Middleman).port)
    .post('/begin/5')
    .ca(Buffer.from(rootCA))
    .set('content-type', 'application/json')
    .send(JSON.stringify({prevSteps: [prevSteps.pop()]}))
    .then(res => {
      expect(res).to.have.status(200);
      prevSteps.push(new Step(res.body.step));
    })
    .catch(err => {
      expect(err).to.be.null;
      console.log(err);
    });

    // SpecialCarrier to Supplier
    await chai.request('https://localhost:' + participants.get(Participant.SpecialCarrier).port)
    .post('/begin/7')
    .ca(Buffer.from(rootCA))
    .set('content-type', 'application/json')
    .send(JSON.stringify({prevSteps: [prevSteps.pop()]}))
    .then(res => {
      expect(res).to.have.status(500);
    })
    .catch(err => {
      expect(err).to.be.null;
      console.log(err);
    });
  });
});
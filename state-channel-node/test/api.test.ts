process.env.NODE_ENV = 'test';

import express from 'express';
import chai from 'chai';
import chaiHttp from 'chai-http';
import {ethers} from 'ethers';
import { configureServer } from '../src/helpers/util';
import Participant from '../src/classes/Participant';
import RoutingInformation from '../src/classes/RoutingInformation';
import SupplyChainRouting from '../src/classes/SupplyChainRouting';
import SupplyChainConformance from '../src/classes/SupplyChainConformance';
import { Server } from 'node:http';
const {expect} = chai;

chai.use(chaiHttp);
describe('/begin and /step', () => {
  let keys: Map<Participant, ethers.Wallet>;
  let servers: Map<Participant, Server>;
  let participants: Map<Participant, RoutingInformation>;

  before(() => {
    participants = new Map<Participant, RoutingInformation>([
      [Participant.BulkBuyer, new RoutingInformation(Participant.BulkBuyer, 'localhost', 9001)],
      [Participant.Manufacturer, new RoutingInformation(Participant.Manufacturer, 'localhost', 9002)],
      [Participant.Middleman, new RoutingInformation(Participant.Middleman, 'localhost', 9003)],
      [Participant.Supplier, new RoutingInformation(Participant.Supplier, 'localhost', 9004)],
      [Participant.SpecialCarrier, new RoutingInformation(Participant.SpecialCarrier, 'localhost', 9005)],
    ]);
    
    servers = new Map<Participant, Server>();
    keys = new Map<Participant, ethers.Wallet>();
    const pubKeys = new Map<Participant, string>();
    for (const [participant, routingInformation] of participants) {
      const wallet = ethers.Wallet.createRandom();
      routingInformation.address = wallet.address;
      keys.set(participant, wallet);
      pubKeys.set(participant, wallet.address)
      servers.set(
        participant, 
        configureServer(express(), {
          me: participant,
          wallet: wallet
        },
        new SupplyChainRouting(participants),
        new SupplyChainConformance(pubKeys)
        )
        .listen(routingInformation.port, () => console.log(`${participant} Running on ${routingInformation.port} ⚡`))
      );
    }
  })

  after(() => {
    for (const [_, server] of servers) {
      server.close();
    }
  });

  it('test with conforming behaviour', async () => {
    // Bulk Buyer to Manufacturer
    await chai.request('http://localhost:' + participants.get(Participant.BulkBuyer).port)
      .get('/begin/0')
      .then(res => {
        expect(res).to.have.status(200);
      })
      .catch(err => {
        expect(err).to.be.null;
        console.log(err);
     });
     

    // Manufacturer to Middleman
    await chai.request('http://localhost:' + participants.get(Participant.Manufacturer).port)
      .get('/begin/1')
      .then(res => {
        expect(res).to.have.status(200);
      })
      .catch(err => {
        expect(err).to.be.null;
        console.log(err);
     });

    // Middleman to Supplier
    await chai.request('http://localhost:' + participants.get(Participant.Middleman).port)
    .get('/begin/3')
    .then(res => {
      expect(res).to.have.status(200);
    })
    .catch(err => {
      expect(err).to.be.null;
      console.log(err);
    });

    // Middleman to SpecialCarrier
    await chai.request('http://localhost:' + participants.get(Participant.Middleman).port)
    .get('/begin/5')
    .then(res => {
      expect(res).to.have.status(200);
    })
    .catch(err => {
      expect(err).to.be.null;
      console.log(err);
    });

    // SpecialCarrier to Supplier
    await chai.request('http://localhost:' + participants.get(Participant.SpecialCarrier).port)
    .get('/begin/7')
    .then(res => {
      expect(res).to.have.status(200);
    })
    .catch(err => {
      expect(err).to.be.null;
      console.log(err);
    });
  });
});
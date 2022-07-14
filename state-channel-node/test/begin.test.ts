process.env.NODE_ENV = 'test';

import express, { Express, Request, Response } from 'express';
import chai from 'chai';
import chaiHttp from 'chai-http';
import crypto from 'crypto';
import { configureServer } from '../src/helpers/util';
import Participant from '../src/classes/Participant';
import RoutingInformation from '../src/classes/RoutingInformation';
import SupplyChainRouting from '../src/classes/SupplyChainRouting';
import SupplyChainConformance from '../src/classes/SupplyChainConformance';
import { Server } from 'node:http';
const {expect} = chai;

chai.use(chaiHttp);
describe('/begin and /step', () => {
  let keys: Map<Participant, [string, string]>;
  
  let manufacturer: Server;
  let bulkbuyer: Server;

  before(() => {
    const participants = new Map<Participant, RoutingInformation>([
      [Participant.BulkBuyer, new RoutingInformation(Participant.BulkBuyer, 'localhost', 9001)],
      [Participant.Manufacturer, new RoutingInformation(Participant.Manufacturer, 'localhost', 9002)],
      [Participant.Middleman, new RoutingInformation(Participant.Middleman, 'localhost', 9003)],
      [Participant.Supplier, new RoutingInformation(Participant.Supplier, 'localhost', 9004)],
      [Participant.SpecialCarrier, new RoutingInformation(Participant.SpecialCarrier, 'localhost', 9005)],
    ]);
    
    keys = new Map<Participant, [string, string]>();
    const pubKeys = new Map<Participant, string>();
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

    let [publicKey, privateKey] = keys.get(Participant.Manufacturer);
    manufacturer = configureServer(express(), {
        me: Participant.Manufacturer,
        publicKey: publicKey,
        privateKey: privateKey
      },
      new SupplyChainRouting(participants),
      new SupplyChainConformance(pubKeys)
    )
    .listen(9002, () => console.log(`Manufacturer Running on 9002 ⚡`));

    [publicKey, privateKey] = keys.get(Participant.BulkBuyer);
    bulkbuyer = configureServer(express(), {
        me: Participant.BulkBuyer,
        publicKey: publicKey,
        privateKey: privateKey
      },
      new SupplyChainRouting(participants),
      new SupplyChainConformance(pubKeys)
    )
    .listen(9001, () => console.log(`Bulk Buyer Running on 9001 ⚡`));
  })

  after(() => {
    manufacturer.close();
    bulkbuyer.close();
  });

  it('test with conforming behaviour', (done) => {
    
    chai.request('http://localhost:9001')
      .get('/begin/0')
      .end((err, res) => {
        expect(err).to.be.null;
        expect(res).to.have.status(200);
        done();
      });
  });

});
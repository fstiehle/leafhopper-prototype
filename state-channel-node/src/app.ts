import * as dotenv from 'dotenv';
import fs from 'fs';
import https from 'https';
import express, { Express } from 'express';
import SupplyChainConformance from './classes/SupplyChainConformance';
import Participant from "./classes/Participant";
import SupplyChainRouting from './classes/SupplyChainRouting';
import { configureServer, getParticipantsKeys, getParticipantsRoutingInformation } from './helpers/util';
import { ethers } from 'ethers';
import Oracle from './classes/Oracle';
import RequestServer from './classes/RequestServer';

dotenv.config()
const port = 9000;
const ROOT_CONTRACT = dotenv.parse("ROOT_CONTRACT").ROOT_CONTRACT;
const IDENTITY = dotenv.parse("IDENTITY").IDENTITY;
let rootCA: string;
let sK: string;
let cert: string;

try {
  sK = fs.readFileSync('./keys/' + IDENTITY + '.key').toString();
  rootCA = fs.readFileSync('./keys/rootCA.crt').toString();
  cert = fs.readFileSync('./keys/' + IDENTITY + '.crt').toString();
} catch (err) {
  console.error(err);
}

// TODO: create from mnemonic
const wallet = ethers.Wallet.createRandom();
const participants = getParticipantsRoutingInformation();
const keys = getParticipantsKeys(participants.keys());

const app: Express = configureServer(
  express(), 
  {
    me: Participant[IDENTITY as keyof typeof Participant],
    wallet: wallet
  },
  new SupplyChainRouting(participants),
  new SupplyChainConformance(keys),
  new Oracle(
    ROOT_CONTRACT, wallet, [new ethers.providers.EtherscanProvider(), new ethers.providers.InfuraProvider()]
  ),
  new RequestServer(rootCA)
);

const httpsServer = https.createServer(
  {
    cert: cert,
    key: sK,
    ca: rootCA
  }, 
  app
);
httpsServer.listen(port, () => console.log(`Running on ${port} ⚡`));

export {
  configureServer
}
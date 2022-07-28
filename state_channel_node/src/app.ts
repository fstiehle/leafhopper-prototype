import dotenv from 'dotenv';
dotenv.config();
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

const ROOT_CONTRACT = process.env.APP_ADDRESS_CONTRACT;
const IDENTITY = process.env.APP_IDENTITY;

let rootCA: string;
let sK: string;
let cert: string;
try {
  sK = fs.readFileSync(process.env.PWD + '/keys/' + IDENTITY + '.key').toString();
  rootCA = fs.readFileSync(process.env.PWD + '/keys/rootCA.crt').toString();
  cert = fs.readFileSync(process.env.PWD + '/keys/' + IDENTITY + '.crt').toString();
} catch (err) {
  console.error(err);
}

const wallet = ethers.Wallet.fromMnemonic(process.env.APP_MNEMONIC);
const participants = getParticipantsRoutingInformation();
const keys = getParticipantsKeys(participants.keys());
const me = Participant[IDENTITY as keyof typeof Participant];
const port = 8080;

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
httpsServer.listen(port, () => console.log(`${me} running on ${port} ⚡`));

export {
  configureServer
}
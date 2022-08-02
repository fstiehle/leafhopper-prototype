import leafhopper from '../leafhopper.config';
import fs from 'fs';
import https from 'https';
import express, { Express } from 'express';
import SupplyChainConformance from './classes/SupplyChainConformance';
import Participant from "./classes/Participant";
import SupplyChainRouting from './classes/SupplyChainRouting';
import { 
  configureServer, 
  getParticipantsAddressFromConfig, 
  getParticipantsRoutingFromConfig, 
  getProvidersFromConfig 
} from './helpers/util';
import { ethers } from 'ethers';
import Oracle from './classes/Oracle';
import RequestServer from './classes/RequestServer';

// Set up Wallet
const wallet = ethers.Wallet.fromMnemonic(leafhopper.mnemonic);

// Set the appropriate provider(s) for the Oracle
const providers = getProvidersFromConfig(leafhopper.contract);
// Get routing information of other participants (URL, port, etc...)
const participants = getParticipantsRoutingFromConfig(leafhopper.participants);
const addresses = getParticipantsAddressFromConfig(leafhopper.participants);
// Set own identity
const me = Participant[leafhopper.identity as keyof typeof Participant];
const port = 8080;

// Load TLS keys
let rootCA: string;
let sK: string;
let cert: string;
try {
  sK = fs.readFileSync(process.env.PWD + '/keys/' + leafhopper.identity + '.key').toString();
  rootCA = fs.readFileSync(process.env.PWD + '/keys/rootCA.crt').toString();
  cert = fs.readFileSync(process.env.PWD + '/keys/' + leafhopper.identity + '.crt').toString();
} catch (err) {
  console.error(err);
}

const app: Express = configureServer(
  express(), 
  { me, wallet },
  new SupplyChainRouting(participants),
  new SupplyChainConformance(addresses),
  new Oracle(
    leafhopper.contract.address,
    wallet, 
    providers
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
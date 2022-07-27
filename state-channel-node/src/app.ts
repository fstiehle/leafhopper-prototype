import * as dotenv from 'dotenv';
import fs from 'fs';
import express, { Express } from 'express';
import SupplyChainConformance from './classes/SupplyChainConformance';
import Participant from "./classes/Participant";
import SupplyChainRouting from './classes/SupplyChainRouting';
import { getSupplyChainParticipants, configureServer } from './helpers/util';
import { ethers } from 'ethers';
import Oracle from './classes/Oracle';

dotenv.config()
const port = 9000;
const ROOT_CONTRACT = dotenv.parse("ROOT_CONTRACT").ROOT_CONTRACT;
const IDENTITY = dotenv.parse("IDENTITY").IDENTITY;
let pK: string;
let sK: string;

try {
  sK = fs.readFileSync('../rsa_id/' + IDENTITY).toString();
} catch (err) {
  console.error(err);
}

const wallet = new ethers.Wallet(sK);
const {participants, keys} = getSupplyChainParticipants();

const app: Express = configureServer(
  express(), 
  {
    me: Participant[IDENTITY as keyof typeof Participant],
    wallet: wallet
  },
  new SupplyChainRouting(participants),
  new SupplyChainConformance(keys),
  new Oracle(
    ROOT_CONTRACT, wallet, [new ethers.providers.EtherscanProvider(), new ethers.providers.InfuraProvider()])
);

app.listen(port, () => console.log(`Running on ${port} ⚡`));

export {
  configureServer
} 
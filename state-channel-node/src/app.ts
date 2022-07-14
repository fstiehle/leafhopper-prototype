import * as dotenv from 'dotenv';
import fs from 'fs';
import express, { Express } from 'express';
import SupplyChainConformance from './classes/SupplyChainConformance';
import Participant from "./classes/Participant";
import SupplyChainRouting from './classes/SupplyChainRouting';
import { getSupplyChainParticipants, configureServer } from './helpers/util';

dotenv.config()
const port = 9000;
const identity = dotenv.parse("IDENTITY").identity;
let pK: string;
let sK: string;

try {
  pK = fs.readFileSync('../rsa_id/' + identity + '.pub').toString();
  sK = fs.readFileSync('../rsa_id/' + identity).toString();
  console.log(pK);
  console.log(sK);
} catch (err) {
  console.error(err);
}

const {participants, keys} = getSupplyChainParticipants();

const app: Express = configureServer(
  express(), 
  {
    me: Participant[identity as keyof typeof Participant],
    publicKey: pK,
    privateKey: sK
  },
  new SupplyChainRouting(participants),
  new SupplyChainConformance(keys),
);

app.listen(port, () => console.log(`Running on ${port} ⚡`));

export {
  configureServer
} 
import fs from 'fs';
import leafhopper from '../../leafhopper.config';
import Participant from '../../src/classes/Participant';
import RoutingInformation from '../../src/classes/RoutingInformation';
import RequestServer from '../../src/classes/RequestServer';
import assert from 'assert';
import { execSync } from 'child_process';
import { getParticipantsRoutingFromConfig } from '../../src/helpers/util';
import Step from '../../src/classes/Step';
import SupplyChainConformance from '../../src/classes/SupplyChainConformance';
import { Wallet } from '../../src/classes/Identity';

export default class Replayer {

  nodes: Map<Participant, RoutingInformation>;
  requestServer: RequestServer;

  constructor() {
    console.log("Loading root certificate ...");
    let rootCA: string;
    try {
      rootCA = fs.readFileSync(process.env.PWD + '/keys/rootCA.crt').toString();
    } catch (err) {
      console.error(err);
    }

    // Set up other participants routing information
    this.nodes = getParticipantsRoutingFromConfig(leafhopper.participants);
  }

  async replay(participant: Participant, taskID: number) {
    const options: RoutingInformation = this.nodes.get(participant);
    options.path = '/begin/' + taskID;
    options.method = 'GET';
    return await this.requestServer.doRequest(options, "")
    .catch(error => {
      assert(!error, error);
    });
  }

  async attach(address: string) {
    for (const [p, r] of this.nodes) {
      const options = r;
      options.path = '/attach/' + address;
      options.method = 'PUT';
      await this.requestServer.doRequest(options, "");
    }
  }

  static async insertConformingStep(signers: Array<Wallet>, taskID: number, newTokenState: number[]) {
    const step = new Step({
      from: SupplyChainConformance.routing(taskID),
      caseID: 0,
      taskID: taskID,
      newTokenState: newTokenState
    })
    signers.forEach(async (signer, index) => {
      await step.sign(signer, index);
    });    
    return step;
  }

  static getFreshTokenState() {
    const tokenState = new Array<number>(14).fill(0);
    tokenState[0] = 1;
    return tokenState;
  }

  dispute(participant: Participant) {
    console.log("TODO");
  }

  deployContract(which: "baseline" | "stateChannel") {
    console.log("Deploying smart contract ...");
    let bash;
    if (which === "stateChannel") {
      console.log('npm run deploy');
      bash = execSync(
        'npm run deploy', 
        { cwd: process.env.PWD + '/contracts/' }
      );
    } else {
      console.log('npm run deploy:baseline');
      bash = execSync(
        'npm run deploy:baseline', 
        { cwd: process.env.PWD + '/contracts/' }
      );
    }
    
    console.log(bash.toString());
    const regex = new RegExp(/CONTRACT_BEGIN\w*CONTRACT_END/g);
    const rootAddress = regex.exec(bash.toString()).pop()
    .replace("CONTRACT_BEGIN", "")
    .replace("CONTRACT_END", "");
    return rootAddress;
  }
}
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

  static async insertConformingStep(signers: Map<Participant, Wallet>, steps: Step[], taskID: number) {
    steps[taskID] = new Step({
      from: SupplyChainConformance.routing(taskID),
      caseID: 0,
      taskID: taskID
    })
    await steps[taskID].sign(signers.get(SupplyChainConformance.routing(taskID)));
    return steps;
  }

  static getEmptySteps() {
    const steps: Step[] = new Array<Step>();
    for (let index = 0; index < 14; index++) {
      steps.push(new Step({
        from: 0,
        caseID: 0,
        taskID: 0
      }))
    }
    return steps;
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
import fs from 'fs';
import leafhopper from '../../leafhopper.config';
import Participant from '../../src/classes/Participant';
import RoutingInformation from '../../src/classes/RoutingInformation';
import RequestServer from '../../src/classes/RequestServer';
import assert from 'assert';
import { execSync } from 'child_process';
import { getParticipantsRoutingFromConfig } from '../../src/helpers/util';
import Step from '../../src/classes/Step';

export default class Replayer {
  nodes: Map<Participant, RoutingInformation>;
  requestServer: RequestServer;
  responseCache: Step;

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
    this.requestServer = new RequestServer(rootCA);
  }

  async replay(taskID: number, participant: Participant) {
    const _options: RoutingInformation = this.nodes.get(participant);
    _options.hostname = 'localhost';
    _options.port = leafhopper.participants[_options.participant].local_port;
    _options.path = '/begin/' + taskID;
    _options.method = 'POST';

    const options = {
      headers: {
        'Content-Type': 'application/json',
      },
      ..._options
    }

    const answer = await this.requestServer.doRequest(
      options, 
      this.responseCache ? JSON.stringify({prevSteps: [this.responseCache]}) : "{}"
    )
    .catch(error => {
      assert(!error, error);
    });
    if (answer) {
      this.responseCache = new Step(JSON.parse(answer).step);
    }
    return answer;
  }

  async attach(address: string) {
    for (const [_, r] of this.nodes) {
      const options = r;
      options.hostname = 'localhost';
      options.port = leafhopper.participants[options.participant].local_port;
      options.path = '/attach/' + address;
      options.method = 'PUT';
      await this.requestServer.doRequest(options, "");
    }
  }

  static getFreshTokenState() {
    const tokenState = new Array<number>(14).fill(0);
    tokenState[0] = 1;
    return tokenState;
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
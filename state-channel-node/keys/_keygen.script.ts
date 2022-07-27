/// Make sure to call 'npm run build' first.
/// Script used for key generation in the test environment.
/// Thanks to: https://gist.github.com/fntlnz/cf14feb5a46b2eda428e000157447309

import { execSync } from "child_process";
import RoutingInformation from "../src/classes/RoutingInformation";
import { cwd } from 'process';
import { getParticipantsRoutingInformation } from '../src/helpers/util';

const execute = (line: string) => {
  try {
    execSync(line, { cwd: cwd() + '/keys' });
  } catch(err) {
    console.log(err);
    return;
  }
}

console.log('Running script for key generation...');

const participants = getParticipantsRoutingInformation();

execute("openssl genrsa -out rootCA.key 4096");
execute(`openssl req -x509 -new -nodes -key rootCA.key -subj "/C=DE/ST=BW/O=leafhopper, GmbH./CN=leafhopper" -sha256 -days 365 -out rootCA.crt`);
console.log(`RootCA key and certificate generated. 🔐`);

participants.forEach((p: RoutingInformation) => {
  const name = p.participant.toString();
  execute(`openssl genrsa -out ${name}.key 2048`);
  execute(`openssl rsa -in ${name}.key -pubout -out ${name}.pub`);
  execute(`openssl req -new -sha256 -key ${name}.key -subj "/C=DE/ST=BW/O=${name}, GmbH./CN=${p.hostname}" -out ${name}.csr`);
  execute(`openssl x509 -req -in ${name}.csr -CA rootCA.crt -CAkey rootCA.key -CAcreateserial -out ${name}.crt -days 500 -sha256`);
})
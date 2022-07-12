import Participant from "./Participant";
import crypto from "crypto";

interface StepProperties {
  from: Participant;
  caseID: number;
  taskID: number;
  salt: string;
  signature: string;
}

export default class Step implements StepProperties {
  from: Participant;
  caseID: number;
  taskID: number;
  salt: string;
  signature: string;

  constructor(props: StepProperties) {
    Object.assign(this, props);
  }

  sign(privateKey: string) {
    this.salt = crypto.randomBytes(16).toString('hex');
    this.signature = crypto
      .createSign('sha256')
      .update(JSON.stringify(this))
      .end()
      .sign({
        key: privateKey, 
        passphrase: 'test environment ' + this.from
      })
      .toString('hex');
  }

  verifySignature(publicKey: string) {
    return crypto.createVerify('sha256')
      .update(JSON.stringify(this))
      .end()
      .verify(publicKey, this.signature);
  }
}

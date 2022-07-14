import Participant from "./Participant";
import crypto from "crypto";

interface StepPublicProperties {
  from: Participant;
  caseID: number;
  taskID: number;
}

export default class Step implements StepPublicProperties {
  from: Participant;
  caseID: number;
  taskID: number;
  salt: string;
  signature: string;

  constructor(props: StepPublicProperties) {
    Object.assign(this, props);
  }

  private getSignablePart() {
    return {
      from: this.from,
      caseID: this.caseID,
      taskID: this.taskID,
      salt: this.salt
    }
  }

  sign(privateKey: string): Step {
    this.salt = crypto.randomBytes(16).toString('hex');
    this.signature = crypto
      .createSign('sha256')
      .update(JSON.stringify(this.getSignablePart()))
      .end()
      .sign({
        key: privateKey, 
        passphrase: 'test environment ' + this.from
      })
      .toString('hex');

    return this;
  }

  verifySignature(publicKey: string): boolean {
    return crypto.createVerify('sha256')
      .update(JSON.stringify(this.getSignablePart()))
      .end()
      .verify(publicKey, this.signature, 'hex');
  }
}

import Participant from "./Participant";
import crypto from "crypto";
import Signable from "./Signable";

interface StepPublicProperties {
  from: Participant;
  caseID: number;
  taskID: number;
}

export default class Step extends Signable implements StepPublicProperties {
  from: Participant;
  caseID: number;
  taskID: number;
  salt: string;
  signature: string;

  constructor(props: StepPublicProperties) {
    super();
    Object.assign(this, props);
  }

  getSignablePart() {
    return {
      from: this.from,
      caseID: this.caseID,
      taskID: this.taskID,
      salt: this.salt
    }
  }
}

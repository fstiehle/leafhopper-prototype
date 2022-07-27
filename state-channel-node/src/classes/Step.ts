import Participant from "./Participant";
import Signable from "./Signable";

interface StepPublicProperties {
  from: Participant;
  caseID: number;
  taskID: number;
  salt?: string;
  signature?: string;
}

export default class Step extends Signable implements StepPublicProperties {
  from: Participant;
  caseID: number;
  taskID: number;
  salt: string;
  signature: string;

  constructor(props: StepPublicProperties) {
    super();
    this.from = props.from;
    this.caseID = props.caseID;
    this.taskID = props.taskID;
    this.salt = props.salt ? props.salt : "0x00000000000000000000000000000000";
    this.signature = props.signature ? props.signature : "0x";
  }

  getSignablePart(withSignature = false) {
    const payload: any[] = [this.caseID, this.from, this.taskID, this.salt];
    const types = ['uint', 'uint', 'uint','bytes16'];
    if (withSignature) { 
      payload.push(this.signature);
      types.push('bytes');
    }
    return {
      types: types,
      value: payload
    }
  }
}

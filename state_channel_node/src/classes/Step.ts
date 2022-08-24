import Signable from "./Signable";

export interface StepPublicProperties {
  from: number;
  caseID: number;
  taskID: number;
  newTokenState: number[];
  salt?: string;
  signature?: string[];
}

export default class Step extends Signable implements StepPublicProperties {
  from: number;
  caseID: number;
  taskID: number;
  newTokenState: number[];
  salt: string;
  signature: string[];

  uintNewTokenState = 0;

  static getUintTokenState(tokenState: number[]) {
    let number = 0;
    for (let index = 0; index < tokenState.length; index++) {
      if (tokenState[index] > 0) number |= 1 << (index);
    }
    return number;
  }

  constructor(props: StepPublicProperties) {
    super();
    this.from = props.from;
    this.caseID = props.caseID;
    this.taskID = props.taskID;
    this.salt = props.salt ? props.salt : "0x00000000000000000000000000000000";
    this.signature = props.signature ? props.signature : new Array<string>(5).fill("0x");
    this.newTokenState = props.newTokenState;
    this.uintNewTokenState = Step.getUintTokenState(props.newTokenState);
  }

  getBlockchainFormat() {
    return {
      caseID: this.caseID, 
      from: this.from, 
      taskID: this.taskID, 
      newTokenState: this.uintNewTokenState, 
      salt: this.salt, 
      signature: this.signature
    };
  }

  getSignablePart(withSignature = false) {
    const payload: any[] = [this.caseID, this.from, this.taskID, this.uintNewTokenState, this.salt];
    const types = ['uint', 'uint', 'uint', 'uint', 'bytes16'];
    if (withSignature) { 
      payload.push(this.signature);
      types.push('bytes[]');
    }
    return {
      types: types,
      value: payload
    }
  }
}

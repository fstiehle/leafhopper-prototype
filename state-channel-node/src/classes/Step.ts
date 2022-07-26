import Participant from "./Participant";
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
      types: {
        Step: [
          {name: 'caseID', type: 'uint'},
          {name: 'from', type: 'uint'},
          {name: 'taskID', type: 'uint'},
          {name: 'salt', type: 'bytes16'}
        ]
      },
      value: {
        caseID: this.caseID,
        from: this.from,
        taskID: this.taskID,
        salt: this.salt
      }
    }
  }
}

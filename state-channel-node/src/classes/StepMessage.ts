import Signable from "./Signable";
import Step from "./Step";

export interface StepMessageProperties {
  step: Step;
  prevSteps: Step[];
  salt: string;
  signature: string;
}

export default class StepMessage extends Signable {
  step: Step;
  prevSteps: Step[];
  salt: string;
  signature: string;

  getSignablePart() {
    return {
      types: {
        Step: [
          {name: 'caseID', type: 'uint'},
          {name: 'from', type: 'uint'},
          {name: 'taskID', type: 'uint'},
          {name: 'salt', type: 'bytes16'}
        ],
        StepMessage: [
          {name: 'step', type: 'Step'},
          {name: 'prevSteps', type: 'Step[]'},
          {name: 'salt', type: 'bytes16'}
        ]
      },
      value: {
        step: this.step,
        prevSteps: this.prevSteps,
        salt: this.salt
      }
    }
  }

  fromJSON(obj: StepMessageProperties) {
    this.step = new Step(obj.step)
    this.prevSteps = new Array<Step>(14);
    this.signature = obj?.signature;
    this.salt = obj?.salt;
    for (const stepObj of obj.prevSteps) {
      if (!stepObj) continue;
      const prevStep = new Step(stepObj);
      prevStep.signature = stepObj.signature;
      prevStep.salt = stepObj.salt;
      this.prevSteps[prevStep.taskID] = prevStep;
    }
    return this;
  }
}
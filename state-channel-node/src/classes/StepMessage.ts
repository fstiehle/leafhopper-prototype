import Signable from "./Signable";
import Step from "./Step";

export interface StepMessageProperties {
  step: Step
  prevSteps: Step[]
  salt: string;
  signature: string;
}

export default class StepMessage extends Signable {
  step: Step
  prevSteps: Step[]
  salt: string;
  signature: string;

  getSignablePart(): object {
    return {
      step: this.step,
      prevSteps: this.prevSteps,
      salt: this.salt
    }
  }

  fromJSON(obj: StepMessageProperties) {
    this.step = new Step(obj.step)
    this.prevSteps = new Array<Step>();
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
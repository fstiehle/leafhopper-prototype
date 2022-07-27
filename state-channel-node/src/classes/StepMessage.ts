import Signable from "./Signable";
import Step from "./Step";

export interface StepMessageProperties {
  salt: string;
  signature: string;
  step: Step;
  prevSteps: Step[];
}

export default class StepMessage extends Signable {
  step: Step;
  prevSteps: Step[];
  salt: string;
  signature: string;

  getSignablePart() {
    return {
      types: ['tuple(uint,uint,uint,bytes16,bytes)', 'tuple(uint,uint,uint,bytes16,bytes)[]', 'bytes16'],
      value: [
        this.step.getSignablePart(true).value,
        this.prevSteps.reduce((acc, step) => { acc.push(step.getSignablePart(true).value); return acc; }, []), this.salt]
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
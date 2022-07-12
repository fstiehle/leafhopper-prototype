import { throws } from "assert";
import { Participants, RoutingInformation } from "./RoutingInformation";

interface StepProperties {
  caseID: number;
  taskID: number;
  salt: string;
  signature: string;
}

class Step implements StepProperties{
  caseID: number;
  taskID: number;
  salt: string;
  signature: string; // TODO

  constructor(props: StepProperties) {
    Object.assign(this, props);
  }
}

interface ConformanceCheck {
  caseID: number;
  steps: Step[];
  tokenState: Array<number>;
  routing: RoutingInformation[];

  step(step: Step, previousSteps: Step[]): boolean
}

export {
  ConformanceCheck,
  Step
}
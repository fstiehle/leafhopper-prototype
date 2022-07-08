import { throws } from "assert";
import { Participants, RoutingInformation } from "./RoutingInformation";

class Step {
  caseID: number;
  taskID: number;
  newTokenState: Array<number>;
  salt: string;
  signature: string; // TODO

  constructor(caseID: number, taskID: number, 
    newTokenState: Array<number>, salt: string, signature: string) {
      this.caseID = caseID;
      this.taskID = taskID;
      this.newTokenState = newTokenState;
      this.salt = salt;
      this.signature = signature;
    }
}

interface ConformanceCheck {
  caseID: number;
  steps: Step[];
  tokenState: Array<number>;
  routing: RoutingInformation[];

  check(step: Step, previousSteps: Step[]): boolean
}

export {
  ConformanceCheck,
  Step
}
import RoutingInformation from "./RoutingInformation";
import Step from "./Step";

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
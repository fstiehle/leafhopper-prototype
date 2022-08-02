import Participant from "./Participant";
import RoutingInformation from "./RoutingInformation";
import Step from "./Step";

export default interface Conformance {
  caseID: number;
  steps: Step[];
  tokenState: Array<number>;
  pubKeys: Map<Participant, string>;

  step(step: Step, previousSteps: Step[]): boolean
  reset(): void
}
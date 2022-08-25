import Participant from "./Participant";
import RoutingInformation from "./RoutingInformation";
import Step from "./Step";

export default interface Conformance {
  caseID: number;
  steps: Step[];
  tokenState: Array<number>;
  pubKeys: Map<Participant, string>;
  lastCheckpoint: number;

  step(step: Step): boolean
  checkStep(step: Step): boolean
  checkStepisFinalised(step: Step): boolean
  reset(): void
}
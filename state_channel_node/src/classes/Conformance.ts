import Participant from "./Participant";
import Step from "./Step";
/* An interface to encapsulate all conformance related functionality; mainly verifying instances of Step. 
This class also holds the current process state, called tokenState. */
export default interface Conformance {
  caseID: number;
  steps: Step[];
  tokenState: Array<number>;
  pubKeys: Map<Participant, string>;

  step(step: Step): boolean
  checkStep(step: Step): boolean
  checkStepisFinalised(step: Step): boolean
  reset(): void
}
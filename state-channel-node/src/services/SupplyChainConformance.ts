import { ConformanceCheck, Step } from "./conformanceCheck";
import { RoutingInformation } from "./RoutingInformation";

export default class SupplyChainConformance implements ConformanceCheck {
  caseID: number;
  tokenState: number[];
  steps: Step[];
  routing: RoutingInformation[];

  constructor(routing: RoutingInformation[]) {
    this.routing = routing;
    this.caseID = 0;
    this.tokenState = Array<number>(20).fill(0);
    this.tokenState[0] = 1;
  }

  /**
   * Check that @param taskID is the valid next move considering @param tokenState.
   * If not @return false
   */
  private checkTask(tokenState: number[], taskID: number): number[] {
    if (taskID === 2 || taskID === 4 || taskID === 6 || taskID > 12) {
      // only used for internal orchestration
      return tokenState;
    }
    if (tokenState[taskID] === 0) {
      return tokenState;
    }

    // advance token state by consuming and producing tokens
    // consume token(s)
    tokenState[taskID] = 0;
    // produce tokens
    tokenState[taskID + 1] = 1;

    // AND branch
    if (tokenState[2] === 1) {
      // enable both AND branches
      tokenState[3] = 1;
      tokenState[5] = 1;
    }
    if (tokenState[4] === 1 && tokenState[6] === 1) {
      // join AND branch
      tokenState[4] = 0;
      tokenState[6] = 0;
      tokenState[7] = 1;
    }

    // End event
    if (tokenState[13] === 1) {
      console.log("Process Ended")
    }
    return tokenState;
  } 

  /**
   * Check 
   *  - the caseID matches
   *  - all @param previousSteps are known and do not conflict
   *  - if some previousSteps are unknown, check conformance and replay them
   *  - check conformance of step.taskID
   *  - check signatures of step.signature and all new added steps
   * @param step {Step}
   * @returns 
   */
  check(step: Step, prevSteps: Step[]): boolean {
    if (step.caseID !== this.caseID) {
      return false;
    }
    if (this.steps.length > prevSteps.length) {
      return false;
    }

    // Check previous steps and replay their effect
    // If a fault is encountered roll back
    const currentTokenState = this.tokenState;
    const currentSteps = this.steps;
    for (let i = 0; i < prevSteps.length; i++) {
      if (i > this.steps.length) {
        // There are some unknown steps
        // Check and replay them
        for (let j = i; j < this.steps.length; j++) {
          if (!this.checkStep(prevSteps[j])) {
            this.steps.push(prevSteps[j]);
            this.tokenState = prevSteps[j].newTokenState;
          } else {
            // Rollback
            this.steps = currentSteps;
            this.tokenState = currentTokenState;
            return false;
          }
        }
        break;
      }

      if (JSON.stringify(prevSteps[i]) !== JSON.stringify(this.steps[i])) {
        return false;
      }
    }
    
    return true;
  }

  /// TODO: signature check
  checkStep(step: Step): boolean {
    if (!step.caseID || !step.newTokenState || !step.salt || !step.signature || !step.taskID) {
      return false;
    }
    if (step.caseID !== this.caseID) {
      return false;
    }
    return (JSON.stringify(step.newTokenState) === JSON.stringify(this.checkTask(this.tokenState, step.taskID)));
  }
}
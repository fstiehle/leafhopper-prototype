import Conformance from "./Conformance";
import Step from "./Step";
import Participant from "./Participant";

/// TODO: Refactor general function into a super class
export default class SupplyChainConformance implements Conformance {
  caseID: number;
  tokenState: number[];
  steps: Step[];
  pubKeys: Map<Participant, string>;

  constructor(pubKeys: Map<Participant, string>) {
    this.pubKeys = pubKeys;
    this.caseID = 0;
    this.tokenState = Array<number>(14).fill(0);
    this.steps = new Array<Step>(14);
    this.tokenState[0] = 1;
  }

  /**
   * Check that @param taskID is the valid next move considering @param tokenState.
   * If not @return false
   */
  task(tokenState: number[], taskID: number): number[] {
    if (taskID === 2 || taskID === 4 || taskID === 6 || taskID > 12) {
      // only used for internal orchestration
      return tokenState;
    }
    
    const oldTokenState = [...tokenState];
    // AND branch
    if (tokenState[2] === 1) {
      // enable both AND branches
      tokenState[3] = 1;
      tokenState[5] = 1;
      tokenState[2] = 0;
    }
    if (tokenState[4] === 1 && tokenState[6] === 1) {
      // join AND branch
      tokenState[4] = 0;
      tokenState[6] = 0;
      tokenState[7] = 1;
    }
    if (tokenState[taskID] === 0) {
      return oldTokenState;
    }

    // advance token state by consuming and producing tokens
    // consume token(s)
    tokenState[taskID] = 0;
    // produce tokens
    tokenState[taskID + 1] = 1;
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
  /// TODO: separation of step and prevSteps is redundant
  step(step: Step, prevSteps: Step[]): boolean {
    //console.log(`Enter with step task id ${step.taskID}`);
    if (step.caseID !== this.caseID) {
      return false;
    }
    //console.log("Check previous steps and replay their effect");
    // If a fault is encountered roll back from this state
    const currentTokenState = this.tokenState;
    const currentSteps = this.steps;

    for (let index = 0; index < this.tokenState.length; index++) {
      if (this.steps[index] === undefined) {
        if (prevSteps[index] !== undefined) {
          // console.log(`Unknwon step with task id ${prevSteps[index].taskID}`);
          // There is an unknown step
          // Check and replay them
          if (prevSteps[index].taskID == index && this.checkStep(prevSteps[index])) {
            this.steps[index] = prevSteps[index];
            this.tokenState = this.task(
              this.tokenState, 
              prevSteps[index].taskID
            );
          } else {
            // Rollback
            //console.log(`Rollback because of ${prevSteps[index]}`);
            this.steps = currentSteps;
            this.tokenState = currentTokenState;
            return false;
          }
        }
        continue;
      }

      //console.log(`Known step with task id ${this.steps[index].taskID}`);
      // Do not need to verify already known steps indepth, just check our known is equal to their known
      if (
        prevSteps[index] !== undefined && 
        (JSON.stringify(prevSteps[index]) !== JSON.stringify(this.steps[index]))
      ) {
        return false;
      }
    }

    //console.log(`Check proposed next step ${step.taskID}`);
    if (this.checkStep(step)) {
      //console.log(`add next step ${step.taskID} to previous steps`);
      this.steps[step.taskID] = step;
      this.tokenState = this.task(this.tokenState, step.taskID);
      return true;
    }

    return false;
  }

  checkStep(step: Step): boolean {
    if (step.caseID !== this.caseID) {
      return false;
    }
    // is it actually their turn?
    if (!this.checkRouting(step.from, step.taskID)) {
      return false;
    }

    // is it actually from them? 
    if (!step.verifySignature(this.pubKeys.get(step.from))) {
      return false;
    }

    // Is it the right turn? TODO: Move to top?
    if (
      JSON.stringify([...this.tokenState]) !== JSON.stringify(this.task(
        [...this.tokenState], 
        step.taskID
      ))
    ) { 
      return true; 
    }

    return false;
  }

  checkRouting(from: Participant, taskID: number): boolean {
    let required;
    switch (taskID) {
      case 0:
        required = Participant.BulkBuyer;
        break;
      case 1:
      case 11:
      case 12:
        required = Participant.Manufacturer;
        break;
      case 3:
      case 5:
        required = Participant.Middleman;
        break;
      case 7: 
      case 10:
        required = Participant.SpecialCarrier;
        break;
      case 8: 
      case 9:
        required = Participant.Supplier
        break;
      default:
        return false;
    }
    return required === from;
  }
}
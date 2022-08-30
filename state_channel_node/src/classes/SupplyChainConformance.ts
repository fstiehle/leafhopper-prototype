import Conformance from "./Conformance";
import Step from "./Step";
import Participant from "./Participant";

/// TODO: Refactor general function into a super class
export default class SupplyChainConformance implements Conformance {
  caseID: number;
  tokenState: number[];
  steps: Step[];
  pubKeys: Map<Participant, string>;
  lastCheckpoint = 0;

  constructor(pubKeys: Map<Participant, string>) {
    this.pubKeys = pubKeys;
    this.caseID = 0;
    this.tokenState = Array<number>(14).fill(0);
    this.steps = new Array<Step>();
    this.tokenState[0] = 1;
  }

  reset() {
    this.tokenState = Array<number>(14).fill(0);
    this.steps = new Array<Step>();
    this.tokenState[0] = 1;
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
  /// TODO: 
  // - prevSteps can go
  // we only need to check that the task id is > than the last seen task id
  // then check that task and the participant's signatures
  step(step: Step): boolean {
    //console.log(`Enter with step task id ${step.taskID}`);
    if (step.caseID !== this.caseID) {
      return false;
    }

    // Check and replay step
    if (this.checkStep(step)) {
      this.steps[step.taskID] = step;
      this.tokenState = SupplyChainConformance.task(
        this.tokenState, 
        step.taskID
      );
      return true;
    }

    return false;
  }

  checkStep(step: Step): boolean {
    if (step.caseID !== this.caseID) {
      return false;
    }
    
    // Is it the right turn? 
    const newTokenState = SupplyChainConformance.task(
      [...this.tokenState], 
      step.taskID
    );
    if (JSON.stringify(newTokenState) === JSON.stringify(this.tokenState) 
    || JSON.stringify(step.newTokenState) !== JSON.stringify(newTokenState)
    ) { 
      return false; 
    }

    // is it actually their turn?
    if (SupplyChainConformance.routing(step.taskID) !== step.from) {
      return false;
    }

    // is it actually from them? 
    if (!step.verifySignature(this.pubKeys.get(step.from), step.signature[step.from])) {
      return false;
    }

    return true;
  }

  checkStepisFinalised(step: Step) {
    if (step.signature.length !== this.pubKeys.size) {
      console.error(`Previous step not signed by all participants: ${JSON.stringify(step.signature)}`);
      return false;
    }

    step.signature.forEach((sig, par) => {
      if (!step.verifySignature(this.pubKeys.get(par), sig)) {
        console.error(`Signature of participant: ${par} not matching`);
        return false;
      }
    });

    return true;
  }

  /**
   * Check that @param taskID is the valid next move considering @param tokenState.
   * If not @return false
   */
   static task(tokenState: number[], taskID: number): number[] {
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

  static routing(taskID: number): number {
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
        return -99;
    }
    return required;
  }
}
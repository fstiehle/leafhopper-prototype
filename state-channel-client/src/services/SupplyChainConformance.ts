import ConformanceCheck from "./conformanceCheck";

export default class SupplyChainConformance implements ConformanceCheck {
  participants: Map<string, string>;
  tokenState: number[];

  constructor() {
    this.participants = new Map<string, string>([
      ["bulkbuyer", "value1"],
      ["manufacturer", "value2"]
    ]);
    this.tokenState = Array<number>(20).fill(0);
    this.tokenState[0] = 1;
  }

  check(taskID: number, participant: string): boolean {
    if (taskID === 2 || taskID === 4 || taskID === 6 || taskID > 12) {
      // only used for internal orchestration
      return false;
    }
    if (this.tokenState[taskID] === 0) {
      return false;
    }

    // advance token state by consuming and producing tokens
    // consume token(s)
    this.tokenState[taskID] = 0;
    // produce tokens
    this.tokenState[taskID + 1] = 1;

    // AND branch
    if (this.tokenState[2] === 1) {
      // enable both AND branches
      this.tokenState[3] = 1;
      this.tokenState[5] = 1;
    }
    if (this.tokenState[4] === 1 && this.tokenState[6] === 1) {
      // join AND branch
      this.tokenState[4] = 0;
      this.tokenState[6] = 0;
      this.tokenState[7] = 1;
    }

    // End event
    if (this.tokenState[13] === 1) {
      console.log("Process Ended")
    }
    
    return true;
  }
}
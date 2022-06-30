export default interface ConformanceCheck {
  participants: Map<string, string>;
  tokenState: Array<number>;

  check(taskID: number, participant: string): boolean
};
import SupplyChainConformance from './SupplyChainConformance';

const conformanceCheck = new SupplyChainConformance();

const step = (participant: string, taskID: number) => {
  return conformanceCheck.check(taskID, participant);
}

export default step;
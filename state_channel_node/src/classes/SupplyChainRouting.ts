import Participant from "./Participant";
import Routing from "./Routing";
import RoutingInformation from "./RoutingInformation";

export default class SupplyChainRouting implements Routing {
  routing: Map<Participant, RoutingInformation>;
  
  constructor(routing: Map<Participant, RoutingInformation>) {
    this.routing = routing;
  }
  get(p: Participant): RoutingInformation {
    return this.routing.get(p);
  }
  
  next(taskID: number): Participant {
    switch (taskID) {
      case 0:
      case 10:
        return Participant.Manufacturer;
      case 1:
        return Participant.Middleman;
      case 3:
      case 7:
        return Participant.Supplier;
      case 5:
      case 8:
      case 9:
        return Participant.SpecialCarrier;
      case 11:
      case 12:
        return Participant.BulkBuyer;
      default:
        throw new Error(`Routing Error: No Participant found to send task ${taskID}`);
    }
  }
}
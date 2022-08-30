import Participant from "./Participant";
import RoutingInformation from "./RoutingInformation";

/* Routing holds the network information necessary to reach other participants. */
export default interface Routing {
  routing: Map<Participant, RoutingInformation>;
  next(taskID: number): Participant
  get(p: Participant) : RoutingInformation
}
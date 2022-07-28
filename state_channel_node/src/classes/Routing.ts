import Participant from "./Participant";
import RoutingInformation from "./RoutingInformation";

export default interface Routing {
  routing: Map<Participant, RoutingInformation>;
  next(taskID: number): Participant
  get(p: Participant) : RoutingInformation
}
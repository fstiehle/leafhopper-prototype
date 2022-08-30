import Participant from "./Participant";

/* A class used by Routing.ts to encapsulate a participants' routing related information. */
export default class RoutingInformation {
  participant: Participant
  // HTTP options
  hostname: string;
  port: number;
  path = "/step/";
  method = 'POST';

  constructor(participant: Participant, hostname: string, port: number) {
    this.participant = participant;
    this.hostname = hostname;
    this.port = port;
  }
}
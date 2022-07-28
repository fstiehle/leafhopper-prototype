import Participant from "./Participant";

export default class RoutingInformation {
  participant: Participant

  // HTTP options
  hostname: string;
  port: number;
  path = "/step";
  method = 'POST';

  constructor(participant: Participant, hostname: string, port: number) {
    this.participant = participant;
    this.hostname = hostname;
    this.port = port;
  }
}
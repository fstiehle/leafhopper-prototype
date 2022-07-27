import Participant from "./Participant";

export default class RoutingInformation {
  participant: Participant

  // HTTP(S) options
  hostname: string;
  port: number;
  path = "/step";
  method = 'POST';

  // TLS options
  cert: string;
  key: string;
  ca: string;

  constructor(participant: Participant, hostname: string, port: number) {
    this.participant = participant;
    this.hostname = hostname;
    this.port = port;
  }
}
import Participant from "./Participant";

export default class RoutingInformation {
  participant: Participant
  hostname: string;
  port: number;
  address: string;
  path = "/step";
  method = 'POST';

  constructor(participant: Participant, 
    host: string, port: number, path = "/step", method = 'POST') {
      this.participant = participant;
      this.hostname = host;
      this.port = port;
      this.path = path;
      this.method = method;
  }
}
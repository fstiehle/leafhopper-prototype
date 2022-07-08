enum Participants {
  BulkBuyer,
  Manufacturer,
  Middleman,
  Supplier,
  SpecialCarrier
}

class RoutingInformation {
  participant: Participants
  hostname: string;
  port: number;
  path = "/step";
  method= 'POST';

  constructor(participant: Participants, 
    host: string, port: number, path = "/step", method = 'POST') {
      this.participant = participant;
      this.hostname = host;
      this.port = port;
      this.path = path;
      this.method = method;
  }
}

export {
  RoutingInformation,
  Participants
};
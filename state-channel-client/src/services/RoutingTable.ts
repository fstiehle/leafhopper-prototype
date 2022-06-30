class RoutingInformation {
  host: string;
  port: number;
  path: string = "step";
  method: string = 'POST';

  constructor(host: string, port: number, path: string = "begin", method: string = 'GET') {
    this.host = host;
    this.port = port;
    this.path = path;
    this.method = method;
  }
}

interface RoutingTable {
  myTasks: Array<number>;
  table: Map<number, RoutingInformation>;
  callNextParticipant(taskID: number, tokenState: Array<number>): boolean;
}

export {
  RoutingInformation,
  RoutingTable
};
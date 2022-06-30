import { RoutingInformation, RoutingTable } from "./RoutingTable"
import https from 'https';

export default class SupplyChainRouting implements RoutingTable {
  myTasks: number[];
  table: Map<number, RoutingInformation>;

  constructor(table: Map<number, RoutingInformation>) {
    this.table = table;
  }

  // TODO: Pass tokenState as JSON
  callNextParticipant(taskID: number, tokenState: number[]): boolean {
    const routingInfo = this.table.get(taskID);
    const req = https.request({
      hostname: routingInfo.host,
      port: routingInfo.port,
      path: routingInfo.path,
      method: routingInfo.method
    }, res => {
      console.log(`statusCode: ${res.statusCode}`);
    
      res.on('data', d => {
        process.stdout.write(d);
        return true;
      });
    });
    
    req.on('error', error => {
      console.error(error);
      return false;
    });

    return true;
  }
}
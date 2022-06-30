import { RoutingInformation } from "./RoutingTable";
import SupplyChainRouting from "./SupplyChainRouting";

enum Participants {
  BulkBuyer,
  Manufacturer,
  Middleman,
  Supplier,
  SpecialCarrier
}

const participants = new Map<Participants, RoutingInformation>([
  [Participants.BulkBuyer, new RoutingInformation('localhost', 9001)],
  [Participants.Manufacturer, new RoutingInformation('localhost', 9002)],
  [Participants.Middleman, new RoutingInformation('localhost', 9003)],
  [Participants.Supplier, new RoutingInformation('localhost', 9004)],
  [Participants.SpecialCarrier, new RoutingInformation('localhost', 9005)],
]);

const table = new Map<number, RoutingInformation>([
  [0, participants.get(Participants.Manufacturer)],
  [1, participants.get(Participants.BulkBuyer)],
  [3, participants.get(Participants.Supplier)],
  [5, participants.get(Participants.SpecialCarrier)],
  [7, participants.get(Participants.Supplier)],
  [8, participants.get(Participants.SpecialCarrier)],
  [9, participants.get(Participants.SpecialCarrier)],
  [10, participants.get(Participants.Manufacturer)],
  [11, participants.get(Participants.BulkBuyer)],
  [12, participants.get(Participants.BulkBuyer)],
]);

const supplChainRouting = new SupplyChainRouting(table);

export default supplChainRouting;
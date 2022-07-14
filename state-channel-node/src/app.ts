import * as dotenv from 'dotenv'
import express, { Express, Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import beginRouter from './routes/begin.route';
import stepRouter from './routes/step.route';
import SupplyChainConformance from './classes/SupplyChainConformance';
import RoutingInformation from './classes/RoutingInformation';
import Participant from "./classes/Participant";
import Identity from './classes/Identity';

const configureServer = (app: Express, identity: Identity) => {
  
  const conformance = new SupplyChainConformance(new Map<Participant, RoutingInformation>([
    [Participant.BulkBuyer, new RoutingInformation(Participant.BulkBuyer, 'localhost', 9001)],
    [Participant.Manufacturer, new RoutingInformation(Participant.Manufacturer, 'localhost', 9002)],
    [Participant.Middleman, new RoutingInformation(Participant.Middleman, 'localhost', 9003)],
    [Participant.Supplier, new RoutingInformation(Participant.Supplier, 'localhost', 9004)],
    [Participant.SpecialCarrier, new RoutingInformation(Participant.SpecialCarrier, 'localhost', 9005)],
  ]));

  const router = express.Router();
  app.use(helmet());
  app.use(express.json());
  app.use('/begin', beginRouter(router, identity, conformance));
  app.use('/step', stepRouter(router, identity, conformance));

  app.use((error: Error, request: Request, response: Response, next: NextFunction) => {
    const message = error.message || 'Something went wrong';
    console.log('error', message);
    response
      .status(500)
      .send(message);
  });
  
  app.get('/', (req: Request, res: Response) => {
    res.sendStatus(200);
  });

  return app;
}

dotenv.config() // TODO
const PORT = 9000;
const app: Express = configureServer(express(), {
  me: Participant.BulkBuyer,
  publicKey: "",
  privateKey: ""
});

app.listen(PORT, () => console.log(`Running on ${PORT} ⚡`));

export {
  configureServer
} 
import express, { Express, Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import beginRouter from './routes/begin.route';
import stepRouter from './routes/step.route';
import SupplyChainConformance from './services/SupplyChainConformance';
import RoutingInformation from './services/RoutingInformation';
import Participant from "./services/Participant";

const configureServer = (app: Express) => {
  const participants = new Map<Participant, RoutingInformation>([
    [Participant.BulkBuyer, new RoutingInformation(Participant.BulkBuyer, 'localhost', 9001)],
    [Participant.Manufacturer, new RoutingInformation(Participant.Manufacturer, 'localhost', 9002)],
    [Participant.Middleman, new RoutingInformation(Participant.Middleman, 'localhost', 9003)],
    [Participant.Supplier, new RoutingInformation(Participant.Supplier, 'localhost', 9004)],
    [Participant.SpecialCarrier, new RoutingInformation(Participant.SpecialCarrier, 'localhost', 9005)],
  ]);
  
  const conformance = new SupplyChainConformance([
    participants.get(Participant.Manufacturer),
    participants.get(Participant.BulkBuyer),
    participants.get(Participant.Supplier),
    participants.get(Participant.SpecialCarrier),
    participants.get(Participant.Supplier),
    participants.get(Participant.SpecialCarrier),
    participants.get(Participant.SpecialCarrier),
    participants.get(Participant.Manufacturer),
    participants.get(Participant.BulkBuyer),
    participants.get(Participant.BulkBuyer)]);

  const router = express.Router();
  app.use(helmet());
  app.use(express.json());
  app.use('/begin', beginRouter(router, conformance));
  app.use('/step', stepRouter(router, conformance));

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

const PORT = 9000;
const app: Express = configureServer(express());

app.listen(PORT, () => console.log(`Running on ${PORT} ⚡`));

export {
  app,
  configureServer
} 
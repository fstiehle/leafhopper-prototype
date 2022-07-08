import express, { Express, Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import beginRouter from './routes/begin.route';
import stepRouter from './routes/step.route';
import SupplyChainConformance from './services/SupplyChainConformance';
import { Participants, RoutingInformation } from './services/RoutingInformation';

const configureServer = (app: Express) => {
  const participants = new Map<Participants, RoutingInformation>([
    [Participants.BulkBuyer, new RoutingInformation(Participants.BulkBuyer, 'localhost', 9001)],
    [Participants.Manufacturer, new RoutingInformation(Participants.Manufacturer, 'localhost', 9002)],
    [Participants.Middleman, new RoutingInformation(Participants.Middleman, 'localhost', 9003)],
    [Participants.Supplier, new RoutingInformation(Participants.Supplier, 'localhost', 9004)],
    [Participants.SpecialCarrier, new RoutingInformation(Participants.SpecialCarrier, 'localhost', 9005)],
  ]);
  
  const conformance = new SupplyChainConformance([
    participants.get(Participants.Manufacturer),
    participants.get(Participants.BulkBuyer),
    participants.get(Participants.Supplier),
    participants.get(Participants.SpecialCarrier),
    participants.get(Participants.Supplier),
    participants.get(Participants.SpecialCarrier),
    participants.get(Participants.SpecialCarrier),
    participants.get(Participants.Manufacturer),
    participants.get(Participants.BulkBuyer),
    participants.get(Participants.BulkBuyer)]);

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
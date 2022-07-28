import Participant from '../classes/Participant';
import RoutingInformation from '../classes/RoutingInformation';
import express, { Express, Request, Response, NextFunction } from 'express';
import Identity from '../classes/Identity';
import Routing from '../classes/Routing';
import Conformance from '../classes/Conformance';
import helmet from 'helmet';
import beginRouter from '../routes/begin.route';
import stepRouter from '../routes/step.route';
import disputeRouter from '../routes/dispute.route';
import Oracle from '../classes/Oracle';
import RequestServer from '../classes/RequestServer';

/**
 * @returns Participants involved in the supply chain use case, their public keys and routing information
 */
const getParticipantsRoutingInformation = () => {
  return new Map<Participant, RoutingInformation>([
    [Participant.BulkBuyer, new RoutingInformation(Participant.BulkBuyer, 'localhost', 9001)],
    [Participant.Manufacturer, new RoutingInformation(Participant.Manufacturer, 'localhost', 9002)],
    [Participant.Middleman, new RoutingInformation(Participant.Middleman, 'localhost', 9003)],
    [Participant.Supplier, new RoutingInformation(Participant.Supplier, 'localhost', 9004)],
    [Participant.SpecialCarrier, new RoutingInformation(Participant.SpecialCarrier, 'localhost', 9005)],
  ]);
}

const getParticipantsKeys = (p: IterableIterator<Participant>) => {
  const keys = new Map<Participant, string>();
  for (const participant of p) {
    keys.set(participant, process.env.APP_ADDRESS);
  }
  return keys;
}

/**
 * Return the configured express server
 * @param app 
 * @param identity 
 * @param routing 
 * @param conformance 
 * @returns 
 */
 const configureServer = (
  app: Express, 
  identity: Identity,
  routing: Routing,
  conformance: Conformance,
  oracle: Oracle,
  requestServer: RequestServer
  ) => {
  const router = express.Router();
  app.use(helmet());
  app.use(express.json());
  app.use('/begin', beginRouter(router, identity, conformance, routing, oracle, requestServer));
  app.use('/step', stepRouter(router, identity, conformance, oracle));
  app.use('/dispute', disputeRouter(router, conformance, oracle));

  app.use((error: Error, _: Request, response: Response, next: NextFunction) => {
    const message = error.message || 'Something went wrong';
    console.log('error', message);
    response
      .status(500)
      .send(message);

    return next();
  });

  app.get('/', (req: Request, res: Response) => {
    res.sendStatus(200);
  });

  return app;
}

export {
  getParticipantsRoutingInformation,
  getParticipantsKeys,
  configureServer
}
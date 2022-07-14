import http from 'http';
import fs from 'fs';
import Participant from '../classes/Participant';
import RoutingInformation from '../classes/RoutingInformation';
import express, { Express, Request, Response, NextFunction } from 'express';
import Identity from '../classes/Identity';
import Routing from '../classes/Routing';
import Conformance from '../classes/Conformance';
import helmet from 'helmet';
import beginRouter from '../routes/begin.route';
import stepRouter from '../routes/step.route';

/**
 * Modified from: https://stackoverflow.com/a/56122489
 * Do a request with options provided.
 *
 * @param {Object} options
 * @param {string} data
 * @return {Promise} a promise of request
 */
const doRequest = (options: RoutingInformation, data: string): Promise<string> => {
  console.log(`${options.method} request to ${options.hostname}:${options.port}${options.path}`);
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      res.setEncoding('utf8');
      let responseBody = '';

      res.on('data', (chunk) => {
        responseBody += chunk;
      });

      res.on('end', () => {
        if (res.statusCode !== 200)
          return reject(new Error(`Error when trying to reach next participant: ${res.statusCode} ${res.statusMessage}`));

        try {
          resolve(JSON.parse(responseBody));
        } catch (error) {
          throw new Error(error);
        }
      });
    });

    req.on('error', (err) => {
      reject(err);
    });

    req.write(data)
    req.end();
  });
}

/**
 * @returns Participants involved in the supply chain use case, their public keys and routing information
 */
 const getSupplyChainParticipants = () => {
  const participants = new Map<Participant, RoutingInformation>([
    [Participant.BulkBuyer, new RoutingInformation(Participant.BulkBuyer, 'localhost', 9001)],
    [Participant.Manufacturer, new RoutingInformation(Participant.Manufacturer, 'localhost', 9002)],
    [Participant.Middleman, new RoutingInformation(Participant.Middleman, 'localhost', 9003)],
    [Participant.Supplier, new RoutingInformation(Participant.Supplier, 'localhost', 9004)],
    [Participant.SpecialCarrier, new RoutingInformation(Participant.SpecialCarrier, 'localhost', 9005)],
  ]);

  const keys = new Map<Participant, string>();
  for (const participant of participants.keys()) {
    let pK;
    try {
      console.log('../rsa_id/' + participant.toString() + '.pub');
      pK = fs.readFileSync('../rsa_id/' + participant.toString() + '.pub').toString();
    } catch (err) {
      console.error(err);
    }
    keys.set(participant, pK);
  }

  return {participants, keys};
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
  conformance: Conformance
  ) => {
  const router = express.Router();
  app.use(helmet());
  app.use(express.json());
  app.use('/begin', beginRouter(router, identity, conformance, routing));
  app.use('/step', stepRouter(router, identity, conformance));

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
  getSupplyChainParticipants,
  configureServer,
  doRequest
}
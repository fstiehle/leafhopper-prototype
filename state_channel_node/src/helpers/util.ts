import leafhopper from '../../leafhopper.config';
import express, { Express, Request, Response, NextFunction } from 'express';
import Identity from '../classes/Identity';
import Routing from '../classes/Routing';
import Conformance from '../classes/Conformance';
import helmet from 'helmet';
import beginRouter from '../routes/begin.route';
import stepRouter from '../routes/step.route';
import disputeRouter from '../routes/dispute.route';
import startRouter from '../routes/start.route';
import Oracle from '../classes/Oracle';
import RequestServer from '../classes/RequestServer';
import { ethers } from 'ethers';
import Participant from '../classes/Participant';
import RoutingInformation from '../classes/RoutingInformation';

const getProvidersFromConfig = (contract : typeof leafhopper.contract) => {
  const providers = new Array<ethers.providers.Provider>();
  providers.push(new ethers.providers.JsonRpcProvider(contract.deployTo.rpc));
  return providers;
}

const getParticipantsRoutingFromConfig = (participants : typeof leafhopper.participants) => {
  const routing = new Map<Participant, RoutingInformation>();
  for (const participant of participants) {
    routing.set(participant.id, new RoutingInformation(
      participant.id, 
      Participant[participant.id].toLowerCase(), 
      8080)
    );
  }
  return routing;
}

const getParticipantsAddressFromConfig = (participants : typeof leafhopper.participants) => {
  const address = new Map<Participant, string>();
  for (const participant of participants) {
    address.set(participant.id, participant.address);
  }
  return address;
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
  app.use(helmet());
  app.use(express.json());
  app.use('/dispute', disputeRouter(conformance, oracle));
  app.use('/step', stepRouter(identity, conformance, oracle));
  app.use('/begin', beginRouter(identity, conformance, routing, oracle, requestServer));
  app.use('/attach', startRouter(conformance, oracle));

  app.get("/", (_, res, next) => {
    res.sendStatus(200);
    return next();
  });

  app.use((error: Error, _: Request, response: Response, next: NextFunction) => {
    const message = error.message || 'Something went wrong';
    console.error(message);
    response
      .status(500)
      .send(message);

    return next();
  });

  return app;
}

export {
  getParticipantsAddressFromConfig,
  getParticipantsRoutingFromConfig,
  getProvidersFromConfig,
  configureServer
}
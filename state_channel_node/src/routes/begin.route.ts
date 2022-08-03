import { Router } from 'express';
import Identity from '../classes/Identity';
import ConformanceCheck from '../classes/Conformance';
import controller from '../controllers/begin.controller';
import Routing from '../classes/Routing';
import Oracle from '../classes/Oracle';
import RequestServer from '../classes/RequestServer';

const begin = (
  router: Router, 
  identity: Identity, 
  conformance: ConformanceCheck,
  flow: Routing,
  oracle: Oracle,
  requestServer: RequestServer
  ): Router => {
  router.post('/:id([0-9]+)', controller(identity, conformance, flow, oracle, requestServer));
  return router;
}

export default begin;
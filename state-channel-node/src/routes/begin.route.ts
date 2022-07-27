import { Router } from 'express';
import Identity from '../classes/Identity';
import ConformanceCheck from '../classes/Conformance';
import controller from '../controllers/begin.controller';
import Routing from '../classes/Routing';
import Oracle from '../classes/Oracle';

const begin = (
  router: Router, 
  identity: Identity, 
  conformance: ConformanceCheck,
  flow: Routing,
  oracle: Oracle
  ): Router => {
  router.get('/:id([0-9]+)', controller(identity, conformance, flow, oracle));
  return router;
}

export default begin;
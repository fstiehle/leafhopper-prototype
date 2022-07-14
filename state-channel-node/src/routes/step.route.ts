import { Router } from 'express';
import Identity from '../classes/Identity';
import ConformanceCheck from '../classes/Conformance';
import controller from '../controllers/step.controller';
import Routing from '../classes/Routing';

const step = (
  router: Router,
  identity: Identity,
  conformance: ConformanceCheck
  ): Router => {
  return router.post('/', controller(identity, conformance));
}

export default step;
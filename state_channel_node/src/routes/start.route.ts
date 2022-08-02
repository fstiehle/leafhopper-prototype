import { Router } from 'express';
import ConformanceCheck from '../classes/Conformance';
import controller from '../controllers/start.controller';
import Oracle from '../classes/Oracle';

const start = (
  router: Router,
  conformance: ConformanceCheck,
  oracle: Oracle
  ): Router => {
  return router.put('/:root(0[xX][0-9a-fA-F]+)', controller(conformance, oracle));
}

export default start;
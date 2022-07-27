import { Router } from 'express';
import ConformanceCheck from '../classes/Conformance';
import controller from '../controllers/dispute.controller';
import Oracle from '../classes/Oracle';

const dispute = (
  router: Router,
  conformance: ConformanceCheck,
  oracle: Oracle
  ): Router => {
  return router.post('/', controller(conformance, oracle));
}

export default dispute;
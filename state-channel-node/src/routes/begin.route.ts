import { Router } from 'express';
import Identity from '../classes/Identity';
import ConformanceCheck from '../classes/ConformanceCheck';
import controller from '../controllers/begin.controller';

const begin = (router: Router, identity: Identity, conformance: ConformanceCheck): Router => {
  router.get('/:id([0-9]+)', controller(identity, conformance));
  return router;
}

export default begin;
import express, { Router } from 'express';
import Identity from '../classes/Identity';
import ConformanceCheck from '../classes/Conformance';
import controller from '../controllers/step.controller';
import Oracle from '../classes/Oracle';

const step = (
  identity: Identity,
  conformance: ConformanceCheck,
  oracle: Oracle
  ): Router => {
  return express.Router().post('/', controller(identity, conformance, oracle));
}

export default step;
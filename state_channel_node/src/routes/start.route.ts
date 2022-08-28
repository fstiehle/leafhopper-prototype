import express, { Router } from 'express';
import ConformanceCheck from '../classes/Conformance';
import controller from '../controllers/start.controller';
import Oracle from '../classes/Oracle';

const start = (
  conformance: ConformanceCheck,
  oracle: Oracle
  ): Router => {
  return express.Router().put('/:root(0[xX][0-9a-fA-F]+)', controller(conformance, oracle));
}

export default start;
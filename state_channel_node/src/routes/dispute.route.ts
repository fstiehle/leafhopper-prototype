import express, { Router } from 'express';
import ConformanceCheck from '../classes/Conformance';
import controller from '../controllers/dispute.controller';
import Oracle from '../classes/Oracle';

const dispute = (
  conformance: ConformanceCheck,
  oracle: Oracle
  ): Router => {
  return express.Router().post('/', controller(conformance, oracle));
}

export default dispute;
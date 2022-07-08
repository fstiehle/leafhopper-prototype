import express, { Router } from 'express';
import { ConformanceCheck } from '../services/ConformanceCheck';
import controller from '../controllers/step.controller';

const step = (router: Router, conformance: ConformanceCheck): Router => {
  return router.post('/:id([0-9]+)', controller(conformance));
}

export default step;
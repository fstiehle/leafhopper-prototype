import express, { Router } from 'express';
import { ConformanceCheck } from '../services/ConformanceCheck';
import controller from '../controllers/begin.controller';

const begin = (router: Router, conformance: ConformanceCheck): Router => {
  router.get('/:id([0-9]+)', controller(conformance));
  return router;
}

export default begin;
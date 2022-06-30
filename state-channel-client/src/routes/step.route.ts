import express from 'express';
import step from '../controllers/step.controller';
const router = express.Router();

router.post('/:user(^[A-Za-z]+)/:id([0-9]+)', step);

export default router;
import express from 'express';
import begin from '../controllers/begin.controller';
const router = express.Router();

router.get('/:user([A-Za-z]+)/:id([0-9]+)', begin);
router.post('/:user(^[A-Za-z]+)/:id([0-9]+)', begin);

export default router;
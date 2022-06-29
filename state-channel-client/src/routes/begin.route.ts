import express from 'express';
import begin from '../controllers/begin.controller';
const router = express.Router();

router.get('/:id([0-9]+)', begin);
router.post('/:id([0-9]+)', begin);

export default router;
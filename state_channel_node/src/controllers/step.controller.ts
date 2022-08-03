import { Request, Response, NextFunction } from 'express';
import Step from '../classes/Step';
import ConformanceCheck from '../classes/Conformance';
import Identity from '../classes/Identity';
import Oracle from '../classes/Oracle';

/**
 * Receives new token state from other participant and task to invoke 
 * Check if task to invoke leads to new token state that was sent
 */
const step = (identity: Identity, conformance: ConformanceCheck, oracle: Oracle) => {
  return async (req: Request, res: Response, next: NextFunction) => {

    // Check blockchain for possible dispute state
    if (oracle.contract && await oracle.isDisputed) {
      console.log('Dispute is raised.');
      res.status(400).send("A dispute is currently active.");
      return next();
    }

    const receivedStep = new Step(req.body.step);
    if (!receivedStep) {
      return next(new Error(`Malformed JSON: ${JSON.stringify(req.body)} to ${JSON.stringify(receivedStep)}`));
    }

    // Send signed ACK or error back
    if (!conformance.step(receivedStep)) {
      res.status(403).send("Non-conforming behaviour");
      return next();
    }

    await receivedStep.sign(identity.wallet, identity.me);
    res.setHeader('Content-Type', 'application/json');
    res.status(200).send(JSON.stringify(receivedStep));
    return next();
  }
}

export default step;
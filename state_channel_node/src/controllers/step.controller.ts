import { Request, Response, NextFunction } from 'express';
import Step from '../classes/Step';
import ConformanceCheck from '../classes/Conformance';
import Identity from '../classes/Identity';
import Oracle from '../classes/Oracle';
import SupplyChainConformance from '../classes/SupplyChainConformance';

/**
 * Receives new token state from other participant and task to invoke 
 * Check if task to invoke leads to new token state that was sent
 */
const step = (identity: Identity, conformance: ConformanceCheck, oracle: Oracle) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    console.log("Inside step route: " + req.protocol + '://' + req.get('host') + req.originalUrl);
    // Check blockchain for possible dispute state
    if (oracle.contract && await oracle.isDisputed()) {
      console.log('Dispute is raised.');
      res.status(400).send("A dispute is currently active.");
      return next();
    }

    let receivedStep: Step;
    try {
      receivedStep = new Step(req.body.step);
    } catch (err) {
      return next(new Error(`Malformed JSON: ${JSON.stringify(req.body)}`));
    }
    const taskID = receivedStep.taskID;
    const prevSteps = new Array<Step>();
    if (taskID !== 0) {
      // Check previous steps
      // these checks fail silent but conformance.checkStep(receivedStep) will fail 
      // if not all required previosus steps are present
      if (!req.body.prevSteps) {
        throw new Error(`Malformed JSON`);
      }

      for (const bodyStep of req.body.prevSteps) {
        let prevStep: Step
        try {
          prevStep = new Step(bodyStep);
        } catch(err) {
          console.log(`Malformed JSON: ${JSON.stringify(bodyStep)}`);
        }
        prevSteps.push(prevStep);
      }

      for (const prevStep of prevSteps) {
        if (conformance.checkStepisFinalised(prevStep)) {
          conformance.step(prevStep);
        }
      }
    }

    // Send signed ACK or error back
    if (!conformance.checkStep(receivedStep)) {
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
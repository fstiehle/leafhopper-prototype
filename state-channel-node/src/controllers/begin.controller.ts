import { Request, Response, NextFunction } from 'express';
import ConformanceCheck from '../classes/Conformance';
import { doRequest } from '../helpers/util';
import Step from '../classes/Step';
import Identity from '../classes/Identity';
import Routing from '../classes/Routing';
import StepMessage, { StepMessageProperties } from '../classes/StepMessage';
import Oracle from '../classes/Oracle';

/**
 * TODO
 */
const begin = (
  identity: Identity,
  conformance: ConformanceCheck,
  routing: Routing,
  oracle: Oracle
  ) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const taskID = parseInt(req.params.id);
    // For testing, we permit malicous behaviour issued from our own node.
    // Normally, the following code can be used to prevent some errors early locally.
    // if (!conformance.check(taskID, req.params.user)) {
    //   return res.status(406).send("Non conforming behaviour.");
    // }

    // Check blockchain for possible dispute state
    if (oracle.contract && await oracle.isDisputed) {
      console.log('Dispute is raised.');
      res.status(400).send("A dispute is currently active.");
      return next();
    }

    const step = new Step({
      from: identity.me,
      caseID: 0,
      taskID: taskID
    })
    await step.sign(identity.wallet);
    const receiver = routing.next(taskID);
    const options = {
      headers: {
        'Content-Type': 'application/json',
      },
      ...routing.get(receiver)
    }
    await doRequest(
      options,
      JSON.stringify({step, prevSteps: conformance.steps})
    ).then(value => {
      // Wait for ACK of sent step
      const stepMessage = new StepMessage().fromJSON(value as unknown as StepMessageProperties);

      if (!stepMessage?.step || !stepMessage?.prevSteps) {
        console.error(`Malformed JSON: ${JSON.stringify(req.body)} to ${JSON.stringify(stepMessage)}`);
        res.status(400).send("Malformed JSON");
        return next();
      }

      if (!stepMessage.verifySignature(conformance.pubKeys.get(receiver))) {
        throw new Error(`Expected ACK from ${receiver}: signature verification failed.`);
      }
      if (JSON.stringify({step, prevSteps: conformance.steps})
       !== JSON.stringify({step: stepMessage.step, prevSteps: stepMessage.prevSteps})
      ) {
        throw new Error(`Expected ACK from ${receiver}: different step`);
      }
      console.log('ACK returned');
      res.sendStatus(200);
      return next();
    })
    .catch(error => {
      console.log('Error when waiting for ACK');
      next(error);
    })
  }
}

export default begin;
import { Request, Response, NextFunction } from 'express';
import ConformanceCheck from '../classes/Conformance';
import Step, { StepPublicProperties } from '../classes/Step';
import Identity from '../classes/Identity';
import Routing from '../classes/Routing';
import Oracle from '../classes/Oracle';
import RequestServer from '../classes/RequestServer';
import SupplyChainConformance from '../classes/SupplyChainConformance';

/**
 * Handles the /begin:taskid API. 
 * It appends the submitted taskid to the current tokenState and sends a transition proposal 
 * encoded as Step to the network using the Routing class.
 */
const begin = (
  identity: Identity,
  conformance: ConformanceCheck,
  routing: Routing,
  oracle: Oracle,
  requestServer: RequestServer
  ) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const taskID = parseInt(req.params.id);
    console.log('begin', taskID);
    // Check blockchain for possible dispute state
    if (oracle.contract && await oracle.isDisputed()) {
      console.log('Dispute is raised.');
      res.status(400).send("A dispute is currently active.");
      return next();
    }

    const prevSteps = new Array<Step>();
    if (taskID !== 0 && req.body.prevSteps) {
      for (const bodyStep of req.body.prevSteps) {
        let prevStep: Step;
        try {
          prevStep = new Step(bodyStep);
        } catch(err) {
          console.error(err);
          return next(new Error(`Malformed JSON: ${JSON.stringify(bodyStep)}`));
        }
        prevSteps.push(prevStep);
      }

      // normally, we would make a local conformance check
      // but to enable local malicious behaviour in our test env, we do not do so
      prevSteps.forEach(s => {
        conformance.steps.push(s);
      })
      conformance.tokenState = prevSteps[prevSteps.length-1].newTokenState;
    }

    const step = new Step({
      from: identity.me,
      caseID: 0,
      taskID: taskID,
      newTokenState: SupplyChainConformance.task([...conformance.tokenState], taskID)
    })
    await step.sign(identity.wallet, identity.me);

    // Broadcast
    // eslint-disable-next-line
    const broadcast = new Array<Promise<any>>();
    for (const [participant, route] of routing.routing) { 
      if (participant === identity.me) continue; // Exclude myself from broadcast
      const options = {
        headers: {
          'Content-Type': 'application/json',
        },
        ...route
      }
      broadcast[participant] = requestServer.doRequest(
        options,
        JSON.stringify({step, prevSteps}) 
      );
    }

    // Wait for all ACKs
    Promise.all(broadcast).then(results => {
      results.forEach((result, participant) => {
        if (participant === identity.me) return; // Exclude myself from broadcast
        const receivedStep = new Step(JSON.parse(result) as unknown as StepPublicProperties);
        if (!receivedStep) {
          throw new Error(`Malformed JSON: ${JSON.stringify(req.body)} to ${JSON.stringify(receivedStep)}`);
        }

        if (!receivedStep.verifySignature(
          conformance.pubKeys.get(participant), 
          receivedStep.signature[participant]
        )) {
          throw new Error(`Expected ACK from ${participant}: signature verification failed.`);
        }

        if (JSON.stringify(step.getSignablePart())
        !== JSON.stringify(step.getSignablePart())
        ) {
          throw new Error(`Expected ACK from ${participant}: different step`);
        }

        if (step.signature[identity.me] !== receivedStep.signature[identity.me]) {
          throw new Error(`Expected ACK from ${participant}: swapped signature`);
        }

        step.signature[participant] = receivedStep.signature[participant];
        console.log('ACK returned from', participant);
      })

      conformance.steps[taskID] = step;
      res.setHeader('Content-Type', 'application/json');
      res.status(200).send(JSON.stringify({step}));
      return next();
    })
    .catch(error => {
      console.error(error);
      return next(new Error('Error when waiting for ACK of participant. ' + JSON.stringify(broadcast)));
    })
  }
}

export default begin;
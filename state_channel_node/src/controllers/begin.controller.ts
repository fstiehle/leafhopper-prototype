import { Request, Response, NextFunction } from 'express';
import ConformanceCheck from '../classes/Conformance';
import Step, { StepPublicProperties } from '../classes/Step';
import Identity from '../classes/Identity';
import Routing from '../classes/Routing';
import Oracle from '../classes/Oracle';
import RequestServer from '../classes/RequestServer';
import SupplyChainConformance from '../classes/SupplyChainConformance';

const begin = (
  identity: Identity,
  conformance: ConformanceCheck,
  routing: Routing,
  oracle: Oracle,
  requestServer: RequestServer
  ) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const taskID = parseInt(req.params.id);
    // Check blockchain for possible dispute state
    if (oracle.contract && await oracle.isDisputed()) {
      console.log('Dispute is raised.');
      res.status(400).send("A dispute is currently active.");
      return next();
    }

    if (taskID !== 0) {
      // Check if previous step has been signed by all participants
      let prevStep: Step;
      try {
        prevStep = new Step(req.body.step);
      } catch(err) {
        console.error(err);
        throw new Error(`Malformed JSON: ${JSON.stringify(req.body.step)} to ${JSON.stringify(prevStep)}`);
      }

      if (prevStep.signature.length !== routing.routing.size) {
        throw new Error(`Previous step not signed by all participants: ${JSON.stringify(prevStep.signature)}`);
      }

      if (JSON.stringify(prevStep.newTokenState) !== JSON.stringify(conformance.tokenState)) {
        throw new Error(`Previous step not in order: ${JSON.stringify(prevStep.taskID)}`);
      }
      prevStep.signature.forEach((sig, par) => {
        if (!prevStep.verifySignature(conformance.pubKeys.get(par), sig)) {
          throw new Error(`Signature of participant: ${par} not matching`);
        }
      });

      conformance.steps[prevStep.taskID] = prevStep;
      conformance.lastCheckpoint = prevStep.taskID; // TODO: No need anymore conformance now always last checkpoint
    }

    // Prepare new Step if taskID is next conforming behaviour
    // In case of AND branch, wait for both ACKs
    const step = new Step({
      from: identity.me,
      caseID: 0,
      taskID: taskID,
      newTokenState: SupplyChainConformance.task([...conformance.tokenState], taskID)
    })
    await step.sign(identity.wallet, identity.me);

    // Broadcast
    const broadcast = new Array<Promise<any>>();
    for (const [participant, route] of routing.routing) {
      
      const options = {
        headers: {
          'Content-Type': 'application/json',
        },
        ...route
      }
      broadcast[participant] = requestServer.doRequest(
        options,
        JSON.stringify({step}) // TODO: add previous step so all participants can sign this step and follow the no-skip rule
      );
    }

    // Wait for all ACKs
    Promise.all(broadcast).then(results => {
      results.forEach((result, participant) => {
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

      console.log('All ACKs returned');
      // TODO: set state to new step
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
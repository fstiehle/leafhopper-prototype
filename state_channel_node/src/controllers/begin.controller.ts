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
    // For testing, we permit malicous behaviour issued from our own node.
    // Normally, the following code can be used to prevent some errors early locally.
    // if (!conformance.check(taskID, req.params.user)) {
    //   return res.status(406).send("Non conforming behaviour.");
    // }

    // Check blockchain for possible dispute state
    if (oracle.contract && oracle.isDisputed) {
      console.log('Dispute is raised.');
      res.status(400).send("A dispute is currently active.");
      return next();
    }

    // Check if previous step has been signed by all participants
    if (taskID !== 0) {
      const prevStep = new Step(req.body);
      if (!prevStep) {
        throw new Error(`Malformed JSON: ${JSON.stringify(req.body)} to ${JSON.stringify(prevStep)}`);
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
      conformance.lastCheckpoint = prevStep.taskID;
    }

    // Prepare new Step
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
        JSON.stringify({step})
      );
    }

    // Wait for all ACKs
    Promise.all(broadcast).then(results => {
      results.forEach((result, participant) => {
        const receivedStep = new Step(result as unknown as StepPublicProperties);

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
      res.setHeader('Content-Type', 'application/json');
      res.status(200).send(JSON.stringify(step));
      return next();

    })
    .catch(error => {
      console.error(error);
      return next(new Error('Error when waiting for ACK of participant. ' + JSON.stringify(broadcast)));
    })
  }
}

export default begin;
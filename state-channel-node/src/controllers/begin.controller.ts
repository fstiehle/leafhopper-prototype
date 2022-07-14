import { Request, Response, NextFunction } from 'express';
import ConformanceCheck from '../classes/Conformance';
import { doRequest } from '../helpers/util';
import Step from '../classes/Step';
import Identity from '../classes/Identity';
import Routing from '../classes/Routing';
import StepMessage, { StepMessageProperties } from '../classes/StepMessage';

/**
 * 
 app.get('/authenticate', (req, res) => {
  const cert = req.connection.getPeerCertificate();
  if (req.client.authorized) {
    res.send(`Hello [${cert.subject.CN}], your certificate was issued by [${cert.issuer.CN}]\n\n`);
  } else if (cert.subject) {
    res.status(403).send(`Sorry [${cert.subject.CN}], certificates from [${cert.issuer.CN}] are not welcome here.`)
  } else {
    res.status(401).send(`Sorry, client certificate required to continue`);
  }
});
 */

/**
 * 
 * @param req 
 * @param res 
 * @param next 
 */
const begin = (identity: Identity, conformance: ConformanceCheck, routing: Routing) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const taskID = parseInt(req.params.id);
    //if (!conformance.check(taskID, req.params.user)) {
    //  return res.status(406).send("Non conforming behaviour.");
    //}
    // TODO: Check blockchain for possible dispute state
    const step = new Step({
      from: identity.me,
      caseID: 0,
      taskID: taskID
    })
    .sign(identity.privateKey, 'test');
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
      // Wait for and TODO: record ACK of sent step
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
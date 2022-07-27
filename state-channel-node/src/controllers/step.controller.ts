import { Request, Response, NextFunction } from 'express';
import ConformanceCheck from '../classes/Conformance';
import Identity from '../classes/Identity';
import StepMessage from '../classes/StepMessage';
import Oracle from '../classes/Oracle';

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
  
  stepResponse.on('data', data => {
        dataChunks.push(data);
      })
      .on('end', () => {
        res.json({ answer: 42 });Buffer.concat(bodyChunks);
      });
});
 */

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

    const stepMessage = new StepMessage().fromJSON(req.body);
    if (!stepMessage?.step || !stepMessage?.prevSteps) {
      console.error(`Malformed JSON: ${JSON.stringify(req.body)} to ${JSON.stringify(stepMessage)}`);
      res.status(400).send("Malformed JSON");
      return next();
    }

    // TODO: Check if certificate equals step.from
    // Send signed ACK or error back
    if (!conformance.step(stepMessage.step, stepMessage.prevSteps)) {
      res.status(403).send("Non-conforming behaviour");
      return next();
    }
    
    await stepMessage.sign(identity.wallet);
    res.status(200).send(JSON.stringify(stepMessage))
    return next();
  }
}

export default step;
import { Request, Response, NextFunction } from 'express';
import ConformanceCheck from '../classes/ConformanceCheck';
import Identity from '../classes/Identity';
import StepJSONPayload from '../classes/StepJSONPayload';

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
 * @param req 
 * @param res 
 * @param next 
 */
const step = (identity: Identity, conformance: ConformanceCheck) => {
  return (req: Request, res: Response, next: NextFunction) => {
    let payload: StepJSONPayload;
    try {
      payload = JSON.parse(req.body);
    } catch (err) {
      res.status(403).send(err);
      return next();
    }

    // Check if certificate equals step.from
    // TODO: Send signed ACK or error back
    console.log(conformance.step(payload.step, payload.prevSteps));
    res.sendStatus(200);
  }
}

export default step;
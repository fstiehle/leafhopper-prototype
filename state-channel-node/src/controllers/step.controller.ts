import { Express, Request, Response, NextFunction } from 'express';
import { ConformanceCheck } from '../services/ConformanceCheck';
import Participant from "../services/Participant";

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
// TODO: Parse tokenState from JSON bod
const step = (conformance: ConformanceCheck) => {
  return (req: Request, res: Response, next: NextFunction) => {
    // TODO: verif signature chain and catch up on old tasks
    // TODO: { caseID, taskID, salt, signature }
    console.log(`Step with ${parseInt(req.params.id)}, previous messages TODO, and new token state ${req.body.tokenState}`);
    //conformance.check(parseInt(req.params.id), "");
    res.sendStatus(500);
    next();
  }
}

export default step;
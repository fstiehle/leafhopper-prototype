import { Express, Request, Response, NextFunction } from 'express';
import conformance from '../services/conformance.service';
import controlFlow from '../services/controlFlow.service';

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
const begin = (req: Request, res: Response, next: NextFunction) => {
  const taskID = parseInt(req.params.id);
  if (!conformance.check(taskID, req.params.user)) {
    res.statusCode = 406;
    res.statusMessage = "Non conforming behaviour."
    return res.send();
  }
  // routing
  controlFlow.callNextParticipant(taskID, conformance.tokenState);
  next();
}

export default begin;
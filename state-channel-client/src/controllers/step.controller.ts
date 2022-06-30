import { Express, Request, Response, NextFunction } from 'express';
import conformance from '../services/conformance.service';

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
 * Receives new token state from other participant and task to invoke 
 * Check if task to invoke leads to new token state that was sent
 * @param req 
 * @param res 
 * @param next 
 */
// TODO: Parse tokenState from JSON bod
const step = (req: Request, res: Response, next: NextFunction) => {
  // TODO: verif signature chain
  conformance.check(parseInt(req.params.id), req.params.user);
  next();
}

export default step;
import { Express, Request, Response, NextFunction } from 'express';
import { ConformanceCheck } from '../services/ConformanceCheck';
import {  } from '../services/ConformanceCheck';
import { doRequest } from '../helpers/util';

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
const begin = (conformance: ConformanceCheck) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const taskID = parseInt(req.params.id);
    // TODO: build step object
    //if (!conformance.check(taskID, req.params.user)) {
    //  return res.status(406).send("Non conforming behaviour.");
    //}
    // TODO: Check blockchain for possible dispute state 
    // TODO: Ack the step
    console.log("Conformance check passed...")
    const options = {
      headers: {
        'Content-Type': 'application/json',
      },
      ...conformance.routing[taskID]
    }
    options.path = `${options.path}/${taskID}`;
    await doRequest(
      options,
      JSON.stringify({taskID, tokenState: conformance.tokenState})
    ).then(value => {
      console.log('resolved', value);
    })
    .catch(error => next(error));
  }
}

export default begin;
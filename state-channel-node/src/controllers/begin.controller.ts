import { Express, Request, Response, NextFunction } from 'express';
import ConformanceCheck from '../classes/Conformance';
import { doRequest } from '../helpers/util';
import Step from '../classes/Step';
import Identity from '../classes/Identity';

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
const begin = (identity: Identity, conformance: ConformanceCheck) => {
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
    .sign(identity.privateKey);

    const options = {
      headers: {
        'Content-Type': 'application/json',
      },
      ...conformance.routing.get(identity.me)
    }
    options.path = `${options.path}/${taskID}`;
    await doRequest(
      options,
      JSON.stringify({step, stepprevSteps: conformance.steps})
    ).then(value => {
      // TODO: Wait for and record ACK of sent step
      console.log('resolved', value);
    })
    .catch(error => next(error));
  }
}

export default begin;
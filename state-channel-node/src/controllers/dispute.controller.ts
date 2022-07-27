import { Request, Response, NextFunction } from 'express';
import ConformanceCheck from '../classes/Conformance';
import Oracle from '../classes/Oracle';

/**
 * 
 * @param conformance 
 * @param oracle 
 * @returns 
 */
const dispute = (conformance: ConformanceCheck, oracle: Oracle) => {
  return async (req: Request, res: Response, next: NextFunction) => {

    if (!oracle.contract) {
      res.sendStatus(500);
      return next(); 
    }

    // Check blockchain for possible dispute state
    if (await oracle.isDisputed()) {

      console.log('Dispute is already raised.');
      if (await oracle.state(conformance.steps)) {
        res.sendStatus(200);
        return next();
      }
      res.status(500).send("Could not submit state to answer dispute with local steps.");
      return next();

    } else {

      if (await oracle.dispute(conformance.steps)) {
        res.sendStatus(200);
        return next();
      }
      res.status(500).send("Could not raise dispute with local steps.");
      return next();
    }
  }
}

export default dispute;
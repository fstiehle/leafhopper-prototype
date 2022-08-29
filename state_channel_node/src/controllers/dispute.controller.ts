import { Request, Response, NextFunction } from 'express';
import { setgroups } from 'node:process';
import ConformanceCheck from '../classes/Conformance';
import Oracle from '../classes/Oracle';

/* Handles the /dispute endpoint. It uses the Oracle class to trigger a dispute on the blockchain with the current tokenState. **/
const dispute = (conformance: ConformanceCheck, oracle: Oracle) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (!oracle.contract) {
      return next(new Error("No Contract installed.")); 
    }

    if (conformance.steps.length === 0) {

      if (await oracle.dispute()) {
        res.sendStatus(200);
        return next();
      }

    } else {

      if (await oracle.submit(conformance.steps[conformance.steps.length-1])) {
        res.sendStatus(200);
        return next();
      }

    }
    
    return next(new Error("Could not raise dispute with local steps.")); 
  }
}

export default dispute;
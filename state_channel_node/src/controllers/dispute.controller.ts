import { Request, Response, NextFunction } from 'express';
import ConformanceCheck from '../classes/Conformance';
import Oracle from '../classes/Oracle';

/* Handles the /dispute endpoint. It uses the Oracle class to trigger a dispute on the blockchain with the current tokenState. **/
const dispute = (conformance: ConformanceCheck, oracle: Oracle) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    console.log("Inside dispute route: " + req.protocol + '://' + req.get('host') + req.originalUrl);
    if (!oracle.contract) {
      return next(new Error("No Contract installed.")); 
    }

    // Check blockchain for possible dispute state
    if (await oracle.isDisputed()) {

      console.log('Dispute is already raised.');
      if (await oracle.state(conformance.steps[conformance.steps.length-1])) {
        res.sendStatus(200);
        return next();
      }

      return next(new Error("Could not submit state to answer dispute with local steps.")); 

    } else {

      if (await oracle.dispute(conformance.steps[conformance.steps.length-1])) {
        res.sendStatus(200);
        return next();
      }

      return next(new Error("Could not raise dispute with local steps.")); 
    }
  }
}

export default dispute;
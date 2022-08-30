import { Request, Response, NextFunction } from 'express';
import ConformanceCheck from '../classes/Conformance';
import Oracle from '../classes/Oracle';

/**
 * Handles the /attach:contractAddress API. Mainly to make benchmarking easier. 
 * It alows to reset the state of a node and attach a new root contract with address contractAddress.
 */
const start = (conformance: ConformanceCheck, oracle: Oracle) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const address = req.params.root;
    oracle.attach(address);
    conformance.reset();
    console.log("New instance with root contract", address)
    res.sendStatus(200);
    return next();
  }
}

export default start;
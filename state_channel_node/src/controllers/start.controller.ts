import { Request, Response, NextFunction } from 'express';
import ConformanceCheck from '../classes/Conformance';
import Oracle from '../classes/Oracle';

/**
 * 
 * @param conformance 
 * @param oracle 
 * @returns 
 */
const start = (conformance: ConformanceCheck, oracle: Oracle) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    console.log("Inside attach route: " + req.protocol + '://' + req.get('host') + req.originalUrl);
    const address = req.params.root;
    oracle.attach(address);
    conformance.reset();
    console.log("New instance with root contract", address)
    res.sendStatus(200);
    return next();
  }
}

export default start;
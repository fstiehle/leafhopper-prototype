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
    const address = req.params.address;
    oracle.attach(address);
    conformance.reset();
    res.sendStatus(200);
    return next();
  }
}

export default start;
import { assert } from 'console';
import Replayer from './classes/Replayer';
import replaylog from './generated_traces.json';

// ignore certificate not signed for localhost
process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = '0'; 

(async () => {
  console.log("Replay log with conforming logs...");
  for (const trace of replaylog.conforming) {
    // deploy new instance
    const replayer = new Replayer();
    const address = replayer.deployContract("stateChannel");
    await replayer.attach(address);
    console.log(trace)
    for (const event of trace) {
      try {
        await replayer.replay(event[0], event[1]);
      } catch(err) {
        assert(!err);
      }
    }
    console.log("Sucess.")
  }

  console.log("Replay log with generated non-conforming logs...");
  for (const trace of replaylog.generated) {
    // deploy new instance
    const replayer = new Replayer();
    const address = replayer.deployContract("stateChannel");
    await replayer.attach(address);
    const errors = new Array<any>();
    console.log(trace)
    for (const [i, v] of trace.entries()) {
      try {
        await replayer.replay(v[0], v[1]);
      } catch(err) {
        errors.push(err);
      }
    }
    assert(errors.length > 0);
    console.log("Sucess. Non-conformance last detected: ", errors.pop())
  }

})()
.then(() => process.exit(0))
  .catch((err) => {
    console.error(err.message);
    process.exit(1);
  });
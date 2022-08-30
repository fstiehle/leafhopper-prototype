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
        return new Error("Conforming behaviour was considered non-conforming");
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
    const errors = new Array<Error>();
    console.log(trace)
    for (const [_, v] of trace.entries()) {
      try {
        await replayer.replay(v[0], v[1]);
      } catch(err) {
        errors.push(new Error(`(task:${v[0]}, initiator:${v[1]}): ${err})`));
      }
    }
    if (errors.length === 0) {
      return new Error("Non-conforming behaviour was not spoted!");
    }
    assert(errors.length > 0);
    console.log("Sucess. Non-conformance last detected: ", errors.pop())
  }

  console.log("Sucess. All conforming and non-conforming behaviour detected accordingly");

})()
.then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
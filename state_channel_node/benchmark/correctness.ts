import Replayer from './classes/Replayer';

(async () => {
  const replayer = new Replayer();
  const address = replayer.deployContract("stateChannel");
  console.log(address);
  //await replayer.attach(address);
  
  console.log("Replay logs ...");
  //await replayer.replay(Participant.BulkBuyer, 0);
  //await replayer.replay(Participant.Manufacturer, 1);

})()
.then(() => process.exit(0))
  .catch((err) => {
    console.error(err.message);
    process.exit(1);
  });
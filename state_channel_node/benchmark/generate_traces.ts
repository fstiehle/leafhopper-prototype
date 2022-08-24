import fs from 'fs';

const traces = {
  "conforming": [
      [
          [0, 0],
          [1, 1],
          [3, 2],
          [5, 2],
          [7, 4],
          [8, 3],
          [9, 3],
          [10, 4],
          [11, 1],
          [12, 1]
      ],
      [
          [0, 0],
          [1, 1],
          [5, 2],
          [3, 2],
          [7, 4],
          [8, 3],
          [9, 3],
          [10, 4],
          [11, 1],
          [12, 1]
      ]
  ],
  "generated": [] as number[][][]
}

/// Take conforming traces of form [event,initiator] and modify them with following operators:
///	- add an event
///	- remove an event
///	- switch the order of two events
/// Make sure that the manipualted trace is not in the set of the manually set conforming traces
const to_generate = 2
for (let index = 0; index < to_generate; index++) {
  const operation = Math.floor(Math.random() * 3);
  const taskID = Math.floor(Math.random() * 13);
  const initiator = Math.floor(Math.random() * 5);
  const traceGenerated = [...traces.conforming[Math.floor(Math.random() * 2)]];
  switch (operation) {
    case 0:
      console.log(traceGenerated);
      traceGenerated.splice(Math.floor(Math.random() * traceGenerated.length), 0, [taskID, initiator]);
      console.log('add', traceGenerated);
      break;
    case 1:
      console.log(traceGenerated);
      // remove an event
      traceGenerated.forEach((_, i) => {
        if(i === taskID) traceGenerated.splice(i, 1);
      });
      console.log('remove', traceGenerated);
      break;
    case 2: {
      console.log(traceGenerated);
      // switch the order of two events
      const toSwitch = Math.floor(Math.random() * 12)
      const tmp = traceGenerated[toSwitch];
      traceGenerated[toSwitch] = traceGenerated[toSwitch+1];
      traceGenerated[toSwitch+1] = tmp;
      console.log('switch', traceGenerated);
      break;
    }
  }

  if (traces.conforming.every(t => JSON.stringify(t) === JSON.stringify(traceGenerated))) {
    console.log("Conforming trace generated", traceGenerated);
    continue;
  }

  traces.generated.push(traceGenerated);
}

try {
  fs.writeFile("./benchmark/generated_traces.json", JSON.stringify(traces, null, 2), function(err) {
    if (err) {
      console.log(err);
    }
  });
} catch (err) {
  console.error(err);
}
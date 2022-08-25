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
const to_generate = 60
let conforming = 0;
for (let index = 0; index < to_generate; index++) {
  const operation = Math.floor(Math.random() * 3);
  const taskID = Math.floor(Math.random() * 13);
  const index = Math.floor(Math.random() * 10);
  const initiator = Math.floor(Math.random() * 5);
  let traceGenerated = [...traces.conforming[Math.floor(Math.random() * 2)]];
  switch (operation) {
    case 0:
      // add an event
      console.log(traceGenerated);
      traceGenerated.splice(Math.floor(Math.random() * traceGenerated.length), 0, [taskID, initiator]);
      console.log('add', traceGenerated);
      break;
    case 1:
      console.log(traceGenerated);
      // remove an event
      traceGenerated = traceGenerated.filter(obj => obj[0] !== taskID);
      console.log('remove', traceGenerated);
      break;
    case 2: {
      console.log(traceGenerated);
      // switch the order of two events
      const _index = index >= 9 ? index - 1: index; 
      const tmp = traceGenerated[_index];
      traceGenerated[_index] = traceGenerated[_index+1];
      traceGenerated[_index+1] = tmp;
      console.log('switch', traceGenerated);
      break;
    }
  }
  
  if (traces.conforming.some(t => JSON.stringify(t) === JSON.stringify(traceGenerated))) {
    console.log("Conforming trace generated, skip", traceGenerated);
    conforming++
    continue;
  }

  traces.generated.push(traceGenerated);
}

console.log("Generated", to_generate - conforming, "traces, generated", conforming, "conforming traces, which were skipped.")

try {
  fs.writeFile("./benchmark/generated_traces.json", JSON.stringify(traces, null, 2), function(err) {
    if (err) {
      console.log(err);
    }
  });
} catch (err) {
  console.error(err);
}
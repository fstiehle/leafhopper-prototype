# State Channel Node

- [How to run it?](https://github.com/fstiehle/leafhopper-prototype#run-it) 

# API

| Method | URI                     | Body Payload                                       | Decription                                                                                                                      |
|--------|-------------------------|----------------------------------------------------|---------------------------------------------------------------------------------------------------------------------------------|
| POST   | /begin:taskID           | {'prevSteps': Step[]} or {}                        | API for state channel network external components. It instructs the node to propose the task with :taskIDto the network.        |
| POST   | /step                   | {step: Step, 'prevSteps': Step[]}  or {step: Step} | API internal to the state channel network over witch the different nodes  are proposing new transitions and collect signatures. |
| POST   | /dispute                |                                                    | Instructs a node to attempt to trigger a dispute with its current state.                                                        |
| PUT    | /attach:contractAddress |                                                    | Attaches a new root contract and resets the node.                                                                       |

# Project Structure

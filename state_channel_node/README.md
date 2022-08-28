# State Channel Node

- [How to run it?](https://github.com/fstiehle/leafhopper-prototype#run-it) 

The State Channel Node is a node.js server and holds the current state of the process and maintains a connection to each other state channel node in the network. It can receive requests from outside over the `/begin:taskid` route to advance the state of the process. The server can be deployed with different identities. Based on their identity they will be assigned a unique RSA key pair and blockchain address.

# API

| Method | URI                     | Body Payload                                       | Decription                                                                                                                      |
|--------|-------------------------|----------------------------------------------------|---------------------------------------------------------------------------------------------------------------------------------|
| POST   | /begin:taskID           | {'prevSteps': Step[]} or {}                        | API for state channel network external components. It instructs the node to propose the task with :taskIDto the network.        |
| POST   | /step                   | {'step': Step, 'prevSteps': Step[]}  or {'step': Step} | API internal to the state channel network over witch the different nodes  are proposing new transitions and collect signatures. |
| POST   | /dispute                |                                                    | Instructs a node to attempt to trigger a dispute with its current state.                                                        |
| PUT    | /attach:contractAddress |                                                    | Attaches a new root contract and resets the node.                                                                       |

# Project Structure
- `benchmark` contains the code to perform the correctness verification. See replication of evaluation. 
- `keys` contains a script which: (i) generates a root certificate, (ii) generates RSA key pairs for all participants, (iii) issues a certificate for each participant.
- `src` contains the source files of the node, see software architecture below. Build with `npm run build`
  - `classes`: ([See Classes below](https://github.com/fstiehle/leafhopper-prototype/tree/main/state_channel_node#classes)) Classes encapsulate information and functionality used by the controllers.
  - `controllers`: ([See Controller below](https://github.com/fstiehle/leafhopper-prototype/tree/main/state_channel_node#controller)) A controller handles the incoming API requests as seen above.
- `test` contains test files for the node. Run with `npm run test`
- `contracts`: contain the solidity files, test and deployment scripts for the root contract. It also conatins a baseline contract, which was used to compare Leafhopper to a full on-chain approach.
# Software Architecture

## Classes
Classes encapsulate information and functionality used by the controllers. We depict below the interfaces providing the bulk of functionality.

![Main Classes](https://github.com/fstiehle/leafhopper-prototype/blob/fb061d5da36aa516e4f209426b574182544fd3f4/figures/node_classes.svg)

- `Conformance.ts`: An interface to encapsulate all conformance related functionality; mainly verifying instances of Step. This class also holds the current process state, called `tokenState`.
  - `SupplyChainConformance.ts`: The concrete implementation for the supply chain use cases.
- `Routing.ts`: Routing holds the network information necessary to reach other participants.
  - `SupplyChainRouting.ts`:  The concrete implementation for the supply chain use cases.
- `Signable.ts`: An abstract class providing crypographic signature functionality
  - `Step.ts`: Step encodes all the information necessary for a transition, it is the main data type.
- `Identity.ts`: Encapsulating the information a node must have of itself, such as wallet (private signing key) and participant id.
- `Oracle.ts`: Providing functionality to communicate with the root contract.
- `Participant.ts`: Enum of participants.
- `RequestServer.ts`: Providing HTTPS functionality to be able to communicate with other participants.
- `RoutingInformation.ts`: A class used by Routing.ts to encapsulate a participants' routing related information (e.g., hostname).

## Controller

A controller handles the incoming API requests as seen above. It uses aformentioned classes to perform their responsibilities as below.

- `begin.controller.ts`: Handles the `/begin:taskid` API. It appends the submitted taskid to the current `tokenState` and sends a transition proposal encoded as `Step` to the network using the `Routing` class.
- `dispute.controller.ts`: Handles the `/dispute` API. It uses the `Oracle` class to trigger a dispute on the blockchain with the current `tokenState`.
- start.controller.ts: Handles the `/attach:contractAddress` API. Mainly to make benchmarking easier. It alows to reset the state of a node and attach a new root contract with address `contractAddress`.
- step.controller.ts: Receives transition proposals encoded as `Step` over the `/step` API. It verifies a proposal's conformance using the `Conformance` class; if verified it answers with a signed transition encoded as `Step`.

# Scripts
Each below script can be run by `npm run SCRIPT`. 
 - `generate/keys`: Genereates the RSA keys required for the TLS connections between nodes.
 -  `generate/traces`: Genereates test traces for the correctness benchmark.
 -  `build`: Build the state channel node.
 -  `start`: Run a node locally. Take the identity from the .env file.
 -  `test`: Execute test files.
 -  `benchmark/correctness`: Execute correctness benchmark based on the generated traces.

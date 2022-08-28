# Leafhopper
Leafhopper is a prototype that runs a BPMN choreography in a state channel network. Leafhopper implements the supply chain use case as in [Figures](https://github.com/fstiehle/leafhopper-prototype/new/main?readme=1#figures) below.
It provides two main packages:
- A State Channel Node implementation contained in the folder `state_channel_node`. 
  - See [State Channel Node Documentation](https://github.com/fstiehle/leafhopper-prototype/tree/main/state_channel_node#readme).
- A State Channel Root Contract contained in the folder `state_channel_node/contracts`. 

> :warning: This repository includes .env files containing test mnemonics to ease the deployment of the prototype in a local environemnt. Do not re-use them!

## General Architecture
The general architecture of Leafhopper is depicted in [Figures](https://github.com/fstiehle/leafhopper-prototype/new/main?readme=1#figures) below.
We assume an external component such as a process aware information system (PAIS).
- The __State Channel Node__ is a node.js server and holds the current state of the process and maintains a connection to each other state channel node in the network. It can receive requests from outside over the `/begin/:taskid` route to advance the state of the process. The server can be deployed with different identities. Based on their identity they will be assigned a unique RSA key pair and blockchain address.
- The __Oracle Provider__ allows the state channel node to interact with the on-chain state channel root. We simulate a blockchain locally using Hardhat.
- The __State Channel Root__ is a Solidity Contract and holds the last legal state posted to the blockchain. Should a dispute be triggered, the root validates the submitted state by verifying the signatures of all participants. The root also implements conformance checking capabilities, which allows it to enforce the honest continuation of the contract.

## Replicate Evaluation Results
[REPLICATE.md](https://github.com/fstiehle/leafhopper-prototype/blob/main/REPLICATE.md) describes how to replicate the results in the evaluation section of the corresponding master's thesis 'Scaling Up from Layer One: Business Process Execution on Blockchain Layer Two'.

## Run it

The project is built using node and the package manager yarn. For the correctness benchmark, additionally, Docker is required. Leafhopper has been developed with node version 18.4.0, which is also installed inside the Docker containers.

1. Install node.js.
2. Install yarn.
3. Clone the repository. 
4. In the node directory `leafhopper-prototype/state_channel_node` run `yarn install`.
6. In the contracts directory `leafhopper-prototype/state_channel_node/contracts` run `yarn install`.
7. Build the contracts: In `leafhopper-prototype/state_channel_node/contracts` run `npm run build`.
9. Build the node: In `leafhopper-prototype/state_channel_node/` run `npm run build`.
10. Generate the TLS keys: In `leafhopper-prototype/state_channel_node/` run `npm run generate/keys`.
> (Optionally) Run tests: In `leafhopper-prototype/state_channel_node` run `npm run test`
11. Simulate the state channel network: In `leafhopper-prototype/state_channel_node/` run `docker compose up`.

Nodes are now available on the localhost as specified in `leafhopper.config.ts`. By default from ports 8000 to 8004. The Ethereum node on port 8545.


## Figures
### Leafhopper Main Components
<img src="https://github.com/fstiehle/leafhopper-prototype/blob/74fdfe1f0a2260e42552701acafdac64014bed13/figures/architecture.svg" alt="Leafhopper Architecture" width="800"/>

### Supply Chain Use Case
<img src="https://github.com/fstiehle/leafhopper-prototype/blob/74fdfe1f0a2260e42552701acafdac64014bed13/figures/use-case.svg" alt="Use case" width="800"/>

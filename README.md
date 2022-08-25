# Leafhopper
Leafhopper is a prototype that runs a BPMN choreography in a state channel network. Leafhopper implements the supply chain use case as in [Figures](https://github.com/fstiehle/leafhopper-prototype/new/main?readme=1#figures) below.
It provides two main packages:
- A State Channel Node implementation contained in the folder `state_channel_node`. 
- A State Channel Root Contract contained in the folder `state_channel_node/contracts`. 

## General Architecture
The general architecture of Leafhopper is depicted in [Figures](https://github.com/fstiehle/leafhopper-prototype/new/main?readme=1#figures) below.
We assume an external component such as a process aware information system (PAIS).
- The __State Channel Node__ is a node.js server and holds the current state of the process and maintains a connection to each other state channel node in the network. It can receive requests from outside over the `/begin/:taskid` route to advance the state of the process. The server can be deployed with different identities. Based on their identity they will be assigned a unique RSA key pair and blockchain address.
- The __Oracle Provider__ allows the state channel node to interact with the on-chain state channel root. We simulate a blockchain locally using Hardhat.
- The __State Channel Root__ is a Solidity Contract and holds the last legal state posted to the blockchain. Should a dispute be triggered, the root validates the submitted state by verifying the signatures of all participants. The root also implements conformance checking capabilities, which allows it to enforce the honest continuation of the contract.

## Run it

## Figures
### Leafhopper Main Components
<img src="https://github.com/fstiehle/leafhopper-prototype/blob/74fdfe1f0a2260e42552701acafdac64014bed13/figures/architecture.svg" alt="Leafhopper Architecture" width="800"/>

### Supply Chain Use Case
<img src="https://github.com/fstiehle/leafhopper-prototype/blob/74fdfe1f0a2260e42552701acafdac64014bed13/figures/use-case.svg" alt="Use case" width="800"/>

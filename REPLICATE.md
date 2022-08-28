# Replicate Evaluation

This file describes how to replicate the results in the evaluation section of the corresponding master thesis Scaling Up from
Layer One: Business Process Execution on Blockchain Layer Two. 

## Preliminaries

The project is built using node and the package manager yarn. For the correctness benchmark, additionally, Docker is required.

1. Install node.js (Leafhopper has been developed with version 18.4.0, which is also used by the Docker containers).
2. Install yarn.
3. Clone the repository. 
4. In the node directory `leafhopper-prototype/state_channel_node` run `yarn install`.
6. In the contracts directory `leafhopper-prototype/state_channel_node/contracts` run `yarn install`.
7. Build the contracts. In `leafhopper-prototype/state_channel_node/contracts` run `npm run build`.
9. Build the node. In `leafhopper-prototype/state_channel_node/` run `npm run build`.
10. Generate the TLS keys. In `leafhopper-prototype/state_channel_node/` run `npm run generate/keys`.
  - (Optionally run tests): In `leafhopper-prototype/state_channel_node` run `npm run test`

## Cost

1. Simulate the local Ethereum node. In `leafhopper-prototype/state_channel_node/contracts` run `npm run chain`.
2. Executed tests and cost benchmark in a second shell window. In `leafhopper-prototype/state_channel_node/contracts` run `npm run test`. The cost benchmark outputs the benchmark result formated in tables on the console.

## Correctness 

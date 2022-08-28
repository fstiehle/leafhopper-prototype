# Replicate Evaluation

This file describes how to replicate the results in the evaluation section of the corresponding master thesis Scaling Up from
Layer One: Business Process Execution on Blockchain Layer Two. 

## Preliminaries

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

## Cost

1. Simulate the local Ethereum node: In `leafhopper-prototype/state_channel_node/contracts` run `npm run chain`.
2. Execute cost benchmark in a second shell window: In `leafhopper-prototype/state_channel_node/contracts` run `npm run test`. The cost benchmark outputs the benchmark result formated in tables on the console.

## Correctness 

1. Simulate the state channel network: In `leafhopper-prototype/state_channel_node/` run `docker compose up`.
> :warning: Make sure you don't simulate the Ethereum node locally (as done in the cost benchmark above). This is now done inside the state channel network. Doing both will cause port mapping issues.
2. Execute correctness benchmark in a second shell window: In `leafhopper-prototype/state_channel_node/contracts` run `npm run benchmark/correctness`. The cost benchmark outputs the benchmark result formated in tables on the console.
> This may take a while, as for each new trace it redeployes the state channel root contract.
> It takes the traces from `leafhopper-prototype/state_channel_node/benchmark/generated_traces.json`. The generation can be repeated (resulting in different random traces) by running `npm run generate/traces`.

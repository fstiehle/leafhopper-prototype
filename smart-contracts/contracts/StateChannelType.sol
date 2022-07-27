//SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

interface StateChannelType {

  struct Step {
    uint from;
    uint caseID;
    uint taskID;
    bytes16 salt;
    bytes signature;
  }

  struct Ack {
    Step step;
    bytes16 salt;
    bytes signature;
  }
}
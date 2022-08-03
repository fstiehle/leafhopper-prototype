//SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

interface StateChannelType {

  struct Step {
    uint from;
    uint caseID;
    uint taskID;
    uint newTokenState;
    bytes16 salt;
    bytes[] signature;
  }
}
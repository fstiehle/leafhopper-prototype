//SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

interface StateChannelRoot {

  struct Step {
    uint from;
    uint caseID;
    uint taskID;
    uint newTokenState;
    bytes16 salt;
    bytes[] signature;
  }

  function dispute() external returns (bool);
  function dispute(Step calldata _step) external returns (bool);
  function begin(uint id) external returns (bool);
  event DisputeSucessfullyRaisedBy(address);
  event DisputeNewStateSubmittedBy(address);
  event DisputeRejectedOf(address);
}
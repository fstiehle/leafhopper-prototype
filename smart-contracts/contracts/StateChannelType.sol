//SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

interface StateChannelType {

  struct Step {
    string from;
    uint caseID;
    uint taskID;
    string salt;
    string signature;
  }

  struct Ack {
    Step step;
    string salt;
    string signature;
  }
}  
  
  
//SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

interface Conformance {
  function task(uint tokenState, uint taskID) external returns (uint);
}
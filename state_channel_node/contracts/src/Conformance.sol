//SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import './StateChannelType.sol';

interface Conformance is StateChannelType {
  function task(uint tokenState, uint taskID) external returns (uint);
}
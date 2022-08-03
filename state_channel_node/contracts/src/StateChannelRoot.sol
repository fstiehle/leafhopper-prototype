//SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import './StateChannelType.sol';

interface StateChannelRoot is StateChannelType {
  function dispute(Step calldata step) external returns (bool);
  function state(Step calldata step) external returns (bool);
  event DisputeSucessfullyRaised(address);
  event DisputeNewStateSubmitted(address);
  event DisputeRejected(address);
  event EndEvent(address);
}
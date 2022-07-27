//SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import './StateChannelType.sol';

interface StateChannelRoot is StateChannelType {
  /// 1. Check whether disputee is eligible to dispute
  /// 2. Replay the state in acks
  /// - was it actually their turn?
  /// - was it actually from them? 
  /// - was it the right turn?
  /// 3. Play nextStep from disputee
  /// 4. If all is well, raise dispute with new state, emit dispute event, otherwise emit reject event
  function dispute(Step[] calldata steps) external returns (bool);
  function state(Step[] calldata steps) external returns (bool);
  function ack(Ack calldata ack) external returns (bool);
  function isDisputed() external view returns (bool);
  event DisputeSucessfullyRaised();
  event DisputeRejected();
}
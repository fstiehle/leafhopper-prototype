//SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import './Conformance.sol';

contract SupplyChainConformance is Conformance {

  function task(uint tokenState, uint id) external pure returns (uint) {
    if (id == 2 || id == 4 || id == 6 || id > 12) {
        // only used for internal orchestration
        return tokenState;
    }
    uint oldTokenState = tokenState;

    // AND branch
    if (tokenState & 4 != 0) {
        // enable both AND branches
        tokenState &= ~uint(4);
        tokenState |= 40;
    }
    if (tokenState & 16 != 0 && tokenState & 64 != 0) {
        // join AND branch
        tokenState &= ~uint(80);
        tokenState |= 128;
    }

    if (tokenState & (1 << id) == 0) {
        return oldTokenState;
    }

    // advance token state by consuming and producing tokens
    // consume token(s)
    tokenState &= ~uint(1 << id);
    // produce tokens
    tokenState |= 1 << (id + 1);

    return tokenState;
  }

  function route(uint taskID) external pure returns (uint) {
    if (0 == taskID) {
      return 0;
    } else if (1 == taskID || 11 == taskID || 12 == taskID) {
      return 1;
    } else if (3 == taskID || 5 == taskID) {
      return 2;
    } else if (7 == taskID || 10 == taskID) {
      return 3;
    } else if (8 == taskID || 9 == taskID) {
      return 4;
    }
    return 99;
  }
}
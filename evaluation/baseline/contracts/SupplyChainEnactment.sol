//SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "hardhat/console.sol";

contract SupplyChainEnactment {

    uint tokenState = 1;
    event NonConformingTrace(uint id, bytes payload);
    event EndEvent();

    /// Advance the state of the contract after a conformance check
    /// @param id id of the activity to begin
    /// @param payload included payload to persist on the chain along the activity
    /// @dev call step function to advance state, emit event when step returns false
    function begin(uint id, bytes calldata payload) external {
        if (!step(id)) {
            emit NonConformingTrace(id, payload);
        }
    }

    /// When activity with `id` is enabled advance token state accordingly
    /// @param id id of the activity to begin
    /// @return return true on success, false for non-conforming behaviour 
    function step(uint id) private returns (bool) {
        if ((tokenState & (1 << id)) != tokenState) {
            return false;
        }
        // for id == 6, both AND branches must have been completed
        if (id == 6 && (tokenState & (1 << 4)) != tokenState) {
            return false;
        }

        // advance token state by consuming and producing tokens
        // consume token(s)
        // for id == 6, consume both AND branches
        if (id == 6) {   
            tokenState &= ~uint((1 << 5));
            tokenState &= ~uint((1 << 4));
        } else {
            tokenState &= ~uint((1 << id));
        }

        // produce tokens
        tokenState |= ~uint((1 << id + 1));
        if (id == 1) {
            // enable both AND branches
            tokenState |= ~uint((1 << 3));
        }

        if ((tokenState & (1 << 12)) == tokenState) {
            emit EndEvent();
        }
        return true;
    }
}
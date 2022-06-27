//SPDX-License-Identifier: MIT
pragma solidity ^0.8.15;

import "hardhat/console.sol";

contract SupplyChainEnactment {

    uint tokenState = 1;
    event NonConformingTrace(uint id, bytes payload);

    /// Advance the state of the contract after a conformance check
    /// @param id id of the activity to begin
    /// @param payload included payload to persist on the chain along the activity
    /// @dev call step function to advance state, emit event when step returns false
    function begin(uint id, bytes payload) external {
        if (!step(id)) {
            emit NonConformingTrace(id, payload);
        }
    }

    function step(uint id) private {
        /// When activity with `id` is enabled advance token state accordingly
        /// @param id id of the activity to begin
        /// @return return true on success, false for non-conforming behaviour 
 
        if ((tokenState & (1 << id)) != tokenState) {
            return false;
        }
        // for id == 6, both AND branches must have been completed
        if (id == 6 && (tokenState & (1 << 4)) != tokenState) {
            return false;
        }

        // advance token state by consuming and producing tokens
        // consume token(s)
        tokenState &= ~(1 << id);
        if (id == 6) {
            // consume both AND branches
            tokenState &= ~(1 << 4);
        }

        // produce tokens
        tokenState |= ~(1 << id + 1);
        if (id == 1) {
            // enable both AND branches
            tokenState |= ~(1 << 3);
        }
    }
}
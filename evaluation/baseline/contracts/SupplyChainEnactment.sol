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
            console.log("Non conforming");
            emit NonConformingTrace(id, payload);
        }
    }

    /// When activity with `id` is enabled advance token state accordingly
    /// @param id id of the activity to begin
    /// @return return true on success, false for non-conforming behaviour 
    function step(uint id) private returns (bool) {
        if (id == 2 || id == 4 || id == 6) {
            // only used for internal orchestration
            return false;
        }
        if (tokenState & (1 << id) == 0) {
            return false;
        }

        // advance token state by consuming and producing tokens
        // consume token(s)
        tokenState &= ~uint(1 << id);
        // produce tokens
        tokenState |= 1 << (id + 1);
    
        // AND branch
        if (tokenState & 4 != 0) {
            // enable both AND branches
            tokenState |= 40;
        }
        if (tokenState & 80 != 0) {
            // join AND branch
            tokenState &= ~uint(80);
            tokenState |= 128;
        }
 
        // End event
        if ((tokenState & 8192) != 0) {
            emit EndEvent();
        }
        return true;
    }
}
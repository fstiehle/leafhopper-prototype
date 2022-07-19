//SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "hardhat/console.sol";
import "../SupplyChainConformance.sol";

/// TODO: Access Control / Role Binding
contract SupplyChain is SupplyChainConformance {

    uint tokenState = 1;
    event NonConformingTrace(uint id, bytes payload);
    event EndEvent();

    /// Advance the state of the contract after a conformance check
    /// @param id id of the activity to begin
    /// @param payload included payload to persist on the chain along the activity
    /// @dev call step function to advance state, emit event when step returns false
    function begin(uint id, bytes calldata payload) external {
        console.log("begin with", id);
        if (!step(id)) {
            console.log("Non conforming", id);
            emit NonConformingTrace(id, payload);
        }
    }

    /// When activity with `id` is enabled advance token state accordingly
    /// @param id id of the activity to begin
    /// @return return true on success, false for non-conforming behaviour 
    function step(uint id) private returns (bool) {
        uint newTokenState = this.task(tokenState, id);
        if (newTokenState == tokenState) {
            return false;
        }

        tokenState = newTokenState;
        // End event
        if ((tokenState & 8192) != 0) {
            emit EndEvent();
        }
        return true;
    }
}
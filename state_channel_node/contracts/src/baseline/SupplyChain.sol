//SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

// import "hardhat/console.sol";
import "../SupplyChainConformance.sol";

contract SupplyChain is SupplyChainConformance {

    uint tokenState = 1;
    address[5] private participants;
    event NonConformingTrace(uint id);
    event EndEvent();

    constructor(address[5] memory _participants) {
       participants = _participants;
    }

    /// Advance the state of the contract after a conformance check
    /// @param id id of the activity to begin
    /// @dev call step function to advance state, emit event when step returns false
    function begin(uint id) external onlyParticipants returns (bool) {
        // console.log("begin with", id);
        if (!step(id)) {
            // console.log("Non conforming", id);
            emit NonConformingTrace(id);
            return false;
        }
        return true;
    }

    /// When activity with `id` is enabled advance token state accordingly
    /// @param id id of the activity to begin
    /// @return return true on success, false for non-conforming behaviour 
    function step(uint id) private returns (bool) {
        uint turn = this.route(id);
        if (turn >= participants.length || participants[turn] != msg.sender) {
            return false;
        }
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

    modifier onlyParticipants {
        require (msg.sender == participants[0] 
            || msg.sender == participants[1]
            || msg.sender == participants[2]
            || msg.sender == participants[3]
            || msg.sender == participants[4], 
            "only for participants");
        _;
    }
}
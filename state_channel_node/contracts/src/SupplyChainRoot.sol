//SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import './StateChannelRoot.sol';
import './SupplyChainConformance.sol';
import 'hardhat/console.sol';
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

contract SupplyChainRoot is StateChannelRoot {

    using ECDSA for bytes32;

    uint public tokenState = 1;
    bool public disputed = false;
    uint private index = 0;
    address[5] private participants;

    constructor(address[5] memory _participants) {
       participants = _participants;
    }

    // TODO: Case ID support 
    function dispute(Step calldata step) external onlyParticipants returns (bool) {
        if (!disputed && check(step)) {
            disputed = true;
            emit DisputeSucessfullyRaised(msg.sender);
            return true;
        }
        emit DisputeRejected(msg.sender);
        return false;
    }

    function state(Step calldata step) external onlyParticipants returns (bool) {
        if (disputed && check(step)) {
            emit DisputeNewStateSubmitted(msg.sender);
            return true;
        }
        return false;
    }

    function check(Step calldata step) private returns (bool) {
        if (step.taskID == 2 || step.taskID == 4 || step.taskID == 6 || step.taskID > 12) {
            // only used for internal orchestration
            return false;
        }

        console.log( 'new check', index, step.taskID );
        // Check that step is higher than previously recorded steps
        // Due to the AND branch taskID 3 and 5 are of the same height
        if ((index == 0 || index < step.taskID) || (index == 5 && step.taskID == 3)) {   
            // Check step
            if (checkSignatures(step)) {
                index = step.taskID;
                tokenState = step.newTokenState;
                console.log(step.newTokenState);
                if ((tokenState & 8192) != 0) {
                    emit EndEvent(msg.sender);
                }
                return true;
            }
        }

        return false;
    }

    function checkSignatures(Step calldata step) private view returns (bool) {
        console.log("Enter check step");
        // TODO: Check CaseID

        // Is it signed?
        bytes32 payload = keccak256(
            abi.encode(step.caseID, step.from, step.taskID, step.newTokenState, step.salt)
        );
        for (uint256 i = 0; i < participants.length; i++) {
            if (step.signature[i].length != 65) return false;
            if (payload.toEthSignedMessageHash().recover(step.signature[i])
            != participants[uint(i)]
            ) {
                return false;
            }
        }

        console.log("signatures do match");
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
//SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import './StateChannelRoot.sol';
import './SupplyChainConformance.sol';
import 'hardhat/console.sol';
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

contract SupplyChainRoot is StateChannelRoot, SupplyChainConformance {

    using ECDSA for bytes32;

    Step[14] private recordedSteps;
    uint private tokenState = 1;
    uint private ackCount = 0;
    bool private disputed = false;
    address[5] private participants;

    constructor(
        address bulkBuyer,
        address manufacturer,
        address middleman,
        address supplier,
        address specialCarrier
    ) {
        participants[uint(Participant.BulkBuyer)] = bulkBuyer;
        participants[uint(Participant.Manufacturer)] = manufacturer;
        participants[uint(Participant.Middleman)] = middleman;
        participants[uint(Participant.Supplier)] = supplier;
        participants[uint(Participant.SpecialCarrier)] = specialCarrier;
    }

    // TODO: Case ID support 
    /// 1. Check whether disputee is eligible to dispute
    /// 2. Replay the state in acks
    /// - was it actually their turn?
    /// - was it actually from them? 
    /// - was it the right turn?
    /// 3. Play nextStep from disputee
    /// 4. If all is well, raise dispute with new state, emit dispute event, otherwise emit reject event
    function dispute(Step[] calldata steps) external onlyParticipants returns (bool) {
        if (!disputed && checkSteps(steps)) {
            disputed = true;
            return true;
        }
        return false;
    }

    function isDisputed() external view onlyParticipants returns (bool) {
        return disputed;
    }

    function state(Step[] calldata steps) external onlyParticipants returns (bool) {
        if (disputed) {
            return checkSteps(steps);
        }
        return false;
    }

    /// Check that they don't issue an ack for theirselves
    function ack(Ack calldata ack) external onlyParticipants returns (bool) {
        
    }

    function checkSteps(Step[] calldata steps) private returns (bool) {
        // i < recordedSteps.length-1 as the last event '13' is the end place,
        // which the smart contract decides on its own.
        for (uint i = 0; i < steps.length && i < recordedSteps.length-1; i++) {
            if (i == 2 || i == 4 || i == 6) {
                // only used for internal orchestration
                continue;
            }

            // Check steps and replay them
            if (recordedSteps[i].signature.length == 0) {
                if (steps[i].signature.length > 0) {
                    console.log("Unknwon Step with task id", i);

                    if (steps[i].taskID == i && check(steps[i])) {
                        recordedSteps[i] = steps[i];
                        tokenState = this.task(
                            tokenState,
                            steps[i].taskID
                        );
                    } else {
                        revert("Invalid step found.");
                    }
                }

                continue;
            }
        
            // Do not verify already known steps, only compare they're equal.
            if (
                keccak256(
                    abi.encodePacked(
                        recordedSteps[i].from,
                        recordedSteps[i].caseID,
                        recordedSteps[i].taskID,
                        recordedSteps[i].salt,
                        recordedSteps[i].signature
                    )
                )
                != 
                keccak256(
                    abi.encodePacked(
                        steps[i].from,
                        steps[i].caseID,
                        steps[i].taskID,
                        steps[i].salt,
                        steps[i].signature
                    )
                )
            ) {
                revert("Steps do not equal already recorded steps.");
            }
        }

        return true;
    }

    function check(Step calldata step) private returns (bool) {
        console.log("Enter check step");
        // TODO: Check CaseID

        // Is it the right turn?
        if (this.task(tokenState, step.taskID) == tokenState) {
            return false;
        }
        console.log("It is the right turn");

        // Is it actually their turn?
        if (step.from >= participants.length) {
            return false;
        }
        uint turn = this.route(step.taskID);
        if (turn >= participants.length || turn != step.from) {
            return false;
        }
        console.log("It is indeed their turn");

        // Is it actually from them?
        bytes32 payload = keccak256(
            abi.encode(step.caseID, step.from, step.taskID, step.salt)
        );
        console.logBytes(abi.encodePacked(payload.toEthSignedMessageHash()));
        if (payload.toEthSignedMessageHash().recover(step.signature)
            == participants[uint(step.from)]
        ) {
            return true;
        }
        console.log("Signatures do not match!");

        return false;
    }

    modifier onlyParticipants {
        require (msg.sender == participants[uint(Participant.BulkBuyer)] 
            || msg.sender == participants[uint(Participant.Manufacturer)]
            || msg.sender == participants[uint(Participant.Middleman)]
            || msg.sender == participants[uint(Participant.Supplier)]
            || msg.sender == participants[uint(Participant.SpecialCarrier)], 
            "only Participants");
        _;
    }
}
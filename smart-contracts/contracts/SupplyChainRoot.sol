//SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import './StateChannelRoot.sol';
import 'hardhat/console.sol';

contract SupplyChainRoot is StateChannelRoot {

    Ack[14] recordedAcks;
    uint tokenState = 1;
    uint ackCount = 0;
    bool isDisputed = false;

    address BULK_BUYER;
    address MANUFACTURER;
    address MIDDLEMAN;
    address SUPPLIER;
    address SPECIAL_CARRIER;

    constructor(
        address bulkBuyer,
        address manufacturer,
        address middleman,
        address supplier,
        address specialCarrier
    ) {
        BULK_BUYER = bulkBuyer;
        MANUFACTURER = manufacturer;
        MIDDLEMAN = middleman;
        SUPPLIER = supplier;
        SPECIAL_CARRIER = specialCarrier;
    }

    // TODO: Case ID support 
    /// 1. Check whether disputee is eligible to dispute
    /// 2. Replay the state in acks
    /// - was it actually their turn?
    /// - was it actually from them? 
    /// - was it the right turn?
    /// 3. Play nextStep from disputee
    /// 4. If all is well, raise dispute with new state, emit dispute event, otherwise emit reject event
    function dispute(
        Ack[14] calldata acks, 
        Step calldata nextStep
    ) 
    external 
    onlyParticipants 
    returns (bool) 
    {
        for (uint i = 0; i < recordedAcks.length; i++) {
            if (!recordedAcks[i]) {
                if (acks[i]) {
                    console.log("Unknwon ack with task id", i);
                    // TODO: What do I need to verify, ACK + included Step?
                    check(acks[i]);
                }
            }
        }
    }

    function isDisputed() external view onlyParticipants returns (bool) {
        return isDisputed();
    }

    modifier onlyParticipants {
        require (msg.sender == BULK_BUYER 
            || msg.sender == MANUFACTURER
            || msg.sender == MIDDLEMAN
            || msg.sender == SUPPLIER
            || msg.sender == SPECIAL_CARRIER);
        _;
    }
}
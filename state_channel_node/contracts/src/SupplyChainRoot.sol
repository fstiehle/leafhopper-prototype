//SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

// import 'hardhat/console.sol';
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import './StateChannelRoot.sol';
import './SupplyChainConformance.sol';

contract SupplyChainRoot is StateChannelRoot, SupplyChainConformance {

    using ECDSA for bytes32;
    event NonConformingTrace(uint id, address by);
    event EndEvent();

    /**
     * Token state encoded as bit array.
     * Can be deomposed into a sequence of 2^i + [2^i, ...]
     * where each i is an enabled task.
     */
    uint public tokenState = 1; 

    uint private index = 0;
    address[5] private participants;

    /// Timestamps for the challenge-response dispute window
    uint public disputeMadeAtUNIX = 0;
    uint public disputeWindowInUNIX;

    /**
     * @param _participants addresses for the roles 
     * in the order (BulkBuyer, Manufacturer, Middleman, Supplier, SpecialCarrier)
     * @param _disputeWindowInUNIX time for the dispute window to remain open in UNIX.
     */
    constructor(address[5] memory _participants, uint _disputeWindowInUNIX) {
       participants = _participants;
       disputeWindowInUNIX = _disputeWindowInUNIX;
    }

    /**
     * Trigger new dispute or submit new state to elapse current dispute state
     * @param _step Last unanimously signed step, or empty step if process is stuck in start event
     */
    function submit(Step calldata _step) external onlyParticipants returns (bool) {
        bool _check = check(_step);
        if ((tokenState & 8192) != 0) {
            emit EndEvent();
            return true;
        }
        if (0 == disputeMadeAtUNIX && _check) {
            disputeMadeAtUNIX = block.timestamp;
            emit DisputeSucessfullyRaisedBy(msg.sender);
            return true;

        } else if (disputeMadeAtUNIX + disputeWindowInUNIX > block.timestamp && _check) {
            emit DisputeNewStateSubmittedBy(msg.sender);
            return true;
        }

        emit DisputeRejectedOf(msg.sender);
        return false;
    }

    /// Dispute is always allowed when process is stuck in start event
    function dispute() external onlyParticipants returns (bool) {
        require(0 == disputeMadeAtUNIX && 1 == tokenState);
        disputeMadeAtUNIX = block.timestamp;
        emit DisputeSucessfullyRaisedBy(msg.sender);
        return true;
    }

    /**
     * If a dispute window has elapsed, execution must continue through this function
     * @param id id of the activity to begin
     */
    function begin(uint id) external onlyParticipants returns (bool) {
        require(disputeMadeAtUNIX + disputeWindowInUNIX < block.timestamp);
        if (!step(id)) {
            emit NonConformingTrace(id, msg.sender);
            return false;
        }
        return true;
    }

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

    function check(Step calldata _step) private returns (bool) {
        if (_step.taskID == 2 || _step.taskID == 4 || _step.taskID == 6 || _step.taskID > 12) {
            // only used for internal orchestration
            return false;
        }
        // Check that step is higher than previously recorded steps
        // Due to the AND branch taskID 3 and 5 are of the same height
        if ((index == 0 || index < _step.taskID) || (index == 5 && _step.taskID == 3)) {   
            // Check step
            if (checkSignatures(_step)) {
                index = _step.taskID;
                tokenState = _step.newTokenState;
                return true;
            }
        }
        return false;
    }

    function checkSignatures(Step calldata _step) private view returns (bool) {
        // Is it signed?
        bytes32 payload = keccak256(
            abi.encode(_step.caseID, _step.from, _step.taskID, _step.newTokenState, _step.salt)
        );
        for (uint256 i = 0; i < participants.length; i++) {
            if (_step.signature[i].length != 65) return false;
            if (payload.toEthSignedMessageHash().recover(_step.signature[i])
            != participants[uint(i)]
            ) {
                return false;
            }
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
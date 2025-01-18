// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

// Access Control provided by openzeppelin Access API
import "@openzeppelin/contracts/access/Ownable.sol";

contract IdleQuest is Ownable {
    // Mapping from address to uint quest points
    mapping (address => uint256) public questPoints;

    event QuestPointsAdded(address indexed player, uint256 points);

    // Here we are setting Ownable to the owner of the contract for simplicity
    // but we could use the constructor to set this to another address
    constructor() Ownable(msg.sender) {}

    function get(address _addr) public view  returns (uint256) {
        // return quest points for a give address
        return questPoints[_addr];
    }

    function set(address _addr, uint256 _points) public onlyOwner {
        questPoints[_addr] += _points;

        emit QuestPointsAdded(_addr, questPoints[_addr]);
    }
}
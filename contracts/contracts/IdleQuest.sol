// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

// Access Control provided by openzeppelin Access API
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";




contract IdleQuest is Ownable {
    // type of quests
    enum QuestType { TokenHolder, NFTOwner, External }

    struct Quest {
        uint256 id;
        QuestType questType;
        address tokenAddress;
        uint256 amount;
    }

    // mapping of all the quests
    mapping (uint256 => Quest) public quests;

    // mapping of quest completions per user
    mapping(address => uint256[]) completions;

    // Mapping from address to uint quest points
    mapping (address => uint256) public questPoints;

    event QuestPointsAdded(address indexed player, uint256 points);
    event QuestCreated(uint256 id, uint8 questType, address tokenAddress, uint256 amount);
    event QuestCompleted(uint256 id, address userAddress);

    // Here we are setting Ownable to the owner of the contract for simplicity
    // but we could use the constructor to set this to another address
    constructor() Ownable(msg.sender) {}

    function createQuest(uint256 _id, uint8 _type, address _tokenAddress, uint256 _amount) public onlyOwner {
        require(_type <= 2);
        quests[_id] = Quest(_id, QuestType(_type), _tokenAddress, _amount);

        emit QuestCreated(_id, _type, _tokenAddress, _amount);
    }

    function completeQuest(uint256 _id, address _userAddress) public onlyOwner {
        require(isQuestCompleted(_id, _userAddress) == false);

        if (quests[_id].questType == QuestType.TokenHolder) {
            
        } else if (quests[_id].questType == QuestType.NFTOwner) {
            validateNftOwner(_id, _userAddress);
        } else if (quests[_id].questType == QuestType.TokenHolder) {
            validateTokenHolder(_id, _userAddress);
        }

        completions[_userAddress].push(_id);
    }

    function isQuestCompleted(uint256 _id, address _userAddress) public view returns (bool) {
        for (uint i = 0; i < completions[_userAddress].length; i++) {
            if (completions[_userAddress][i] == _id) {
                return true;
            }
        }
        return false;
    }

    function getQuest(uint256 _id) public view returns (uint256, uint8, address, uint256) {
        return (_id, uint8(quests[_id].questType), quests[_id].tokenAddress, quests[_id].amount);
    }

    function validateTokenHolder(uint256 _id, address _userAddress) public view {
        uint256 balance = IERC20(quests[_id].tokenAddress).balanceOf(_userAddress);
        require(balance >= quests[_id].amount);
    }

    function validateNftOwner(uint256 _id, address _userAddress) public view {
        address nftOwner = IERC721(quests[_id].tokenAddress).ownerOf(quests[_id].amount);
        require(nftOwner == _userAddress);
    }

    function get(address _addr) public view  returns (uint256) {
        // return quest points for a give address
        return questPoints[_addr];
    }

    function set(address _addr, uint256 _points) public onlyOwner {
        questPoints[_addr] += _points;

        emit QuestPointsAdded(_addr, questPoints[_addr]);
    }
}
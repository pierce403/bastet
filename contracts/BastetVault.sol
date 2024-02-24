// SPDX-License-Identifier: Apache License 2.0
pragma solidity ^0.8.0;

// import openzeppelin contracts
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

    struct UserBasic {
        int104 principal;
        uint64 baseTrackingIndex;
        uint64 baseTrackingAccrued;
        uint16 assetsIn;
        uint8 _reserved;
    }

interface IComet {
    function userBasic(address user) external view returns(UserBasic memory);

    function supply(address asst, uint amount) external;
    function supplyTo(address dst, address asst, uint amount) external;
    function supplyFrom(address from, address dst, address asst, uint amount) external;

    function withdraw(address asst, uint amount) external;
    function withdrawTo(address dst, address asst, uint amount) external;
    function withdrawFrom(address from, address dst, address asst, uint amount) external;
}

// Contract to hold cUSDC funds and distribute interest
// tributes come in from the cave contract
// blessings go out
contract BastetVault is Ownable {
    // the USDC contract address
    address public USDCAddress = 0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174; 
    // the BastetCrystal contract address
    address public compoundAddress = 0xF25212E676D1F7F89Cd72fFEe66158f541246445;
    //address public BastetVaultAddress;

    // address of the treasurer
    address public treasurer;

    // how many blessings have been distributed
    uint256 public totalBlessings;

    // list of patrons
    address[] public patrons;

    // mapping of patron balances
    mapping(address => uint256) public patronBalances;

    constructor() Ownable(msg.sender){}

    // update the address of the treasurer
    function setTreasurer(address _treasurer) onlyOwner public {
        treasurer = _treasurer;
    }

    // return available blessings (balance - (principal + totalBlessings))
    function availableBlessings() public view returns (uint256) {
        uint256 balance = IERC20(compoundAddress).balanceOf(address(this));

        // get principal
        int104 principal = IComet(compoundAddress).userBasic(address(this)).principal;

        // let's just make sure the principal is not negative
        require(principal >= 0, "principal must be greater than or equal to 0");

        // require that the balance is greater than the principal+totalBlessings
        require(balance >= (uint256(int256(principal)) + totalBlessings), "balance must be greater than principal+totalBlessings");

        //  available = balance-(principal+totalBlessings);
        return balance - (uint256(int256(principal)) + totalBlessings);
    }

    // return total balance
    function totalBalance() public view returns (uint256) {
        return IERC20(compoundAddress).balanceOf(address(this));
    }

    // return total principal
    function totalPrincipal() public view returns (int104) {
        return IComet(compoundAddress).userBasic(address(this)).principal;
    }

    // send blessing to address
    function sendBlessing(address _to, uint256 _amount) public {
        require(msg.sender == treasurer, "only treasurer can send blessings");
        require(_amount <= availableBlessings(), "not enough blessings");

        // send blessings (using widrawTo)
        IComet(compoundAddress).withdrawTo(_to, compoundAddress, _amount);

        // update totalBlessings
        totalBlessings += _amount;
    }

    // let the owner rescue any ERC20 tokens
    // NOTE: YES THIS MEANS THAT THE OWNER CAN STEAL ALL FUNDS
    // HOPEFULLY OWNER IS MULTISIG OR DAO OR 0x0
    function emergencyRescueERC20(address _token, address _to, uint256 _amount) onlyOwner public {
        IERC20(_token).transfer(_to, _amount);
    }

    // allow patrons to supply funds
    function patronSupply(uint256 _amount) public {
        // ensure amount is greater than 0
        require(_amount > 0, "amount must be greater than 0");

        // ensure patron has enough funds
        require(IERC20(USDCAddress).balanceOf(msg.sender) >= _amount, "not enough funds");

        // ensure patron has approved this contract to spend funds
        require(IERC20(USDCAddress).allowance(msg.sender, address(this)) >= _amount, "not enough allowance");

        // supply funds from patron to this contract
        IComet(compoundAddress).supplyFrom(msg.sender, address(this), USDCAddress, _amount);

        // update patron balance
        patronBalances[msg.sender] += _amount;

        // add patron to list of patrons if not already present
        if (patronBalances[msg.sender] == _amount) {
            patrons.push(msg.sender);
        }
    }

    // allow patrons to withdraw funds
    function patronWithdraw(uint256 _amount) public {
        // ensure amount is greater than 0
        require(_amount > 0, "amount must be greater than 0");

        // ensure patron has enough funds
        require(patronBalances[msg.sender] >= _amount, "not enough funds");

        // withdraw funds from this contract to patron
        IComet(compoundAddress).withdrawTo(msg.sender, USDCAddress, _amount);

        // update patron balance
        patronBalances[msg.sender] -= _amount;
    }

    // return number of patrons
    function patronCount() public view returns (uint256) {
        return patrons.length;
    }
}
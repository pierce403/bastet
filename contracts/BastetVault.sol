// SPDX-License-Identifier: Apache License 2.0
pragma solidity ^0.8.0;

// import openzeppelin contracts
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./interfaces/ICErc20.sol";

// Contract to hold cUSDC funds and distribute interest
contract BastetVault is ownable {
    // the cUSDC contract address
    address public cUSDCAddress;
    // the USDC contract address
    address public USDCAddress;
    // the owner of the contract

    // address of the treasurer
    address public treasurer;

    // update the address of the treasurer
    function setTreasurer(address _treasurer) public {
        require(msg.sender == owner, "only owner can set treasurer");
        treasurer = _treasurer;
    }

    // constructor to set the cUSDC and USDC contract addresses
    constructor(address _cUSDCAddress, address _USDCAddress) {
        cUSDCAddress = _cUSDCAddress;
        USDCAddress = _USDCAddress;
        owner = msg.sender;
    }

    // function for the treasurer to withdraw USDC, but not more than the principal
    function withdrawInterest(uint256 _amount) public {
        require(msg.sender == owner, "only owner can withdraw interest");
        uint256 balance = IERC20(USDCAddress).balanceOf(address(this));
        require(_amount <= balance, "amount exceeds balance");
        IERC20(USDCAddress).transfer(msg.sender, _amount);
    }

    // function to deposit USDC into the cUSDC contract
    function deposit(uint256 _amount) public {
        // transfer USDC to the cUSDC contract
        IERC20(USDCAddress).transferFrom(msg.sender, address(this), _amount);
        // approve the cUSDC contract to spend the USDC
        IERC20(USDCAddress).approve(cUSDCAddress, _amount);
        // mint cUSDC with the USDC
        ICErc20(cUSDCAddress).mint(_amount);
    }

    // function to withdraw USDC from the cUSDC contract
    function withdraw(uint256 _amount) public {
        // redeem cUSDC for USDC
        ICErc20(cUSDCAddress).redeemUnderlying(_amount);
        // transfer USDC to the sender
        IERC20(USDCAddress).transfer(msg.sender, _amount);
    }

    // function to get the cUSDC balance of this contract
    function balanceOf() public view returns (uint256) {
        return IERC20(cUSDCAddress).balanceOf(address(this));
    }

    // function to get the USDC balance of this contract
    function balanceOfUSDC() public view returns (uint256) {
        return IERC20(USDCAddress).balanceOf(address(this));
    }

    // function to get the USDC balance of the sender
    function balanceOfUSDCSender() public view returns (uint256) {
        return IERC20(USDCAddress).balanceOf(msg.sender);
    }

    // function to get the cUSDC balance of the sender
    function balanceOfcUSDCSender() public view returns (uint256) {
        return IERC20(cUSDCAddress).balanceOf(msg.sender);
    }

    // function to get the USDC balance of the cUSDC
    function balanceOfUSDCcUSDC() public view returns (uint256) {
        return ICErc20(cUSDCAddress).balanceOfUnderlying(address(this));
    }
}
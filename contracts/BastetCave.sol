// SPDX-License-Identifier: Apache License 2.0
pragma solidity ^0.8.0;

// BastetCave contract
// This contract allows users to purchase BastetCrystal NFTs for USDC and sends funds to the vault

// import openzeppelin contracts
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

// import BastetCrystal
import "./BastetCrystal.sol";

// import BastetVault
import "./BastetVault.sol";

// Contract to allow users to purchase BastetCrystal NFTs with USDC
contract BastetCave is Ownable {
    // the USDC contract address
    address public USDCAddress;
    // the BastetCrystal contract address
    address public BastetCrystalAddress;
    // the BastetVault contract address
    address public BastetVaultAddress;
    // the owner of the contract

    // constructor to set the USDC, BastetCrystal, and BastetVault contract addresses
    constructor(address _USDCAddress, address _BastetCrystalAddress, address _BastetVaultAddress) {
        USDCAddress = _USDCAddress;
        BastetCrystalAddress = _BastetCrystalAddress;
        BastetVaultAddress = _BastetVaultAddress;
        owner = msg.sender;
    }

    // function to pay tribute to Bastet and obtain a crystal
    function tribute(uint256 _id) public {

        // transfer USDC to the BastetVault
        IERC20(USDCAddress).transferFrom(msg.sender, BastetVaultAddress, _amount);
        // deposit USDC into the cUSDC contract
        BastetVault(BastetVaultAddress).deposit(_amount);
        // mint the BastetCrystal NFT
        BastetCrystal(BastetCrystalAddress).mint(msg.sender, _id, 1, "");
    }

    // function to withdraw USDC from the BastetVault
    function withdraw(uint256 _amount) public {
        // withdraw USDC from the cUSDC contract
        BastetVault(BastetVaultAddress).withdraw(_amount);
        // transfer USDC to the sender
        IERC20(USDCAddress).transfer(msg.sender, _amount);
    }
}
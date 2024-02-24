// SPDX-License-Identifier: Apache License 2.0
pragma solidity ^0.8.0;

// BastetCave contract
// This contract allows users to purchase BastetCrystal NFTs for USDC and sends funds to the vault

// import reentrancy guard
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

// import BastetCrystal
//import "./BastetCrystal.sol";

// import IERC20
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

// simple interface for BastetCrystal
interface IBastetCrystal {
    function mint(address account, uint256 id, uint256 amount, bytes memory data) external;
    function orgCount() external view returns (uint256);
    function vault() external view returns (address);
}

// Comet interface, supplyFrom(address,address,address,uint)
interface ICompoundFinance {
    function supply(address asst, uint amount) external;
    function supplyTo(address dst, address asst, uint amount) external;
    function supplyFrom(address from, address dst, address asst, uint amount) external;
}   

// Contract to allow users to purchase BastetCrystal NFTs with USDC
contract BastetCave is ReentrancyGuard {
    // the USDC contract address
    address public USDCAddress = 0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174; 
    // the BastetCrystal contract address
    address public bastetCrystalAddress = 0xbe39Df1e59651aEF996A280B4D4212eD7b807784;
    // the Compound Finance contract address
    address public compoundAddress = 0xF25212E676D1F7F89Cd72fFEe66158f541246445;
    //address public BastetVaultAddress;

    // mint count array
    // the number of tokens minted *by this minting contract*
    uint256[] public mintCount;
    
    // track total tributes per org id
    uint256[] public tributeTotalByOrgId;

    // function to pay tribute to Bastet and obtain a crystal
    function tribute(uint256 _id) public nonReentrant {

        // ensure id is less than number of orgs
        require(_id < IBastetCrystal(bastetCrystalAddress).orgCount(), "invalid id");

        // get the current price
        uint256 currentPrice = getPrice(_id);
        mintCount[_id]++;

        // bump the tribute total
        tributeTotalByOrgId[_id] += currentPrice*1000000;

        // get the address of the vault from the crystal contract
        address bastetVaultAddress = IBastetCrystal(bastetCrystalAddress).vault();

        // supply from sender to vault, remember 6 decimals for USDC
        ICompoundFinance(compoundAddress).supplyFrom(msg.sender,bastetVaultAddress, USDCAddress, currentPrice*1000000);

        // mint the BastetCrystal NFT
        IBastetCrystal(bastetCrystalAddress).mint(msg.sender, _id, 1, "");
    }

    // function to tribute any amount to an org, with no NFT minted
    function trubiteAny(uint256 _id, uint256 _amount) public nonReentrant {
        // ensure id is less than number of orgs
        require(_id < IBastetCrystal(bastetCrystalAddress).orgCount(), "invalid id");

        // bump the tribute total
        tributeTotalByOrgId[_id] += _amount;

        // get the address of the vault from the crystal contract
        address bastetVaultAddress = IBastetCrystal(bastetCrystalAddress).vault();

        // supply from sender to vault, remember 6 decimals for USDC
        ICompoundFinance(compoundAddress).supplyFrom(msg.sender, bastetVaultAddress, USDCAddress, _amount);
    }

    // function to get the current price by id
    function getPrice(uint256 _id) public view returns (uint256) {
        return mintCount[_id]+1;
    }

    // function to grow the mintCount and tributeTotal array as needed
    function bumpArray() public {
        // ensure the mintCount array isn't going to be bigger than the orgs array
        require(mintCount.length < IBastetCrystal(bastetCrystalAddress).orgCount(), "this is fine");

        mintCount.push(0);
        tributeTotalByOrgId.push(0);
    }

    // function to get the vault address
    function getVaultAddress() public view returns (address) {
        return IBastetCrystal(bastetCrystalAddress).vault();
    }
}
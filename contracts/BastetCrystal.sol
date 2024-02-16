// SPDX-License-Identifier: Apache License 2.0
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

interface IERC2981 {
    // ERC-2981 interface for royalty info
    function royaltyInfo(uint256 _tokenId, uint256 _salePrice) external view returns (address receiver, uint256 royaltyAmount);
}

contract BastetCrystal is Ownable, ERC1155, IERC2981 {

    // set URI string
    string public uriString = "https://bastet.ai/api/crystals/";

    // an array of orgs as strings
    string[] public orgs;

    // create a mapping for orgs
    mapping(string => bool) public orgExists;

    // address of the vault
    address public vault;

    // address that can mint/burn
    address public minter;

    // function to set the minter
    function setMinter(address _minter) public onlyOwner {
        minter = _minter;
    }

    // function to mint a token
    function mint(address account, uint256 id, uint256 amount, bytes memory data) public {
        require(msg.sender == minter, "only minter can mint");
        _mint(account, id, amount, data);
    }

    // function to burn a token
    function burn(address account, uint256 id, uint256 amount) public {
        require(msg.sender == minter, "only minter can burn");
        _burn(account, id, amount);
    }

    // function to set the URI
    function setURI(string memory _uri) public onlyOwner {
        uriString = _uri;
    }

    // function to set the vault
    function setVault(address _vault) public onlyOwner {
        vault = _vault;
    }

    // function for adding a new org, onlyOwner
    // sends on token to the sender
    function addOrg(string memory _org) public onlyOwner {
        // make sure org isn't already in the mapping
        require(!orgExists[_org], "org already exists");

        // make sure org name is less than 20 chars
        require(bytes(_org).length < 20, "org name too long");

        // mint a token to the sender
        _mint(msg.sender, orgs.length, 1, "");

        // add org to array
        orgs.push(_org);

        // add org to mapping
        orgExists[_org] = true;
    }

    // return the count of orgs
    function orgCount() public view returns (uint256) {
        return orgs.length;
    }

    constructor()
        ERC1155(string(abi.encodePacked(uriString,"{id}.json")))
        Ownable(msg.sender)
    {

        // add some orgs
        addOrg("Ethereum");
        addOrg("Google");
        addOrg("Microsoft");
        addOrg("Apple");
        addOrg("Amazon");
    }

    function uri(uint256 _tokenId) override public view returns (string memory){
        return string(
            abi.encodePacked(
            uriString,
            Strings.toString(_tokenId),
            ".json"
        ));
    }

    // Implementing ERC-2981
    function royaltyInfo(uint256, uint256 _salePrice) external view returns (address, uint256) {
        // take 5% of the sale price
        return (vault, _salePrice / 20);
    }

    // Override supportsInterface to declare support for ERC-2981
    function supportsInterface(bytes4 interfaceId) public view virtual override(ERC1155) returns (bool) {
        return interfaceId == type(IERC2981).interfaceId || super.supportsInterface(interfaceId);
    }

}

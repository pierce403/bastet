const provider = new ethers.providers.Web3Provider(window.ethereum);
let signer;
let contract;

const caveContractAddress = "0x58CC95808f1f220e0634bbD13cA8B4f55acFd606";
const vaultContractAddress = "0x66D6E14BE2FEFDB44bcd1F4B578c86eF76002Ab3";
const compoundContractAddress = "0xF25212E676D1F7F89Cd72fFEe66158f541246445";
const greenSkull = "0x45038C6bEfdD712784cb380e0573Bd09C23091A8";
const usdcContractAddress = "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174";

// mint(address account, uint256 id, uint256 amount, bytes memory data) public returns (bool)
const caveContractABI = [
    "function tribute(uint256) public returns (bool)",
    "function mint(address account, uint256 id, uint256 amount, bytes memory data) public returns (bool)",
    "function getPrice(uint256 id) public view returns (uint256)",
];

const compoundContractABI = [
    "function allow(address manager, bool allowed) public returns (bool)",
    "function approve(address spender, uint256 amount) public returns (bool)",
];

const messageBox = document.getElementById('messageBox');
messageBox.innerText = "Please connect your wallet to continue.";

// check if the wallet is already connected
async function checkIfWalletIsConnected() {
    const accounts = await provider.listAccounts();
    if (accounts.length > 0) {
        // print the number of connected networks
        console.log('Connected:', accounts.length);
        // print the connected networks
        console.log('Connected:', accounts);
        return true;
    }
    return false;
}
checkIfWalletIsConnected

async function checkIfPolygon() {
    const network = await provider.getNetwork();
    console.log('Network:', network);
    if (network.chainId !== 137) {
        //alert('Please connect to the Polygon network.');

        // request the user to switch to the Polygon network
        await window.ethereum.request({
            method: "wallet_switchEthereumChain",
            params: [{ chainId: '0x89' }], // '0x89' is the hexadecimal chain ID for the Polygon mainnet
        });

        return false;
    }
    return true;
}

document.getElementById('connectWallet').addEventListener('click', async () => {

    // set "connecting..." message
    messageBox.innerText = "Connecting...";

    // request access to the user's wallet
    await provider.send("eth_requestAccounts", []);

    // After connecting, check if the user is on Polygon
    const isPolygon = await checkIfPolygon();
    if (!isPolygon) {
        messageBox.innerText = "Please switch to the Polygon network.";
        return; // Stop further execution if not on Polygon
    }

    // set connected message
    messageBox.innerText = "Wallet connected.";

    // get signer
    signer = await provider.getSigner();
    console.log('Address:', signer.getAddress());
    caveContract = new ethers.Contract(caveContractAddress, caveContractABI, signer);
    compoundContract = new ethers.Contract(compoundContractAddress, compoundContractABI, signer);
    usdcContract = new ethers.Contract(usdcContractAddress, compoundContractABI, signer);
    //console.log('Contract:', contract);

    //document.getElementById('mintNFT').disabled = false;

    // refresh prices
    refreshPrices();
});

// callback for setting an allowance for the contract
document.getElementById('allowCave').addEventListener('click', async () => {
    try {
        console.log('Allowing Cave contract to manage Compound v3 for user:', signer.getAddress());

        // set type(uint256).max as the allowance (lame)
        const maxint = ethers.BigNumber.from(2).pow(256).sub(1);

        const tx1 = await usdcContract.approve(compoundContractAddress, maxint);
        //const tx1 = await usdcContract.approve(caveContractAddress,maxint);
        await tx1.wait();
        //alert('approve success');

        //const tx2 = await compoundContract.allow(vaultContractAddress,true);
        //const tx2 = await compoundContract.approve(vaultContractAddress,maxint);

        //const tx2 = await compoundContract.allow(caveContractAddress, true);
        //const tx2 = await compoundContract.approve(caveContractAddress,maxint);

        // set type(uint256).max as the allowance (lame)
        //const amount = ethers.BigNumber.from(2).pow(256).sub(1);
        //const tx2 = await compoundContract.approve(signer.getAddresas(),amount);
        //const tx2 = await compoundContract.approve(signer.getAddress(),amount);
        //await tx2.wait();
        alert('approve success');

    } catch (error) {
        console.error(error);
        alert('Failed to Set Manager.');
    }
});

// function to refresh the prices on trubute page
async function refreshPrices() {
    const orgs = ["Ethereum", "Google", "Amazon", "Apple", "Microsoft"];
    const nftList = document.getElementById('nft-list');

    // unhide the table  called nft-table
    document.getElementById('nft-table').hidden = false;

    for (let i = 0; i < orgs.length; i++) {
        const org = orgs[i];
        const nftRow = document.createElement('tr');

        // the price is the mint count
        const mintCount = await caveContract.getPrice(i);

        // insert smart contract -> XSS bug here
        nftRow.innerHTML = `
            <td>${org}</td>
            <td><span id="${org.toLowerCase()}-price">$${mintCount}</span></td>
            <td><button onclick="buyNFT('${org.toLowerCase()}')">Claim ${i} Crystal</button></td>
        `;
        nftList.appendChild(nftRow);
    }
}

// buy NFT function (using tribute(i))
async function buyNFT(orgId) {
    try {
        console.log('Buying NFT for signer:', signer.getAddress());
        const tx = await caveContract.tribute(orgId);
        await tx.wait();
        alert('NFT Minted Successfully!');
    } catch (error) {
        console.error(error);
        alert('Failed to mint NFT.');
    }
}

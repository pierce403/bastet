const provider = new ethers.providers.Web3Provider(window.ethereum, "any");
let signer;
let contract;

const caveContractAddress = "0x58CC95808f1f220e0634bbD13cA8B4f55acFd606";
const compoundContractAddress = "0xF25212E676D1F7F89Cd72fFEe66158f541246445";
const greenSkull = "0x45038C6bEfdD712784cb380e0573Bd09C23091A8";
const usdcContractAddress = "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174";

// mint(address account, uint256 id, uint256 amount, bytes memory data) public returns (bool)
const caveContractABI = [
        "function tribute(uint256) public returns (bool)",
        "function mint(address account, uint256 id, uint256 amount, bytes memory data) public returns (bool)",
    ];

const compoundContractABI = [
        "function allow(address manager, bool allowed) public returns (bool)",
        "function approve(address spender, uint256 amount) public returns (bool)",
    ];


document.getElementById('connectWallet').addEventListener('click', async () => {
    await provider.send("eth_requestAccounts", []);

    signer = provider.getSigner();
    console.log('Address:', signer.getAddress());
    caveContract = new ethers.Contract(caveContractAddress, caveContractABI, signer);
    compoundContract = new ethers.Contract(compoundContractAddress, compoundContractABI, signer);
    usdcContract = new ethers.Contract(usdcContractAddress, compoundContractABI, signer);
    //console.log('Contract:', contract);

    document.getElementById('mintNFT').disabled = false;
});

document.getElementById('mintNFT').addEventListener('click', async () => {
    try {
        console.log('Minting NFT for signer:', signer.getAddress());
        const tx = await caveContract.tribute(1);
        await tx.wait();
        alert('NFT Minted Successfully!');
    } catch (error) {
        console.error(error);
        alert('Failed to mint NFT.');
    }
});

// callback for setting an allowance for the contract
document.getElementById('allowCave').addEventListener('click', async () => {
    try {
        console.log('Allowing Cave contract to manage Compound v3 for user:', signer.getAddress());

        // set type(uint256).max as the allowance (lame)
        const maxint = ethers.BigNumber.from(2).pow(256).sub(1);
        
        //const tx1 = await usdcContract.approve(compoundContractAddress,maxint);
        //await tx1.wait();
        //alert('approve success');

        const tx2 = await compoundContract.allow(caveContractAddress,true);
        //const tx2 = await compoundContract.approve(caveContractAddress,maxint);
        

        // set type(uint256).max as the allowance (lame)
        //const amount = ethers.BigNumber.from(2).pow(256).sub(1);
        //const tx2 = await compoundContract.approve(signer.getAddresas(),amount);
        //const tx2 = await compoundContract.approve(signer.getAddress(),amount);
        await tx2.wait();
        alert('approve success');

    } catch (error) {
        console.error(error);
        alert('Failed to Set Manager.');
    }
});

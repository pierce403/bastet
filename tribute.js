const provider = new ethers.providers.Web3Provider(window.ethereum, "any");
let signer;
let contract;

const contractAddress = "0xbe39Df1e59651aEF996A280B4D4212eD7b807784";

// mint(address account, uint256 id, uint256 amount, bytes memory data) public returns (bool)
const contractABI = [
        "function tribute(uint256) public returns (bool)",
        "function mint(address account, uint256 id, uint256 amount, bytes memory data) public returns (bool)",
    ];

document.getElementById('connectWallet').addEventListener('click', async () => {
    await provider.send("eth_requestAccounts", []);

    signer = provider.getSigner();
    console.log('Address:', signer.getAddress());
    contract = new ethers.Contract(contractAddress, contractABI, signer);
    //console.log('Contract:', contract);

    document.getElementById('mintNFT').disabled = false;
});

document.getElementById('mintNFT').addEventListener('click', async () => {
    try {
        console.log('Minting NFT for signer:', signer.getAddress());
        const tx = await contract.mint(signer.getAddress(),0,1,[]);
        await tx.wait();
        alert('NFT Minted Successfully!');
    } catch (error) {
        console.error(error);
        alert('Failed to mint NFT.');
    }
});

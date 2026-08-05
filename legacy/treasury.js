// Connect to Ethereum
const provider = new ethers.providers.Web3Provider(window.ethereum);

// Contract details
const contractAddress = "0x66D6E14BE2FEFDB44bcd1F4B578c86eF76002Ab3";
const contractABI = [
    // Include the ABI for totalBalance, totalPrincipal, and availableBlessings
    "function totalBalance() view returns (uint256)",
    "function totalPrincipal() view returns (int104)",
    "function totalBlessings() view returns (uint256)",
    "function availableBlessings() view returns (uint256)"
];

// Create a contract instance
const contract = new ethers.Contract(contractAddress, contractABI, provider);

// Function to update the UI with contract data
async function updateUI() {
    const totalBalance = await contract.totalBalance();
    const totalPrincipal = await contract.totalPrincipal();
    const totalBlessings = await contract.totalBlessings();
    const availableBlessings = await contract.availableBlessings();

    document.getElementById('totalBalance').innerText = `Total Balance: ${convertToUSD(totalBalance)}`;
    document.getElementById('totalPrincipal').innerText = `Total Principal: ${convertToUSD(totalPrincipal)}`;
    document.getElementById('totalBlessings').innerText = `Total Blessings: ${convertToUSD(totalBlessings)}`;
    document.getElementById('availableBlessings').innerText = `Available Blessings: ${convertToUSD(availableBlessings)}`;

}

// the USDC values have decimals of 6, return the value in USD
function convertToUSD(value) {
    return (value / 1000000).toFixed(2);
}

// Call the function on load
updateUI();

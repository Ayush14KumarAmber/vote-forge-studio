# VoteChain - Deployment Instructions

## Smart Contract Deployment

### Prerequisites
1. Install MetaMask browser extension
2. Get test ETH from a faucet (for testnet deployment)
3. Install Hardhat or Remix IDE

### Option 1: Deploy with Remix (Easiest)

1. Go to [Remix IDE](https://remix.ethereum.org/)
2. Create a new file called `Voting.sol`
3. Copy the contract code from `src/contracts/Voting.sol`
4. Compile the contract (Solidity 0.8.x)
5. Deploy:
   - Select "Injected Provider - MetaMask" as environment
   - Connect your MetaMask wallet
   - Click "Deploy"
   - Confirm the transaction in MetaMask
6. Copy the deployed contract address

### Option 2: Deploy with Hardhat

```bash
npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox
npx hardhat init
```

Create a deployment script in `scripts/deploy.js`:

```javascript
async function main() {
  const Voting = await ethers.getContractFactory("Voting");
  const voting = await Voting.deploy();
  await voting.deployed();
  console.log("Voting contract deployed to:", voting.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
```

Deploy:
```bash
npx hardhat run scripts/deploy.js --network sepolia
```

### Update Frontend

After deployment, update the contract address in:
`src/contracts/VotingContract.json`

Replace `YOUR_CONTRACT_ADDRESS_HERE` with your deployed contract address.

## Recommended Networks

### Testnets (Free - Use for Development)
- **Sepolia** (Recommended)
  - Network Name: Sepolia
  - RPC URL: https://sepolia.infura.io/v3/YOUR_INFURA_KEY
  - Chain ID: 11155111
  - Currency Symbol: ETH
  - Block Explorer: https://sepolia.etherscan.io
  - Faucet: https://sepoliafaucet.com/

- **Mumbai (Polygon Testnet)**
  - Network Name: Mumbai
  - RPC URL: https://rpc-mumbai.maticvigil.com
  - Chain ID: 80001
  - Currency Symbol: MATIC
  - Block Explorer: https://mumbai.polygonscan.com
  - Faucet: https://faucet.polygon.technology/

### Mainnet (Costs Real Money)
- **Ethereum Mainnet**
- **Polygon Mainnet** (Lower fees)
- **BSC Mainnet** (Binance Smart Chain)

## Testing the dApp

1. Deploy the smart contract
2. Update the contract address in `VotingContract.json`
3. Connect MetaMask to the same network where you deployed
4. Test:
   - Connect wallet
   - Create an election
   - Vote on elections
   - View results

## Important Notes

⚠️ **Security Considerations:**
- Never commit private keys to GitHub
- Use environment variables for sensitive data
- Test thoroughly on testnet before mainnet deployment
- Consider adding access controls for production
- Implement proper error handling

🔧 **Gas Optimization:**
- Creating elections costs gas
- Voting costs gas
- Consider gas prices when choosing networks
- Polygon/BSC have lower fees than Ethereum

📱 **Mobile Support:**
- MetaMask mobile app is supported
- WalletConnect can be added for more wallet options

## Troubleshooting

**"Insufficient funds"**
- Get testnet ETH from faucets
- Ensure you're on the correct network

**"Transaction failed"**
- Check gas settings
- Verify contract address is correct
- Ensure election is still active

**"Wallet not connecting"**
- Refresh the page
- Check MetaMask is unlocked
- Verify network settings

## Support

For issues or questions:
1. Check the contract on block explorer
2. Review browser console for errors
3. Verify MetaMask connection and network

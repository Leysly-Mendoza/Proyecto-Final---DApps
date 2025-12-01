const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Desplegando contratos con la cuenta:", deployer.address);

  const owners = [
    deployer.address, // mi cuenta
     "0xB32A8EBb8a5c0A77feA3f82186E6aaB48A93215B"// Eunice
  ];
  const payees = [
    deployer.address, // mi cuenta
    "0xB32A8EBb8a5c0A77feA3f82186E6aaB48A93215B" // Eunice
  ];
  const shares = [50, 50];
  const requireApprovals = 1; // Cuántas firmas se necesitan


  console.log("Desplegando NFT...");
  const NFTFactory = await ethers.getContractFactory("NFTClase"); 
  const nft = await NFTFactory.deploy();
  await nft.waitForDeployment();
  console.log("NFT desplegado en:", nft.target);

  console.log("Desplegando Pagos...");
  const PagosFactory = await ethers.getContractFactory("Pagos");
  const pagos = await PagosFactory.deploy(payees, shares);
  await pagos.waitForDeployment();
  console.log("Pagos desplegado en:", pagos.target);

  console.log("Desplegando Wallet...");
  const WalletFactory = await ethers.getContractFactory("MultiSignPaymentWallet");
  const wallet = await WalletFactory.deploy(owners, requireApprovals, payees, shares);
  await wallet.waitForDeployment();
  console.log("✅ Wallet desplegada en:", wallet.target);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
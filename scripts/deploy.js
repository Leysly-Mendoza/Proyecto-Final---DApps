const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Desplegando con cuenta:", deployer.address);

  // --- CONFIGURACIÓN ---
  // Cuidadores (Owners) y Criadores (Payees)
  const cuidadores = [deployer.address, "0xB32A8EBb8a5c0A77feA3f82186E6aaB48A93215B"];
  const criadores = [deployer.address, "0xB32A8EBb8a5c0A77feA3f82186E6aaB48A93215B"];
  const porcentajes = [50, 50];
  const firmasRequeridas = 1;

  // 1. GATITO NFT
  console.log("Desplegando GatitoNFT...");
  const NFTFactory = await ethers.getContractFactory("GatitoNFT");
  const nft = await NFTFactory.deploy();
  await nft.deployed();
  console.log("✅ GatitoNFT Address:", nft.address);

  // 2. PAGOS
  console.log("Desplegando PagosGatitos...");
  const PagosFactory = await ethers.getContractFactory("PagosGatitos");
  const pagos = await PagosFactory.deploy(criadores, porcentajes);
  await pagos.deployed();
  console.log("✅ PagosGatitos Address:", pagos.address);

  // 3. WALLET (GatitosPaymentMultisig)
  console.log("Desplegando GatitosPaymentMultisig...");
  // OJO: El archivo es GatitoWallet.sol, pero el contrato dentro se llama "GatitosPaymentMultisig"
  const WalletFactory = await ethers.getContractFactory("GatitosPaymentMultisig");
  const wallet = await WalletFactory.deploy(cuidadores, firmasRequeridas, criadores, porcentajes);
  await wallet.deployed();
  console.log("✅ Wallet Address:", wallet.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
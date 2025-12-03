const { ethers } = require('ethers');
// IMPORTANTE: Busca el JSON con el nombre del contrato interno
const contract = require('../artifacts/contracts/GatitoWallet.sol/GatitosPaymentMultisig.json');
const { createTransaction, getContract } = require('../utils/contractHelper');
const { WALLET_CONTRACT } = process.env;

// --- AGREGAR GATITO ---
async function addProduct(name, price, image, account) {
  // Convertimos precio a Wei
  const priceInWei = ethers.utils.parseEther(price.toString());
  // Llamamos a la función en español de tu contrato: agregarGatito
  const receipt = await createTransaction(WALLET_CONTRACT, contract.abi, 'agregarGatito', [name, priceInWei, image], account);
  return receipt;
}

// --- COMPRAR GATITO ---
async function buyProduct(productId, account) {
  const walletContract = getContract(WALLET_CONTRACT, contract.abi);
  // Obtenemos info para saber el precio
  const gatitos = await walletContract.obtenerGatitos(); 
  const gatito = gatitos[productId]; 
  const price = gatito.precio; // Ya viene en Wei

  // Llamamos a la función en español: comprarGatito
  // Pasamos el precio como "value" (último parámetro de mi helper v5 modificado)
  const tx = await createTransaction(WALLET_CONTRACT, contract.abi, 'comprarGatito', [productId], account, price);
  return tx;
}

// --- OBTENER TODOS ---
async function getAllProducts() {
  const walletContract = getContract(WALLET_CONTRACT, contract.abi);
  // Función en español: obtenerGatitos
  const gatitos = await walletContract.obtenerGatitos();

  return gatitos.map(g => ({
    id: g.id.toString(), // BigNumber a String
    name: g.nombre,
    price: ethers.utils.formatEther(g.precio), // Wei a ETH
    image: g.imagen,
    seller: g.criador,
    active: g.disponible
  }));
}

module.exports = { addProduct, buyProduct, getAllProducts };
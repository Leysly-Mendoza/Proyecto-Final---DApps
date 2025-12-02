const { ethers } = require('ethers');
const contract = require('../artifacts/contracts/Wallet.sol/MultiSignPaymentWallet.json');
const { createTransaction, getContract } = require('../utils/contractHelper');
const { WALLET_CONTRACT } = process.env;

async function sendTransaction(method, params, account) {
  return await createTransaction(WALLET_CONTRACT, contract.abi, method, params, account);
}

async function addProduct(name, price, account) {
  const priceInWei = ethers.utils.parseEther(price.toString());
  const receipt = await sendTransaction('addProduct', [name, priceInWei], account);
  return receipt;
}

async function buyProduct(productId, account) {
  const walletContract = getContract(WALLET_CONTRACT, contract.abi);
  const product = await walletContract.products(productId);
  const price = product.price;

  const tx = await createTransaction(WALLET_CONTRACT, contract.abi, 'buyProduct', [productId], account, price);
  return tx;
}

async function disableProduct(productId, account) {
  const receipt = await sendTransaction('disableProduct', [productId], account);
  return receipt;
}

async function getAllProducts() {
  const walletContract = getContract(WALLET_CONTRACT, contract.abi);
  const products = await walletContract.getAllProducts();

  return products.map(p => ({
    id: Number(p.id),
    name: p.name,
    price: ethers.formatEther(p.price),
    seller: p.seller,
    active: p.active
  }));
}

module.exports = {
  addProduct,
  buyProduct,
  disableProduct,
  getAllProducts
};

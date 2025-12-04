const { ethers } = require("ethers");
const { provider, getWallet, getPublicKey } = require("./accountManager");

async function createTransaction(contractAddress, abi, method, params, accountIndex, value = null) {
  const wallet = getWallet(accountIndex);
  const contract = new ethers.Contract(contractAddress, abi, wallet);

  let txOptions = {};
  if (value) {
    txOptions.value = value;
  }

  try {
    const tx = await contract[method](...params, txOptions);
    console.log(`Enviando transacción ${method}... Hash: ${tx.hash}`);
    await tx.wait();
    console.log(`Transacción confirmada.`);
    return tx;
  } catch (error) {
    console.error(`Error en createTransaction (${method}):`, error.message);
    throw error;
  }
}

async function depositToContract(contractAddress, abi, amount, accountIndex) {
  const wallet = getWallet(accountIndex);
  const contract = new ethers.Contract(contractAddress, abi, wallet);
  const tx = await contract.deposit({ value: ethers.utils.parseEther(amount.toString()) });
  console.log("Deposito realizado:", tx.hash);
  await tx.wait();
  return tx;
}

function getContract(contractAddress, abi) {
  return new ethers.Contract(contractAddress, abi, provider);
}

module.exports = {
  createTransaction,
  depositToContract,
  getContract
};
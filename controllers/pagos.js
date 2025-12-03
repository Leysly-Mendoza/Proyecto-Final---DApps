const { ethers } = require('ethers');
// IMPORTANTE: Ruta al nuevo JSON
const contract = require('../artifacts/contracts/GatitoPagos.sol/PagosGatitos.json');
const { createTransaction, depositToContract, getContract } = require('../utils/contractHelper');
// Necesitas agregar esta dirección a tu .env si no la tienes
const { PAGOS_CONTRACT_ADDRESS } = process.env; 

async function deposit(amount, account) {
    // Solidity: pagarGatito()
    // Ojo: tu helper "depositToContract" llama a la función "deposit" por defecto?
    // Si tu helper usa el nombre de función fijo, fallará.
    // Mejor usamos createTransaction con 'value'.
    
    // Opción A: Si usas depositToContract, asegúrate que llame a "pagarGatito".
    // Opción B (Más segura):
    const amountInWei = ethers.utils.parseEther(amount.toString());
    return await createTransaction(PAGOS_CONTRACT_ADDRESS, contract.abi, 'pagarGatito', [], account, amountInWei);
}

async function release(account) {
    // Solidity: repartirPagos()
    return await createTransaction(PAGOS_CONTRACT_ADDRESS, contract.abi, 'repartirPagos', [], account);
}

async function getBalance() {
    const pagos = getContract(PAGOS_CONTRACT_ADDRESS, contract.abi);
    // Solidity: verBalance()
    const balance = await pagos.verBalance();
    console.log("Contract balance:", ethers.utils.formatEther(balance));
    return balance;
}

module.exports = {
    deposit,
    release,
    getBalance
};
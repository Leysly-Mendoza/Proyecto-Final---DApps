// require('dotenv').config({path:require('find-config')('.env')})
const { ethers } = require('ethers');

// AJUSTE 1: Cambiamos 'Pagod.json' por 'Pagos.json' (porque corregimos el nombre del contrato antes)
const contract = require('../artifacts/contracts/Pagos.sol/Pagos.json');

const { createTransaction, depositToContract, getContract } = require('../utils/contractHelper');
const { PAGOS_CONTRACT_ADDRESS } = process.env;

async function deposit(amount, account) {
    // La lógica se mantiene igual
    return await depositToContract(PAGOS_CONTRACT_ADDRESS, contract.abi, amount, account);
}

async function release(account) {
    // La lógica se mantiene igual
    return await createTransaction(PAGOS_CONTRACT_ADDRESS, contract.abi, 'release', [], account);
}

async function getBalance() {
    const pagos = getContract(PAGOS_CONTRACT_ADDRESS, contract.abi);
    const balance = await pagos.getBalance();
    
    // AJUSTE 2: En Ethers v6, 'utils' desaparece para formatEther. 
    // Se usa directamente ethers.formatEther()
    console.log("Contract balance:", ethers.formatEther(balance));
    
    return balance;
}

module.exports = {
    deposit,
    release,
    getBalance
};
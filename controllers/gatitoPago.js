const { ethers } = require('ethers');

// Cargamos el ABI correcto del contrato GatitoNFT
const contract = require('../artifacts/contracts/GatitoNFT.sol/GatitoNFT.json');

const { createTransaction, depositToContract, getContract } = require('../utils/contractHelper');

// Dirección del contrato en .env
const { GATITOS_CONTRACT_ADDRESS } = process.env;

// --- FUNCIONES PARA GATITOS NFT ---

// 1. Mintear un nuevo gatito
async function mintGatito(account) {
    return await createTransaction(
        GATITOS_CONTRACT_ADDRESS,
        contract.abi,
        'mintGatito',
        [],
        account
    );
}

// 2. Obtener la cantidad total de gatitos
async function getTotalGatitos() {
    const gatitos = getContract(GATITOS_CONTRACT_ADDRESS, contract.abi);
    const total = await gatitos.totalSupply();
    return Number(total);
}

// 3. Obtener la metadata de un gatito por ID
async function getGatito(id) {
    const gatitos = getContract(GATITOS_CONTRACT_ADDRESS, contract.abi);
    const tokenUri = await gatitos.tokenURI(id);
    return tokenUri;
}

// 4. Si tu contrato recibe pagos, puedes depositar:
async function deposit(amount, account) {
    return await depositToContract(
        GATITOS_CONTRACT_ADDRESS,
        contract.abi,
        amount,
        account
    );
}

// 5. Obtener balance del contrato
async function getBalance() {
    const gatitos = getContract(GATITOS_CONTRACT_ADDRESS, contract.abi);
    const balance = await gatitos.getBalance?.(); // por si existe

    console.log("Contract balance:", ethers.formatEther(balance ?? 0));
    return balance;
}

module.exports = {
    mintGatito,
    getTotalGatitos,
    getGatito,
    deposit,
    getBalance
};

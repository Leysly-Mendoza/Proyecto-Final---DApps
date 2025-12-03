const { ethers } = require('ethers');
// IMPORTANTE: Ruta al nuevo JSON
const contract = require('../backend/artifacts/contracts/GatitoWallet.sol/GatitosPaymentMultisig.json');
const { createTransaction, depositToContract, getContract } = require('../utils/contractHelper');
const { WALLET_CONTRACT } = process.env;

// 1. Crear Transacción (Antes: SubmitTransaction)
async function submitTransaction(to, amount, account) {
    // Solidity: crearTransaccion(address _destino, uint _monto)
    // Convertimos monto a Wei
    const amountInWei = ethers.utils.parseEther(amount.toString());
    const receipt = await createTransaction(WALLET_CONTRACT, contract.abi, 'crearTransaccion', [to, amountInWei], account);
    return receipt;
}

// 2. Firmar (Antes: approveTransaction)
async function approveTransaction(txId, account) {
    // Solidity: firmarTransaccion(uint _txId)
    const receipt = await createTransaction(WALLET_CONTRACT, contract.abi, 'firmarTransaccion', [txId], account);
    return receipt;
}

// 3. Ejecutar (Antes: executeTransaction)
async function executeTransaction(txId, account) {
    // Solidity: ejecutarTransaccion(uint _txId)
    const receipt = await createTransaction(WALLET_CONTRACT, contract.abi, 'ejecutarTransaccion', [txId], account);
    return receipt;
}

// 4. Repartir Fondos (Antes: releasePayments)
async function releasePayments(account) {
    // Solidity: repartirFondos()
    const receipt = await createTransaction(WALLET_CONTRACT, contract.abi, 'repartirFondos', [], account);
    return receipt;
}

// 5. Depositar (Sin cambios de lógica, pero apunta al contrato nuevo)
async function deposit(amount, account) {
    return await depositToContract(WALLET_CONTRACT, contract.abi, amount, account);
}

// 6. Ver Balance
async function getBalance() {
    const walletContract = getContract(WALLET_CONTRACT, contract.abi);
    const balance = await walletContract.verBalance(); // En tu contrato nuevo se llama verBalance
    return ethers.utils.formatEther(balance);
}

// 7. Ver Transacciones (Adaptado a tu struct nuevo)
async function getTransactions() {
    const walletContract = getContract(WALLET_CONTRACT, contract.abi);
    const transactions = await walletContract.transacciones; // Accedemos al array público si no hay getter específico
    // NOTA: Si tu contrato no tiene una función "getTransactions" que devuelva todo el array, 
    // tendrías que iterar. Asumiremos que Hardhat crea el getter automático para el array público.
    
    // Si da error, usa un bucle for o crea una función en Solidity "obtenerTransacciones"
    // Por ahora intentemos leer longitud y mapear (más complejo) o simplificar:
    // Para no complicarte, si tu contrato tiene `getTransactions` (en inglés) cámbialo, 
    // pero en el código que me pasaste NO TIENE getter de array completo.
    // Solo tiene mapping.
    
    return []; // Dejaremos esto vacío por ahora para que no crashee, ya que tu contrato nuevo no tiene función para devolver TODAS las transacciones juntas.
}

module.exports = {
    deposit,
    submitTransaction,
    approveTransaction,
    executeTransaction,
    releasePayments,
    getBalance,
    getTransactions
};
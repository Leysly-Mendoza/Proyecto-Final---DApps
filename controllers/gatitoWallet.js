// require('dotenv').config({path:require('find-config')('.env')})
const { ethers } = require('ethers');
const contract = require('../artifacts/contracts/Wallet.sol/MultiSignPaymentWallet.json');

const { 
    createTransaction, 
    depositToContract, 
    getContract 
} = require('../utils/contractHelper');

const { WALLET_CONTRACT } = process.env;


// Enviar cualquier función al contrato
async function sendTransaction(method, params, account) {
    return await createTransaction(
        WALLET_CONTRACT,
        contract.abi,
        method,
        params,
        account
    );
}


// =======================
// 🐱 ENVIAR TRANSACCIÓN
// =======================
async function submitTransaction(to, amount, account) {
    // amount debe llegar parseado o como string limpio
    const receipt = await sendTransaction("SubmitTransaction", [to, amount], account);
    return receipt;
}


// =======================
// 🐱 APROBAR TRANSACCIÓN
// =======================
async function approveTransaction(txId, account) {
    return await sendTransaction("approveTransaction", [txId], account);
}


// =======================
// 🐱 EJECUTAR TRANSACCIÓN
// =======================
async function executeTransaction(txId, account) {
    return await sendTransaction("executeTransaction", [txId], account);
}


// =======================
// 🐱 DEPOSITAR AL CONTRATO
// =======================
async function deposit(amount, account) {
    return await depositToContract(
        WALLET_CONTRACT,
        contract.abi,
        amount,
        account
    );
}


// =======================
// 🐱 LIBERAR PAGOS
// =======================
async function releasePayments(account) {
    return await sendTransaction("releasePayments", [], account);
}


// =======================
// 🐱 OBTENER BALANCE
// =======================
async function getBalance() {
    const walletContract = getContract(WALLET_CONTRACT, contract.abi);
    const balance = await walletContract.getBalance();

    return ethers.utils.formatEther(balance);
}


// =======================
// 🐱 FORMATEO DE TRANSACCIÓN
// =======================
function formatTransaction(info) {
    return {
        to: info.to,
        amount: info.amount.toString(),          // BigNumber → string
        approvalCount: info.approvalCount.toString(),
        executed: info.executed
    };
}


// =======================
// 🐱 LISTAR TRANSACCIONES
// =======================
async function getTransactions() {
    const walletContract = getContract(WALLET_CONTRACT, contract.abi);
    const transactions = await walletContract.getTransactions();

    return transactions.map(formatTransaction);
}


// =======================
// 🐱 OBTENER APROBACIONES
// =======================
async function getApprovals(txId) {
    const walletContract = getContract(WALLET_CONTRACT, contract.abi);
    const [txID, totalApprovals, approvalsList] = await walletContract.getApprovals(txId);

    const formatted = approvalsList.map(a => ({
        approver: a.approver,
        timestamp: a.timestamp.toString(),
        date: new Date(Number(a.timestamp.toString()) * 1000).toLocaleString(
            "es-MX",
            {
                timeZone: "America/Mexico_City",
                hour12: true
            }
        )
    }));

    return {
        txId: txID.toString(),
        totalApprovals: totalApprovals.toNumber(),
        approvals: formatted
    };
}


module.exports = {
    deposit,
    submitTransaction,
    approveTransaction,
    executeTransaction,
    releasePayments,
    getBalance,
    getTransactions,
    getApprovals
};
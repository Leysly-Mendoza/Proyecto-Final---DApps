// require('dotenv').config({path:require('find-config')('.env')})
const { ethers } = require('ethers');
const contract = require('../artifacts/contracts/Wallet.sol/MultiSignPaymentWallet.json');
const { createTransaction, depositToContract, getContract } = require('../utils/contractHelper');
const { WALLET_CONTRACT } = process.env;

async function sendTransaction(method, params, account) {
    return await createTransaction(WALLET_CONTRACT, contract.abi, method, params, account);
}

async function submitTransaction(to, amount, account) {
    // Nota: amount debe llegar aquí ya parseado o como string limpio
    const receipt = await sendTransaction('SubmitTransaction', [to, amount], account);
    return receipt;
}

async function approveTransaction(txId, account) {
    const receipt = await sendTransaction('approveTransaction', [txId], account);
    return receipt;
}

async function executeTransaction(txId, account) {
    const receipt = await sendTransaction('executeTransaction', [txId], account);
    return receipt;
}

async function deposit(amount, account) {
    return await depositToContract(WALLET_CONTRACT, contract.abi, amount, account);
}

async function releasePayments(account) {
    const receipt = await sendTransaction('releasePayments', [], account);
    return receipt;
}

async function getBalance() {
    const walletContract = getContract(WALLET_CONTRACT, contract.abi);
    const balance = await walletContract.getBalance();
    // En v6, formatEther está en la raíz de ethers, no en utils
    return ethers.formatEther(balance); 
}

async function getTransactions() {
    const walletContract = getContract(WALLET_CONTRACT, contract.abi);
    const transactions = await walletContract.getTransactions();
    // console.log(transactions);
    return transactions.map(formatTransaction);
}

// --- AQUÍ ESTABA EL ERROR PRINCIPAL (Corrección v6) ---
function formatTransaction(info) {
    return {
        to: info.to,
        // En v6, info.amount YA ES un BigInt. No usamos BigNumber.from
        amount: info.amount.toString(), 
        approvalCount: info.approvalCount.toString(),
        executed: info.executed
    };
}

async function getApprovals(txId) {
    const walletContract = getContract(WALLET_CONTRACT, contract.abi);
    const [txID, totalApprovals, approvalsList] = await walletContract.getApprovals(txId);

    // 🔹 Formateamos la información
    const formattedApprovals = approvalsList.map(a => ({
        approver: a.approver,
        timestamp: a.timestamp.toString(),
        // Convertimos BigInt a Number para la fecha
        date: new Date(Number(a.timestamp) * 1000).toLocaleString('es-MX', {
            timeZone: 'America/Mexico_City',
            hour12: true
        })
    }));

    // 🔹 Retornamos el JSON
    return {
        txId: txID.toString(),
        totalApprovals: Number(totalApprovals),
        approvals: formattedApprovals
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
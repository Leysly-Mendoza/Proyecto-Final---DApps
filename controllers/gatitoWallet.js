const { ethers } = require('ethers');
const contract = require('../backend/artifacts/contracts/GatitoWallet.sol/GatitosPaymentMultisig.json');
const { createTransaction, getContract } = require('../utils/contractHelper');
const { WALLET_CONTRACT } = process.env;

async function crearTransaccion(destino, monto, account) {
    const montoWei = ethers.utils.parseEther(monto.toString());
    return await createTransaction(WALLET_CONTRACT, contract.abi, 'crearTransaccion', [destino, montoWei], account);
}

async function firmarTransaccion(txId, account) {
    return await createTransaction(WALLET_CONTRACT, contract.abi, 'firmarTransaccion', [txId], account);
}

async function ejecutarTransaccion(txId, account) {
    return await createTransaction(WALLET_CONTRACT, contract.abi, 'ejecutarTransaccion', [txId], account);
}

async function repartirFondos(account) {
    return await createTransaction(WALLET_CONTRACT, contract.abi, 'repartirFondos', [], account);
}

async function verBalance() {
    const contrato = getContract(WALLET_CONTRACT, contract.abi);
    const balance = await contrato.verBalance();
    return ethers.utils.formatEther(balance);
}

async function getTransacciones() {
    const contrato = getContract(WALLET_CONTRACT, contract.abi);
    const total = await contrato.nextTxId();
    let arr = [];
    for (let i = 0; i < total; i++) {
        const t = await contrato.transacciones(i);
        arr.push({
            id: t.id.toString(),
            destino: t.destino,
            monto: ethers.utils.formatEther(t.monto),
            firmas: t.firmas.toString(),
            ejecutada: t.ejecutada,
        });
    }
    return arr;
}

module.exports = {
    crearTransaccion,
    firmarTransaccion,
    ejecutarTransaccion,
    repartirFondos,
    verBalance,
    getTransacciones
};

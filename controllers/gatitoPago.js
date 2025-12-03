const { ethers } = require('ethers');

// ABI del contrato de pagos GatitoPagos.sol
const contract = require('../backend/artifacts/contracts/GatitoPagos.sol/PagosGatitos.json');

const { createTransaction, depositToContract, getContract } = require('../utils/contractHelper');

// Dirección del contrato (asegúrate de tenerla en .env)
const { PAGOS_CONTRACT_ADDRESS } = process.env;

/* ---------------------------------------------------
   🐱 1. DEPOSITAR UN PAGO PARA UN GATITO
      (Función Solidity: pagarGatito)
--------------------------------------------------- */
async function depositarPagoGatito(amountEth, account) {
    const amountWei = ethers.utils.parseEther(amountEth.toString());

    return await createTransaction(
        PAGOS_CONTRACT_ADDRESS,
        contract.abi,
        'pagarGatito',
        [],       // sin argumentos
        account,
        amountWei // value del pago
    );
}

/* ---------------------------------------------------
   🐱 2. LIBERAR / REPARTIR LOS PAGOS A CRIADORES
      (Función Solidity: repartirPagos)
--------------------------------------------------- */
async function liberarPagosDeGatitos(account) {
    return await createTransaction(
        PAGOS_CONTRACT_ADDRESS,
        contract.abi,
        'repartirPagos',
        [],
        account
    );
}

/* ---------------------------------------------------
   🐱 3. OBTENER BALANCE TOTAL DEL CONTRATO DE PAGOS
      (Función Solidity: verBalance)
--------------------------------------------------- */
async function getBalancePagosGatitos() {
    const pagos = getContract(PAGOS_CONTRACT_ADDRESS, contract.abi);
    const balanceWei = await pagos.verBalance();
    const balanceEth = ethers.utils.formatEther(balanceWei);

    console.log("Balance del contrato de pagos de gatitos:", balanceEth);

    return balanceEth;
}

module.exports = {
    depositarPagoGatito,
    liberarPagosDeGatitos,
    getBalancePagosGatitos
};
const { ethers } = require('ethers');
const contract = require('../artifacts/contracts/Wallet.sol/MultiSignPaymentWallet.json');
const { createTransaction, getContract } = require('../utils/contractHelper');
const { WALLET_CONTRACT } = process.env;

// Función genérica
async function sendTransaction(method, params, account) {
  return await createTransaction(WALLET_CONTRACT, contract.abi, method, params, account);
}

// LISTAR GATITO NUEVO
async function listarGatito(nombre, precio, cuenta) {
  const precioWei = ethers.parseEther(precio.toString());
  const receipt = await sendTransaction('listarGatito', [nombre, precioWei], cuenta);
  return receipt;
}

// ADOPTAR GATITO (comprar)
async function adoptarGatito(gatitoId, cuenta) {
  const contratoWallet = getContract(WALLET_CONTRACT, contract.abi);

  const gatito = await contratoWallet.gatitos(gatitoId);
  const precio = gatito.precio;

  const tx = await createTransaction(
    WALLET_CONTRACT,
    contract.abi,
    'adoptarGatito',
    [gatitoId],
    cuenta,
    precio
  );

  return tx;
}

// DESHABILITAR GATITO
async function deshabilitarGatito(gatitoId, cuenta) {
  return await sendTransaction('deshabilitarGatito', [gatitoId], cuenta);
}

// OBTENER TODOS LOS GATITOS
async function getGatitos() {
  const contratoWallet = getContract(WALLET_CONTRACT, contract.abi);
  const gatitos = await contratoWallet.getGatitos();

  return gatitos.map(g => ({
    id: Number(g.id),
    nombre: g.nombre,
    precio: ethers.formatEther(g.precio),
    vendedor: g.vendedor,
    activo: g.activo
  }));
}

module.exports = {
  listarGatito,
  adoptarGatito,
  deshabilitarGatito,
  getGatitos
};
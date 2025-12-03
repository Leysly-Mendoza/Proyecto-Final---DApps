const { ethers } = require('ethers');

// ABI del contrato multisig + venta de gatitos
const contract = require('../backend/artifacts/contracts/GatitoWallet.sol/GatitosPaymentMultisig.json');

const { createTransaction, getContract } = require('../utils/contractHelper');
const { WALLET_CONTRACT } = process.env;

/* ----------------------------------------------------------
    🐱 1. AGREGAR GATITO
------------------------------------------------------------- */

async function agregarGatito(nombre, precioEth, imagenIpfs, cuenta) {
  const precioWei = ethers.utils.parseEther(precioEth.toString());

  return await createTransaction(
    WALLET_CONTRACT,
    contract.abi,
    "agregarGatito",
    [nombre, precioWei, imagenIpfs],
    cuenta
  );
}

/* ----------------------------------------------------------
    🐱 2. COMPRAR GATITO
------------------------------------------------------------- */

async function comprarGatito(gatitoId, cuenta) {
  const walletContract = getContract(WALLET_CONTRACT, contract.abi);

  const todos = await walletContract.obtenerGatitos();
  const g = todos[gatitoId];
  const precio = g.precio; // en wei

  return await createTransaction(
    WALLET_CONTRACT,
    contract.abi,
    "comprarGatito",
    [gatitoId],
    cuenta,
    precio
  );
}

/* ----------------------------------------------------------
    🐱 3. OBTENER TODOS LOS GATITOS
------------------------------------------------------------- */

async function obtenerGatitos() {
  const wallet = getContract(WALLET_CONTRACT, contract.abi);
  const arr = await wallet.obtenerGatitos();

  return arr.map(g => ({
    id: g.id.toString(),
    nombre: g.nombre,
    precioEth: ethers.utils.formatEther(g.precio),
    imagen: g.imagen,
    criador: g.criador,
    disponible: g.disponible
  }));
}

/* ----------------------------------------------------------
    🐱 4. DESHABILITAR GATITO
------------------------------------------------------------- */

async function deshabilitarGatito(gatitoId, cuenta) {
  return await createTransaction(
    WALLET_CONTRACT,
    contract.abi,
    "deshabilitarGatito",
    [gatitoId],
    cuenta
  );
}

module.exports = {
  agregarGatito,
  comprarGatito,
  obtenerGatitos,
  deshabilitarGatito
};

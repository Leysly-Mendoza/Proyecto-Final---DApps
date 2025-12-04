const { ethers } = require('ethers');

// ABIs de los 3 contratos
const walletABI = require('../backend/artifacts/contracts/GatitoWallet.sol/GatitosPaymentMultisig.json');
const nftABI = require('../backend/artifacts/contracts/GatitoNFT.sol/GatitoNFT.json');
const pagosABI = require('../backend/artifacts/contracts/GatitoPagos.sol/PagosGatitos.json');

const { createTransaction, getContract } = require('../utils/contractHelper');
const { WALLET_CONTRACT, NFT_CONTRACT_ADDRESS, PAGOS_CONTRACT_ADDRESS } = process.env;

/* ----------------------------------------------------------
    🐱 1. AGREGAR GATITO (Ahora con NFT)
    Flujo: 1. Mintea NFT, 2. Agrega a venta en Wallet
------------------------------------------------------------- */

async function agregarGatito(nombre, precioEth, imagenIpfs, cuenta) {
  const precioWei = ethers.utils.parseEther(precioEth.toString());

  // PASO 1: Mintear NFT (el owner del NFT será la cuenta que lo agrega)
  const txNFT = await createTransaction(
    NFT_CONTRACT_ADDRESS,
    nftABI.abi,
    "mintearGatito",
    [cuenta, imagenIpfs], // dueño inicial es quien agrega el gatito
    cuenta
  );

  console.log("✅ NFT minteado:", txNFT);

  // PASO 2: Agregar a venta en el contrato Wallet
  return await createTransaction(
    WALLET_CONTRACT,
    walletABI.abi,
    "agregarGatito",
    [nombre, precioWei, imagenIpfs],
    cuenta
  );
}

/* ----------------------------------------------------------
    🐱 2. COMPRAR GATITO (Sin pago duplicado)
    Flujo: 1. NFT minteado al agregar, 2. Compra en Wallet (1 solo pago)
    Nota: El reparto se hace después con repartirFondos() del Wallet
------------------------------------------------------------- */

async function comprarGatito(gatitoId, cuenta) {
  const wallet = getContract(WALLET_CONTRACT, walletABI.abi);

  const todos = await wallet.obtenerGatitos();
  const g = todos[gatitoId];
  const precio = g.precio; // en wei

  // PASO 1: Comprar en el contrato Wallet (1 solo pago)
  const txCompra = await createTransaction(
    WALLET_CONTRACT,
    walletABI.abi,
    "comprarGatito",
    [gatitoId],
    cuenta,
    precio
  );

  console.log("✅ Compra registrada en Wallet (NFT + Pago)");
  console.log("💡 El owner puede repartir fondos usando repartirFondos()");

  // Nota: El NFT ya fue minteado cuando se agregó el gatito
  // La transferencia del NFT se haría manualmente o con approve

  return txCompra;
}

/* ----------------------------------------------------------
    🐱 3. OBTENER TODOS LOS GATITOS
------------------------------------------------------------- */

async function obtenerGatitos() {
  const wallet = getContract(WALLET_CONTRACT, walletABI.abi);
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
    walletABI.abi,
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

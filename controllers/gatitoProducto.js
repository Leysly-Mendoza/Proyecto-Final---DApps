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
    🐱 2. COMPRAR GATITO (Integrado con los 3 contratos)
    Flujo: 1. Compra en Wallet, 2. Pago a PagosGatitos, 3. Transferir NFT
------------------------------------------------------------- */

async function comprarGatito(gatitoId, cuenta) {
  const wallet = getContract(WALLET_CONTRACT, walletABI.abi);
  const nft = getContract(NFT_CONTRACT_ADDRESS, nftABI.abi);

  const todos = await wallet.obtenerGatitos();
  const g = todos[gatitoId];
  const precio = g.precio; // en wei
  const criador = g.criador;

  // PASO 1: Marcar como comprado en el contrato Wallet
  const txCompra = await createTransaction(
    WALLET_CONTRACT,
    walletABI.abi,
    "comprarGatito",
    [gatitoId],
    cuenta,
    precio
  );

  console.log("✅ Compra registrada en Wallet:", txCompra);

  // PASO 2: Enviar el pago al contrato PagosGatitos
  const txPago = await createTransaction(
    PAGOS_CONTRACT_ADDRESS,
    pagosABI.abi,
    "pagarGatito",
    [],
    cuenta,
    precio // Enviamos el mismo monto como pago
  );

  console.log("✅ Pago enviado a PagosGatitos:", txPago);

  // PASO 3: Transferir el NFT del criador al comprador
  // El tokenId del NFT es el mismo que el gatitoId + 1 (porque los NFTs empiezan en 1)
  const tokenId = parseInt(gatitoId) + 1;

  try {
    const txNFT = await createTransaction(
      NFT_CONTRACT_ADDRESS,
      nftABI.abi,
      "transferFrom",
      [criador, cuenta, tokenId],
      criador // La transacción la ejecuta el criador (owner del NFT)
    );
    console.log("✅ NFT transferido al comprador:", txNFT);
  } catch (error) {
    console.warn("⚠️ No se pudo transferir NFT automáticamente:", error.message);
    console.log("El owner debe transferir manualmente el NFT tokenId:", tokenId);
  }

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

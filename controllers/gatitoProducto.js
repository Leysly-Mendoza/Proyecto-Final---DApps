const { ethers } = require('ethers');
const walletABI = require('../backend/artifacts/contracts/GatitoWallet.sol/GatitosPaymentMultisig.json');
const nftABI = require('../backend/artifacts/contracts/GatitoNFT.sol/GatitoNFT.json');
const { createTransaction, getContract } = require('../utils/contractHelper');
const { getPublicKey } = require('../utils/accountManager');
const { WALLET_CONTRACT, NFT_CONTRACT_ADDRESS } = process.env;

async function agregarGatito(nombre, precioEth, imagenIpfs, cuenta) {
  const precioWei = ethers.utils.parseEther(precioEth.toString());
  const direccion = getPublicKey(cuenta);
  const txNFT = await createTransaction(
    NFT_CONTRACT_ADDRESS,
    nftABI.abi,
    "mintearGatito",
    [direccion, imagenIpfs], 
    cuenta
  );

  console.log("NFT minteado:", txNFT);

  return await createTransaction(
    WALLET_CONTRACT,
    walletABI.abi,
    "agregarGatito",
    [nombre, precioWei, imagenIpfs],
    cuenta
  );
}

async function comprarGatito(gatitoId, cuenta) {
  const wallet = getContract(WALLET_CONTRACT, walletABI.abi);

  const todos = await wallet.obtenerGatitos();
  const g = todos[gatitoId];
  const precio = g.precio; 

  const txCompra = await createTransaction(
    WALLET_CONTRACT,
    walletABI.abi,
    "comprarGatito",
    [gatitoId],
    cuenta,
    precio
  );

  console.log("Compra registrada en Wallet");
  console.log("El owner puede repartir fondos usando repartirFondos()");
  return txCompra;
}

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

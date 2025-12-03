require('dotenv').config(); 
// Si te da error de variables, usa: require('dotenv').config({ path: '../.env' });

const { ethers } = require('ethers');

// Apuntamos al artefacto correcto
const contractJSON = require('../backend/artifacts/contracts/GatitoWallet.sol/GatitosPaymentMultisig.json');

const API_URL = process.env.API_URL;
const PRIVATE_KEY = process.env.PRIVATE_KEYS.split(',')[0]; 
const WALLET_CONTRACT = process.env.WALLET_CONTRACT;

async function main() {
    // Usamos sintaxis Ethers v5 (compatibilidad con tu proyecto)
    const provider = new ethers.providers.JsonRpcProvider(API_URL);
    const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
    const contract = new ethers.Contract(WALLET_CONTRACT, contractJSON.abi, wallet);

    console.log("Agregando Gatito a la tienda...");

    // IMPORTANTE: Esta URL idealmente viene de haber ejecutado nfts.js antes
    const IMAGEN_URL = "https://gateway.pinata.cloud/ipfs/QmaQv1omVDe82326B74YSes16dyN145rPEwPD1PbUkcGDQ"; 
    
    // Corregido: Nombre de función 'agregarGatito' y 'ethers.utils.parseEther'
    const tx = await contract.agregarGatito(
        "Gatito Naranja Real", 
        ethers.utils.parseEther("0.002"), 
        IMAGEN_URL
    );
    
    console.log("Transacción enviada:", tx.hash);
    console.log("Esperando confirmación...");
    
    await tx.wait();
    console.log("✅ ¡Gatito Agregado a la Tienda con Éxito!");
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});
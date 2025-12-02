require('dotenv').config();
const { ethers } = require('ethers');

// Asegúrate de que esta ruta sea la correcta hacia tu JSON
// Si seguiste mis pasos de mover la carpeta, esto está bien:
const contractJSON = require('../artifacts/contracts/Wallet.sol/MultiSignPaymentWallet.json');

const API_URL = process.env.API_URL;
// Tomamos la primera clave privada de la lista
const PRIVATE_KEY = process.env.PRIVATE_KEYS.split(',')[0]; 
const WALLET_CONTRACT = process.env.WALLET_CONTRACT;

async function main() {
    // Configuración para Ethers v6
    const provider = new ethers.JsonRpcProvider(API_URL);
    const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
    const contract = new ethers.Contract(WALLET_CONTRACT, contractJSON.abi, wallet);

    console.log("🐈 Agregando Gatito a la tienda...");

    // ---------------------------------------------------------
    // ¡AQUÍ PEGA EL LINK QUE TE DIO EL SCRIPT ANTERIOR! 👇
    // ---------------------------------------------------------
    const IMAGEN_URL = "https://gateway.pinata.cloud/ipfs/QmaQv1omVDe82326B74YSes16dyN145rPEwPD1PbUkcGDQ"; 
    
    // Ahora enviamos los 3 argumentos que pide tu nuevo contrato:
    // 1. Nombre
    // 2. Precio (convertido a Wei)
    // 3. Imagen (URL)
    const tx = await contract.addProduct(
        "Gatito Naranja Real", 
        ethers.parseEther("0.002"), 
        IMAGEN_URL
    );
    
    console.log("Transacción enviada:", tx.hash);
    console.log("Esperando confirmación...");
    
    await tx.wait();
    console.log("✅ ¡Producto Agregado con Éxito!");
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});
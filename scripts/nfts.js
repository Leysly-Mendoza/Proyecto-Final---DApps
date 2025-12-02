require('dotenv').config();
const fs = require('fs');
const FormData = require('form-data');
const axios = require('axios');
const { ethers } = require('ethers');

const contractJSON = require('../artifacts/contracts/NFT.sol/NFTClase.json');

const {
    PINATA_API_KEY,
    PINATA_SECRET_KEY,
    NFT_CONTRACT_ADDRESS,
    PUBLIC_KEYS, // Ojo: En tu .env le pusimos PUBLIC_KEYS (plural)
    PRIVATE_KEYS, // Ojo: En tu .env le pusimos PRIVATE_KEYS (plural)
    API_URL
} = process.env;

// Tomamos la primera cuenta de la lista del .env
const PUBLIC_KEY = PUBLIC_KEYS.split(',')[0];
const PRIVATE_KEY = PRIVATE_KEYS.split(',')[0];

async function createImgInfo(imageRoute) {
    console.log("Subiendo imagen a Pinata...");
    const stream = fs.createReadStream(imageRoute);
    const data = new FormData();
    data.append('file', stream);

    const fileResponse = await axios.post("https://api.pinata.cloud/pinning/pinFileToIPFS", data, {
        headers: {
            maxBodyLength: "Infinity",
            ...data.getHeaders(),
            pinata_api_key: PINATA_API_KEY,
            pinata_secret_api_key: PINATA_SECRET_KEY
        }
    });
    const { data: fileData = {} } = fileResponse;
    const { IpfsHash } = fileData;
    const fileIPFS = `https://gateway.pinata.cloud/ipfs/${IpfsHash}`;
    console.log("Imagen subida:", fileIPFS);
    return fileIPFS;
}

async function createJsonInfo(metadata) {
    console.log("Subiendo metadatos JSON...");
    const pinataJSONBody = {
        pinataMetadata: { name: metadata.name + '.json' },
        pinataContent: metadata
    };
    const jsonResponse = await axios.post(
        'https://api.pinata.cloud/pinning/pinJSONToIPFS',
        pinataJSONBody,
        {
            headers: {
                "Content-Type": 'application/json',
                pinata_api_key: PINATA_API_KEY,
                pinata_secret_api_key: PINATA_SECRET_KEY
            }
        }
    );
    const { data: jsonData = {} } = jsonResponse;
    const { IpfsHash } = jsonData;
    const tokenURI = `https://gateway.pinata.cloud/ipfs/${IpfsHash}`;
    console.log("Metadata JSON subido:", tokenURI);
    return tokenURI;
}

async function mintNFT(tokenURI) {
    console.log("Iniciando Mint en Blockchain...");
    
    // 1. Configuración moderna (Ethers v6)
    const provider = new ethers.JsonRpcProvider(API_URL);
    const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
    const contract = new ethers.Contract(NFT_CONTRACT_ADDRESS, contractJSON.abi, wallet);

    // 2. Ejecutar la función del contrato directamente
    // En v6 no hace falta calcular gas manual ni firmar raw transaction, el wallet lo hace solo.
    try {
        const tx = await contract.mintNFT(PUBLIC_KEY, tokenURI);
        console.log(`Transacción enviada: ${tx.hash}`);
        
        console.log("Esperando confirmación...");
        const receipt = await tx.wait();
        
        console.log("✅ ¡NFT Minteado con éxito!");
        return tx.hash;
    } catch (error) {
        console.error("Error al mintear:", error.message);
        throw error;
    }
}

async function createNFT() {
    try {
        // Asegúrate de tener una imagen en esta ruta o cambia el nombre
        // Puedes crear una carpeta 'images' en backend/ o usar una ruta absoluta
        const imgInfo = await createImgInfo('images/gato1.jpg'); 
        
        const metadata = {
            image: imgInfo,
            name: 'Gatito Real #1',
            description: "Un gatito naranja verificado en Blockchain",
            attributes: [
                { 'trait_type': 'raza', value: 'Naranja' },
                { 'trait_type': 'humor', value: 'Feliz' }
            ]
        };
        
        const tokenURI = await createJsonInfo(metadata);
        const nftResult = await mintNFT(tokenURI);
        
        console.log("--- PROCESO TERMINADO ---");
        return nftResult;

    } catch (error) {
        console.error("Error en el proceso:", error);
    }
}

// Ejecutar
createNFT();
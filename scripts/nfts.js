require('dotenv').config(); // Si el script está en backend/scripts usa: require('dotenv').config({ path: '../.env' });
const fs = require('fs')
const FormData = require('form-data')
const axios = require('axios')
const { ethers } = require('ethers')

// 1. IMPORTANTE: Ruta actualizada al nuevo contrato compilado
const contractJSON = require('../backend/artifacts/contracts/GatitoNFT.sol/GatitoNFT.json')

const {
    PINATA_API_KEY,
    PINATA_SECRET_KEY,
    NFT_CONTRACT_ADDRESS,
    PUBLIC_KEYS,
    PRIVATE_KEYS,
    API_URL
} = process.env

// 2. IMPORTANTE: Manejo de claves en plural (como en tu .env)
const PUBLIC_KEY = PUBLIC_KEYS.split(',')[0];
const PRIVATE_KEY = PRIVATE_KEYS.split(',')[0];

async function createImgInfo(imageRoute) {
    console.log("Subiendo imagen a Pinata...");
    try {
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
    } catch (error) {
        console.error("Error subiendo imagen:", error.message);
        throw error;
    }
}

async function createJsonInfo(metadata) {
    console.log("Subiendo Metadata...");
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
    )
    const { data: jsonData = {} } = jsonResponse;
    const { IpfsHash } = jsonData;
    const tokenURI = `https://gateway.pinata.cloud/ipfs/${IpfsHash}`;
    console.log("Metadata URI:", tokenURI);
    return tokenURI
}

async function mintNFT(tokenURI) {
    console.log("Iniciando transacción en Blockchain...");
    
    // Configuración Ethers v5
    const provider = new ethers.providers.JsonRpcProvider(API_URL);
    const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
    
    // Instancia del contrato
    const contract = new ethers.Contract(NFT_CONTRACT_ADDRESS, contractJSON.abi, wallet);

    // 3. IMPORTANTE: Llamamos a la función "mintearGatito" (tu nombre en español)
    // En v5, al usar la instancia 'contract' conectada a 'wallet', no necesitas armar la tx manual.
    try {
        const tx = await contract.mintearGatito(PUBLIC_KEY, tokenURI);
        
        console.log("Transacción enviada:", tx.hash);
        console.log("Esperando confirmación...");
        
        const receipt = await tx.wait();
        
        // Buscamos el ID del evento Transfer (topic 3 suele ser el tokenId en ERC721 estándar)
        // O simplemente confirmamos éxito
        console.log("✅ ¡Gatito Minteado con éxito!");
        return tx.hash;
    } catch (error) {
        console.error("Error en el mint:", error);
    }
}

async function createNFT() {
    try {
        // Asegúrate que esta imagen exista en esa carpeta
        // Si ejecutas desde la raíz, la ruta es:
        const imgInfo = await createImgInfo('images/gato1.jpg'); 
        
        const metadata = {
            image: imgInfo,
            name: 'Gatito Real #1',
            description: "Gatito subido con Ethers v5",
            attributes: [
                { 'trait_type': 'color', value: 'Blanco' },
                { 'trait_type': 'raza', value: 'Persa' }
            ]
        }
        
        const tokenURI = await createJsonInfo(metadata)
        const nftResult = await mintNFT(tokenURI)
        
        console.log("--- PROCESO FINALIZADO ---");
        return nftResult
    } catch (error) {
        console.error("Falló el proceso:", error);
    }
}

createNFT()
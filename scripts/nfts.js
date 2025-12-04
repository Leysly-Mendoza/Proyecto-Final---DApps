require('dotenv').config(); 
const fs = require('fs')
const FormData = require('form-data')
const axios = require('axios')
const { ethers } = require('ethers')
const contractJSON = require('../backend/artifacts/contracts/GatitoNFT.sol/GatitoNFT.json')

const {
    PINATA_API_KEY,
    PINATA_SECRET_KEY,
    NFT_CONTRACT_ADDRESS,
    PUBLIC_KEYS,
    PRIVATE_KEYS,
    API_URL
} = process.env

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
    console.log("Iniciando transacción en Blockchain");
    const provider = new ethers.providers.JsonRpcProvider(API_URL);
    const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
    const contract = new ethers.Contract(NFT_CONTRACT_ADDRESS, contractJSON.abi, wallet);

    try {
        const tx = await contract.mintearGatito(PUBLIC_KEY, tokenURI);
        
        console.log("Transacción enviada:", tx.hash);
        console.log("Esperando confirmación");
        
        const receipt = await tx.wait();
        console.log("Gatito Minteado con éxito");
        return tx.hash;
    } catch (error) {
        console.error("Error en el mint:", error);
    }
}

async function createNFT() {
    try {
        const imgInfo = await createImgInfo('images/gato1.jpg'); 
        const metadata = {
            image: imgInfo,
            name: 'Gatito Real #1',
            description: "Gatito subido",
            attributes: [
                { 'trait_type': 'color', value: 'Blanco' },
                { 'trait_type': 'raza', value: 'Persa' }
            ]
        }
        
        const tokenURI = await createJsonInfo(metadata)
        const nftResult = await mintNFT(tokenURI)
        
        console.log("PROCESO FINALIZADO");
        return nftResult
    } catch (error) {
        console.error("Falló el proceso:", error);
    }
}

createNFT()
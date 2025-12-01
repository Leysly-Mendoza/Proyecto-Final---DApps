require('dotenv').config();
const express = require('express');
const { ethers } = require('ethers');
const cors = require('cors');

const NFT_ARTIFACT = require('./backend/artifacts/contracts/NFT.sol/NFTClase.json');

const app = express();
app.use(cors()); 
app.use(express.json());

// Configuración
const API_URL = process.env.API_URL; 
const PRIVATE_KEY = process.env.PRIVATE_KEY; 
const NFT_ADDRESS = "0x5D0F9b37274d92F8Ce89905163815dD4a697FA19"; 

// Conexión a la Blockchain (Provider)
const provider = new ethers.JsonRpcProvider(API_URL);

// Instancia del Contrato (Solo lectura)
const nftContract = new ethers.Contract(NFT_ADDRESS, NFT_ARTIFACT.abi, provider);

app.get('/api/info', async (req, res) => {
    try {
        const name = await nftContract.name();
        const symbol = await nftContract.symbol();
        res.json({ name, symbol, address: NFT_ADDRESS });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/owner/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const owner = await nftContract.ownerOf(id);
        res.json({ tokenId: id, owner: owner });
    } catch (error) {
        res.status(500).json({ error: "El gatito no existe o hubo un error" });
    }
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`🚀 Backend Web3 corriendo en http://localhost:${PORT}`);
});
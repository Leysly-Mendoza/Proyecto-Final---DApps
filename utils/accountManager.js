require('dotenv').config();
const { ethers } = require('ethers');
const { API_URL, PUBLIC_KEYS, PRIVATE_KEYS } = process.env;
const publickeys = PUBLIC_KEYS ? PUBLIC_KEYS.split(',') : [];
const privatekeys = PRIVATE_KEYS ? PRIVATE_KEYS.split(',') : [];
const provider = new ethers.providers.JsonRpcProvider(API_URL);

function getWallet(accountIndex) {
    const index = parseInt(accountIndex);
    if (index >= privatekeys.length || isNaN(index)) {
        throw new Error(`La cuenta ${index} no existe o no está configurada`);
    }
    return new ethers.Wallet(privatekeys[index], provider);
}

function getPublicKey(accountIndex) {
    const index = parseInt(accountIndex);
    if (index >= publickeys.length || isNaN(index)) {
        throw new Error(`La cuenta pública ${index} no existe`);
    }
    return publickeys[index];
}

function getAllAcounts() {
    return publickeys.map((key, index) => ({ index: index, address: key }));
}

module.exports = {
    provider,
    getWallet,
    getPublicKey,
    getAllAcounts,
    publickeys,
    privatekeys
};
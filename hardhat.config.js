require("@nomiclabs/hardhat-ethers"); // Librería clásica
require("dotenv").config();

const { API_URL, PRIVATE_KEYS } = process.env;

// VALIDACIÓN DE SEGURIDAD
// Si usaste PRIVATE_KEYS (plural) en tu .env, tomamos la primera.
// Si usaste PRIVATE_KEY (singular), ajusta aquí.
const PRIVATE_KEY = PRIVATE_KEYS ? PRIVATE_KEYS.split(',')[0] : process.env.PRIVATE_KEY;

module.exports = {
  solidity: "0.8.28",
  defaultNetwork: "sepolia",
  networks: {
    sepolia: {
      url: API_URL,
      // NOTA: Si tu clave en el .env YA TIENE "0x", quítale el "0x" de aquí abajo.
      // Si NO tiene "0x" en el .env, déjalo así como está:
      accounts: [`0x${PRIVATE_KEY}`] 
    },
  },
  // IMPORTANTE: Esto le dice a Hardhat dónde guardar los JSON compilados.
  // Déjalo apuntando a backend/artifacts para que tu servidor Node.js los encuentre.
  paths: {
    artifacts: "./backend/artifacts"
  }
};
require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

const { API_URL, PRIVATE_KEY } = process.env;

//verificacion
if (!API_URL || !PRIVATE_KEY) {
  console.warn("No se encontraron API_URL o PRIVATE_KEY en el archivo .env.");
}

module.exports = {
  solidity: "0.8.28", 
  defaultNetwork: "sepolia",
  networks: {
    hardhat: {}, 
    sepolia: {
      url: API_URL || "",
      accounts: PRIVATE_KEY ? [`0x${PRIVATE_KEY.replace(/^0x/, '')}`] : [],
    },
  },
  //Errores más claros
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./backend/artifacts" 
  },
};
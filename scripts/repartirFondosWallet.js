require('dotenv').config();
const { ethers } = require('ethers');
const contractJSON = require('../backend/artifacts/contracts/GatitoWallet.sol/GatitosPaymentMultisig.json');

const API_URL = process.env.API_URL;
const PRIVATE_KEY = process.env.PRIVATE_KEY; 
const WALLET_CONTRACT = process.env.WALLET_CONTRACT;

async function repartirFondosWallet() {
    console.log("Iniciando reparto de fondos desde el Wallet");

    try {
        const provider = new ethers.providers.JsonRpcProvider(API_URL);
        const wallet = new ethers.Wallet(PRIVATE_KEY, provider);

        console.log(`Usando cuenta: ${wallet.address}`);
        console.log(`Contrato Wallet: ${WALLET_CONTRACT}`);

        const contract = new ethers.Contract(
            WALLET_CONTRACT,
            contractJSON.abi,
            wallet
        );

        const balance = await provider.getBalance(WALLET_CONTRACT);
        const balanceEth = ethers.utils.formatEther(balance);

        console.log(`\nBalance actual del Wallet: ${balanceEth} ETH`);

        if (balance.eq(0)) {
            console.log("No hay fondos para repartir");
            return;
        }
        const criadores = [];
        let i = 0;
        while (true) {
            try {
                const criador = await contract.criadores(i);
                const porcentaje = await contract.porcentajeGatitos(criador);
                criadores.push({ address: criador, porcentaje: porcentaje.toString() });
                i++;
            } catch {
                break;
            }
        }

        const totalPorcentajes = await contract.totalPorcentajes();

        console.log(`\nCriadores que recibirán pagos:`);
        criadores.forEach((c, idx) => {
            const porcentajeReal = (c.porcentaje * 100) / totalPorcentajes;
            console.log(`   ${idx + 1}. ${c.address} - ${porcentajeReal.toFixed(2)}%`);
        });

        console.log("\nEjecutando reparto de fondos desde Wallet");

        const tx = await contract.repartirFondos();
        console.log(`Transacción enviada: ${tx.hash}`);

        const receipt = await tx.wait();
        console.log(`Transacción confirmada en el bloque: ${receipt.blockNumber}`);

        const eventos = receipt.events.filter(e => e.event === 'PagoLiberado');

        console.log(`\nPagos realizados:`);
        eventos.forEach((evento, idx) => {
            const criador = evento.args.criador;
            const cantidad = ethers.utils.formatEther(evento.args.cantidad);
            console.log(`   ${idx + 1}. ${criador} recibió ${cantidad} ETH`);
        });

        console.log("\nFondos repartidos exitosamente desde el Wallet");

    } catch (error) {
        console.error("\nError al repartir fondos:");
        console.error(error.message);
        if (error.error) {
            console.error("Detalles:", error.error.message);
        }
    }
}

repartirFondosWallet()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });

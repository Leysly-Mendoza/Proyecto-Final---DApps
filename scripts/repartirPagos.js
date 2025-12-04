require('dotenv').config();
const { ethers } = require('ethers');

const contractJSON = require('../backend/artifacts/contracts/GatitoPagos.sol/PagosGatitos.json');

const API_URL = process.env.API_URL;
const PRIVATE_KEY = process.env.PRIVATE_KEY; // Owner key
const PAGOS_CONTRACT_ADDRESS = process.env.PAGOS_CONTRACT_ADDRESS;

async function repartirPagos() {
    console.log("🚀 Iniciando reparto de pagos...");

    try {
        // Conectar al provider
        const provider = new ethers.providers.JsonRpcProvider(API_URL);
        const wallet = new ethers.Wallet(PRIVATE_KEY, provider);

        console.log(`📍 Usando cuenta: ${wallet.address}`);
        console.log(`📍 Contrato PagosGatitos: ${PAGOS_CONTRACT_ADDRESS}`);

        // Conectar al contrato
        const contract = new ethers.Contract(
            PAGOS_CONTRACT_ADDRESS,
            contractJSON.abi,
            wallet
        );

        // Ver balance actual del contrato
        const balance = await contract.verBalance();
        const balanceEth = ethers.utils.formatEther(balance);

        console.log(`\n💰 Balance actual del contrato: ${balanceEth} ETH`);

        if (balance.eq(0)) {
            console.log("⚠️  No hay fondos para repartir.");
            return;
        }

        // Ver criadores y porcentajes
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

        console.log(`\n👥 Criadores que recibirán pagos:`);
        criadores.forEach((c, idx) => {
            console.log(`   ${idx + 1}. ${c.address} - ${c.porcentaje}%`);
        });

        // Ejecutar reparto
        console.log("\n📤 Ejecutando reparto de pagos...");

        const tx = await contract.repartirPagos();
        console.log(`⏳ Transacción enviada: ${tx.hash}`);

        const receipt = await tx.wait();
        console.log(`✅ Transacción confirmada en el bloque: ${receipt.blockNumber}`);

        // Ver eventos de pago repartido
        const eventos = receipt.events.filter(e => e.event === 'PagoRepartido');

        console.log(`\n💸 Pagos realizados:`);
        eventos.forEach((evento, idx) => {
            const criador = evento.args.criador;
            const cantidad = ethers.utils.formatEther(evento.args.cantidad);
            console.log(`   ${idx + 1}. ${criador} recibió ${cantidad} ETH`);
        });

        console.log("\n🎉 ¡Pagos repartidos exitosamente!");

    } catch (error) {
        console.error("\n❌ Error al repartir pagos:");
        console.error(error.message);
        if (error.error) {
            console.error("Detalles:", error.error.message);
        }
    }
}

// Ejecutar
repartirPagos()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });

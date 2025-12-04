require('dotenv').config();
const { ethers } = require('ethers');

const contractJSON = require('../backend/artifacts/contracts/GatitoWallet.sol/GatitosPaymentMultisig.json');

const API_URL = process.env.API_URL;
const PRIVATE_KEY = process.env.PRIVATE_KEY; // Owner key
const WALLET_CONTRACT = process.env.WALLET_CONTRACT;

async function repartirFondosWallet() {
    console.log("🚀 Iniciando reparto de fondos desde el Wallet...");

    try {
        // Conectar al provider
        const provider = new ethers.providers.JsonRpcProvider(API_URL);
        const wallet = new ethers.Wallet(PRIVATE_KEY, provider);

        console.log(`📍 Usando cuenta: ${wallet.address}`);
        console.log(`📍 Contrato Wallet: ${WALLET_CONTRACT}`);

        // Conectar al contrato
        const contract = new ethers.Contract(
            WALLET_CONTRACT,
            contractJSON.abi,
            wallet
        );

        // Ver balance actual del contrato
        const balance = await provider.getBalance(WALLET_CONTRACT);
        const balanceEth = ethers.utils.formatEther(balance);

        console.log(`\n💰 Balance actual del Wallet: ${balanceEth} ETH`);

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

        const totalPorcentajes = await contract.totalPorcentajes();

        console.log(`\n👥 Criadores que recibirán pagos:`);
        criadores.forEach((c, idx) => {
            const porcentajeReal = (c.porcentaje * 100) / totalPorcentajes;
            console.log(`   ${idx + 1}. ${c.address} - ${porcentajeReal.toFixed(2)}%`);
        });

        // Ejecutar reparto
        console.log("\n📤 Ejecutando reparto de fondos desde Wallet...");

        const tx = await contract.repartirFondos();
        console.log(`⏳ Transacción enviada: ${tx.hash}`);

        const receipt = await tx.wait();
        console.log(`✅ Transacción confirmada en el bloque: ${receipt.blockNumber}`);

        // Ver eventos de pago liberado
        const eventos = receipt.events.filter(e => e.event === 'PagoLiberado');

        console.log(`\n💸 Pagos realizados:`);
        eventos.forEach((evento, idx) => {
            const criador = evento.args.criador;
            const cantidad = ethers.utils.formatEther(evento.args.cantidad);
            console.log(`   ${idx + 1}. ${criador} recibió ${cantidad} ETH`);
        });

        console.log("\n🎉 ¡Fondos repartidos exitosamente desde el Wallet!");

    } catch (error) {
        console.error("\n❌ Error al repartir fondos:");
        console.error(error.message);
        if (error.error) {
            console.error("Detalles:", error.error.message);
        }
    }
}

// Ejecutar
repartirFondosWallet()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });

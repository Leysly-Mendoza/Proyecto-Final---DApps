const express = require('express');
const router = express.Router();
const pagosController = require('../controllers/gatitoPago');

/* ---------------------------------------------------
   🐱 Depositar pago para un gatito
--------------------------------------------------- */
router.post('/depositar-gatito', async (req, res) => {
    try {
        const { amount, account } = req.body;

        await pagosController.depositarPagoGatito(amount, account);

        res.json({ 
            success: true, 
            message: 'Pago de gatito depositado correctamente 🐱💰' 
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

/* ---------------------------------------------------
   🐱 Liberar / Repartir pagos a criadores
--------------------------------------------------- */
router.post('/liberar-pagos', async (req, res) => {
    try {
        const { account } = req.body;

        const receipt = await pagosController.liberarPagosDeGatitos(account);

        res.json({ 
            success: true, 
            message: 'Pagos liberados para los criadores 🐾✨',
            receipt 
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

/* ---------------------------------------------------
   🐱 Obtener balance total del contrato
--------------------------------------------------- */
router.get('/balance-gatitos', async (req, res) => {
    try {
        const balance = await pagosController.getBalancePagosGatitos();

        res.json({ 
            balance 
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;

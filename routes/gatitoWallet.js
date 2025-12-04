const express = require('express');
const router = express.Router();
const walletController = require('../controllers/gatitoWallet');

router.post('/crear-transaccion', async (req, res) => {
    try {
        const { destino, monto, cuenta } = req.body;
        const result = await walletController.crearTransaccion(destino, monto, cuenta);
        res.json({ success: true, message: 'Transacción creada', result });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

router.post('/firmar', async (req, res) => {
    try {
        const { txId, cuenta } = req.body;
        const result = await walletController.firmarTransaccion(txId, cuenta);
        res.json({ success: true, message: 'Transacción firmada', result });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

router.post('/ejecutar', async (req, res) => {
    try {
        const { txId, cuenta } = req.body;
        const result = await walletController.ejecutarTransaccion(txId, cuenta);
        res.json({ success: true, message: 'Transacción ejecutada', result });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

router.post('/repartir-fondos', async (req, res) => {
    try {
        const { cuenta } = req.body;
        const result = await walletController.repartirFondos(cuenta);
        res.json({ success: true, message: 'Fondos repartidos', result });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

router.get('/balance', async (req, res) => {
    try {
        const balance = await walletController.verBalance();
        res.json({ success: true, balance });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

router.get('/transacciones', async (req, res) => {
    try {
        const lista = await walletController.getTransacciones();
        res.json({ success: true, transacciones: lista });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;
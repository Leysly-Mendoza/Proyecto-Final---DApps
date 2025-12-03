const express = require('express');
const router = express.Router();
const walletController = require('../controllers/wallet');
// Ya no necesitas importar ethers aquí si no haces conversiones
// const { ethers } = require('ethers'); 

router.post('/deposit', async (req, res) => {
    try {
        const { amount, account } = req.body;
        console.log("Deposit body:", req.body);
        await walletController.deposit(amount, account);
        res.json({ success: true, message: 'Deposit successful' });
    } catch (error) {
        console.error('Deposit error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

router.post('/submit', async (req, res) => {
    try {
        const { to, amount, account } = req.body;
        
        // --- CORRECCIÓN AQUÍ ---
        // NO convertimos a parseEther aquí, porque el controlador ya lo hace.
        // Solo pasamos el 'amount' tal cual llegó (ej: "0.01")
        const receipt = await walletController.submitTransaction(to, amount, account);
        
        res.json({ success: true, message: 'Transaction submitted', receipt });
    } catch (error) {
        console.error('Submit error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// ... Las demás rutas (approve, execute, release, transactions, balance, approvals) 
// ESTÁN PERFECTAS, déjalas igual.
router.post('/approve', async (req, res) => {
    try {
        const { transactionId, account } = req.body;
        const receipt = await walletController.approveTransaction(transactionId, account);
        res.json({ success: true, message: 'Transaction approved', receipt });
    } catch (error) {
        console.error('Approve error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

router.post('/execute', async (req, res) => {
    try {
        const { transactionId, account } = req.body;
        const receipt = await walletController.executeTransaction(transactionId, account);
        res.json({ success: true, message: 'Transaction executed', receipt });
    } catch (error) {
        console.error('Execute error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

router.post('/release', async (req, res) => {
    try {
        const { account } = req.body;
        const receipt = await walletController.releasePayments(account);
        res.json({ success: true, message: 'Payments released to all payees', receipt });
    } catch (error) {
        console.error('Release error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

router.get('/transactions', async (req, res) => {
    try {
        const transactions = await walletController.getTransactions();
        res.json({ success: true, transactions });
    } catch (error) {
        console.error('Get transactions error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

router.get('/balance', async (req, res) => {
    try {
        const balance = await walletController.getBalance();
        res.json({ success: true, balance });
    } catch (error) {
        console.error('Get balance error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

router.get('/approvals/:txId', async (req, res) => {
    try {
        const { txId } = req.params;
        const approvals = await walletController.getApprovals(txId);
        res.json({ success: true, approvals });
    } catch (error) {
        console.error('Get approvals error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;
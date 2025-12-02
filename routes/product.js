const express = require('express');
const router = express.Router();
const productController = require('../controllers/product');

router.post('/add', async (req, res) => {
  try {
    const { name, price, account } = req.body;
    const result = await productController.addProduct(name, price, account);
    res.json({ success: true, message: 'Producto agregado', result });
  } catch (error) {
    console.error('Add product error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/buy', async (req, res) => {
  try {
    const { productId, account } = req.body;
    const result = await productController.buyProduct(productId, account);
    res.json({ success: true, message: 'Producto comprado', result });
  } catch (error) {
    console.error('Buy product error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/disable', async (req, res) => {
  try {
    const { productId, account } = req.body;
    const result = await productController.disableProduct(productId, account);
    res.json({ success: true, message: 'Producto deshabilitado', result });
  } catch (error) {
    console.error('Disable product error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/all', async (req, res) => {
  try {
    const products = await productController.getAllProducts();
    res.json({ success: true, products });
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;

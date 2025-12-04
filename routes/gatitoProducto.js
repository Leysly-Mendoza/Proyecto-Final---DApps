const express = require('express');
const router = express.Router();
const productoController = require('../controllers/gatitoProducto');

router.post('/agregar', async (req, res) => {
  try {
    const { nombre, precio, imagen, cuenta } = req.body;

    const resultado = await productoController.agregarGatito(
      nombre,
      precio,
      imagen,
      cuenta
    );

    res.json({ success: true, resultado });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/comprar', async (req, res) => {
  try {
    const { gatitoId, cuenta } = req.body;

    const resultado = await productoController.comprarGatito(gatitoId, cuenta);

    res.json({ success: true, message: 'Gatito comprado 🐾', resultado });
  } catch (error) {
    console.error('Error al comprar gatito:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/deshabilitar', async (req, res) => {
  try {
    const { gatitoId, cuenta } = req.body;

    const resultado = await productoController.deshabilitarGatito(
      gatitoId,
      cuenta
    );

    res.json({ success: true, message: 'Gatito deshabilitado', resultado });
  } catch (error) {
    console.error('Error al deshabilitar gatito:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/todos', async (req, res) => {
  try {
    const lista = await productoController.obtenerGatitos();

    res.json({ success: true, gatitos: lista });
  } catch (error) {
    console.error('Error al obtener gatitos:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;

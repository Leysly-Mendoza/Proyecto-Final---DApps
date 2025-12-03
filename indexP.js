require('dotenv').config(); // Siempre al inicio
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cors = require('cors');

// 1. CORRECCIÓN DE NOMBRES DE ARCHIVOS
const gatitoWalletRoutes = require('./routes/gatitoWallet');
const gatitoPagosRoutes = require('./routes/gatitoPago');
const gatitoProductoRoutes = require('./routes/gatitoProducto');

app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// 2. USO DE RUTAS Y NOMBRES CONSISTENTES
app.use('/api/wallet', gatitoWalletRoutes);
app.use('/api/pagos', gatitoPagosRoutes);
app.use('/api/product', gatitoProductoRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server at port ${PORT}`));
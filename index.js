require('dotenv').config(); 
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cors = require('cors');

const gatitoWalletRoutes = require('./routes/gatitoWallet');
const gatitoProductoRoutes = require('./routes/gatitoProducto');

app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use('/api/wallet', gatitoWalletRoutes);
app.use('/api/product', gatitoProductoRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server at port ${PORT}`));
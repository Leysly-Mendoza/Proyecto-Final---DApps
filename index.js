require('dotenv').config();
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cors = require('cors');

//const userRoutes = require('./routes/user');
const walletRoutes = require('./routes/wallet');
const pagosRoutes = require('./routes/pagos');
const productRoutes = require('./routes/product');

app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

//app.use('/api/user', userRoutes);
app.use('/api/wallet', walletRoutes);
app.use('/api/pagos', pagosRoutes);
app.use('/api/product', productRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server at port ${PORT}`));
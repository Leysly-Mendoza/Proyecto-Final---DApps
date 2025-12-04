# 🐱 Proyecto Final - DApps: Marketplace de Gatitos NFT

Aplicación Web3 completa para comprar y vender gatitos virtuales como NFTs en la red Ethereum Sepolia.

---

## 📋 Tabla de Contenidos

- [Características](#características)
- [Tecnologías Utilizadas](#tecnologías-utilizadas)
- [Arquitectura del Proyecto](#arquitectura-del-proyecto)
- [Contratos Inteligentes](#contratos-inteligentes)
- [Configuración e Instalación](#configuración-e-instalación)
- [API Endpoints](#api-endpoints)
- [Scripts Disponibles](#scripts-disponibles)
- [Uso con Postman](#uso-con-postman)
- [Estructura del Proyecto](#estructura-del-proyecto)

---

## ✨ Características

- **NFTs ERC-721**: Cada gatito es un token no fungible único
- **Marketplace Descentralizado**: Compra y venta de gatitos en blockchain
- **Upload a IPFS/Pinata**: Almacenamiento descentralizado de imágenes
- **Sistema Multisig**: Control de fondos con múltiples firmantes
- **Distribución Automática**: Reparto de ganancias entre criadores
- **Frontend Interactivo**: Interfaz React con integración MetaMask

---

## 🛠️ Tecnologías Utilizadas

### Backend
- **Node.js** + **Express.js**: Servidor API REST
- **Ethers.js v5**: Interacción con blockchain Ethereum
- **Hardhat**: Framework de desarrollo de contratos
- **dotenv**: Gestión de variables de entorno

### Frontend
- **React**: Biblioteca UI
- **Vite**: Build tool y dev server
- **MetaMask**: Wallet para transacciones

### Blockchain
- **Solidity ^0.8.0**: Lenguaje de contratos inteligentes
- **OpenZeppelin**: Librerías de contratos seguros
- **Ethereum Sepolia Testnet**: Red de pruebas

### Almacenamiento
- **Pinata/IPFS**: Almacenamiento descentralizado de imágenes

---

## 🏗️ Arquitectura del Proyecto

```
Usuario
  ↓
Frontend (React + MetaMask)
  ↓
Backend (Express.js API)
  ↓
Blockchain (Sepolia)
  ├─ GatitoNFT (ERC-721)
  └─ GatitosPaymentMultisig
       ├─ Marketplace
       ├─ Multisig Wallet
       └─ Payment Splitter
```

---

## 📜 Contratos Inteligentes

### 1. **GatitoNFT** 🎨

**Dirección**: `0x7922f608BbDD148ac2587c7ec2953b73A512078F`

**Propósito**: Crear NFTs únicos ERC-721 para cada gatito

**Métodos principales**:

| Método | Parámetros | Descripción |
|--------|-----------|-------------|
| `mintearGatito()` | `address dueno, string _tokenURI` | Crea un nuevo NFT de gatito |
| `tokenURI()` | `uint256 tokenId` | Devuelve metadata del NFT |
| `setBaseURI()` | `string baseUri` | Define URI base (opcional) |

**Características**:
- ✅ Estándar ERC-721 (compatible con OpenSea, Rarible, etc.)
- ✅ Contador incremental automático de IDs
- ✅ Metadata IPFS por token
- ✅ Ownership controlado por OpenZeppelin

---

### 2. **GatitosPaymentMultisig** 💰

**Dirección**: `0xe1F30Da6B24CE7C6e19e317970E1780f852efB76`

**Propósito**: Contrato 3-en-1 que maneja:
1. Marketplace de gatitos
2. Sistema Multisig
3. Distribución de pagos

#### **A. Funciones de Marketplace**

| Método | Parámetros | Descripción | Permisos |
|--------|-----------|-------------|----------|
| `agregarGatito()` | `string nombre, uint precio, string imagen` | Agrega gatito a venta | Solo cuidadores |
| `comprarGatito()` | `uint gatitoId` | Compra un gatito (payable) | Público |
| `obtenerGatitos()` | - | Lista todos los gatitos | Lectura pública |
| `deshabilitarGatito()` | `uint gatitoId` | Quita gatito de venta | Solo cuidadores |

#### **B. Funciones Multisig**

| Método | Parámetros | Descripción |
|--------|-----------|-------------|
| `crearTransaccion()` | `address destino, uint monto` | Propone retiro de fondos |
| `firmarTransaccion()` | `uint txId` | Firma una transacción |
| `ejecutarTransaccion()` | `uint txId` | Ejecuta tx aprobada |

#### **C. Funciones de Pagos**

| Método | Descripción |
|--------|-------------|
| `repartirFondos()` | Distribuye balance a criadores por porcentaje |
| `verBalance()` | Consulta balance del contrato |

**Características**:
- ✅ ReentrancyGuard para prevenir ataques
- ✅ Sistema de porcentajes para distribución justa
- ✅ Eventos emitidos para tracking
- ✅ Control de acceso basado en roles

---

## ⚙️ Configuración e Instalación

### Prerrequisitos

- Node.js >= 16.x
- npm o yarn
- MetaMask instalado en el navegador
- Cuenta con Sepolia ETH de prueba

### Instalación

1. **Clonar el repositorio**
```bash
git clone <tu-repositorio>
cd "PROYECTO FINAL - DAPPS"
```

2. **Instalar dependencias**
```bash
npm install
```

3. **Configurar variables de entorno**

Crear archivo `.env` en la raíz:

```env
# Alchemy API URL (Sepolia)
API_URL="https://eth-sepolia.g.alchemy.com/v2/TU_API_KEY"

# Claves privadas de las cuentas (NUNCA compartir en producción)
PRIVATE_KEYS="clave1,clave2"
PUBLIC_KEYS="0xAddress1,0xAddress2"

# Pinata (para IPFS)
PINATA_API_KEY="tu_api_key"
PINATA_SECRET_KEY="tu_secret_key"

# Direcciones de contratos desplegados
NFT_CONTRACT_ADDRESS="0x7922f608BbDD148ac2587c7ec2953b73A512078F"
WALLET_CONTRACT="0xe1F30Da6B24CE7C6e19e317970E1780f852efB76"
PAGOS_CONTRACT_ADDRESS="0x80c8a61532aC59e3Caa9b57C1C79709D53cb3E59"

# Clave única (primera cuenta)
PRIVATE_KEY="tu_private_key"
```

4. **Iniciar el backend**
```bash
node indexP.js
```
El servidor correrá en `http://localhost:3000`

5. **Iniciar el frontend** (en otra terminal)
```bash
cd frontend
npm install
npm run dev
```
El frontend correrá en `http://localhost:5173`

---

## 🌐 API Endpoints

### Base URL
```
http://localhost:3000
```

---

### **📦 Marketplace de Productos**

#### 1. Agregar Gatito
```http
POST /api/product/agregar
```

**Body (JSON)**:
```json
{
  "nombre": "Gatito Naranja",
  "precio": "0.001",
  "imagen": "QmaQv1omVDe82326B74YSes16dyN145rPEwPD1PbUkcGDQ",
  "cuenta": "0"
}
```

**Parámetros**:
- `nombre`: Nombre del gatito
- `precio`: Precio en ETH (string)
- `imagen`: Hash IPFS de la imagen
- `cuenta`: **Índice de cuenta** (0 o 1, no dirección)

**Respuesta**:
```json
{
  "success": true,
  "resultado": {
    "hash": "0x..."
  }
}
```

---

#### 2. Comprar Gatito
```http
POST /api/product/comprar
```

**Body (JSON)**:
```json
{
  "gatitoId": 0,
  "cuenta": "1"
}
```

**Parámetros**:
- `gatitoId`: ID del gatito (número)
- `cuenta`: Índice de cuenta del comprador

---

#### 3. Obtener Todos los Gatitos
```http
GET /api/product/todos
```

**Sin body**

**Respuesta**:
```json
{
  "success": true,
  "gatitos": [
    {
      "id": "0",
      "nombre": "Gatito Naranja",
      "precioEth": "0.001",
      "imagen": "https://gateway.pinata.cloud/ipfs/Qm...",
      "criador": "0xb17c90BD1BC4fdb4c90b7371CDcEb4D8B1bC68ac",
      "disponible": true
    }
  ]
}
```

---

#### 4. Deshabilitar Gatito
```http
POST /api/product/deshabilitar
```

**Body (JSON)**:
```json
{
  "gatitoId": 0,
  "cuenta": "0"
}
```

---

### **💼 Wallet y Administración**

#### 5. Ver Balance del Wallet
```http
GET /api/wallet/balance
```

**Respuesta**:
```json
{
  "success": true,
  "balance": "0.003"
}
```

---

#### 6. Repartir Fondos a Criadores
```http
POST /api/wallet/repartir-fondos
```

**Body (JSON)**:
```json
{
  "cuenta": "0"
}
```

**Nota**: Solo cuentas configuradas como "cuidadores" pueden ejecutar esto.

---

#### 7. Crear Transacción Multisig
```http
POST /api/wallet/crear-transaccion
```

**Body (JSON)**:
```json
{
  "destino": "0xB32A8EBb8a5c0A77feA3f82186E6aaB48A93215B",
  "monto": "0.001",
  "cuenta": "0"
}
```

---

#### 8. Firmar Transacción
```http
POST /api/wallet/firmar
```

**Body (JSON)**:
```json
{
  "txId": 0,
  "cuenta": "1"
}
```

---

#### 9. Ejecutar Transacción
```http
POST /api/wallet/ejecutar
```

**Body (JSON)**:
```json
{
  "txId": 0,
  "cuenta": "0"
}
```

---

#### 10. Ver Transacciones Multisig
```http
GET /api/wallet/transacciones
```

**Respuesta**:
```json
{
  "success": true,
  "transacciones": [
    {
      "id": "0",
      "destino": "0xB32A8EBb8a5c0A77feA3f82186E6aaB48A93215B",
      "monto": "0.001",
      "firmas": "1",
      "ejecutada": false
    }
  ]
}
```

---

## 📝 Scripts Disponibles

### `deploy.js`
Despliega los 3 contratos en la blockchain.

```bash
npx hardhat run scripts/deploy.js --network sepolia
```

**Cuándo usar**: Solo cuando necesites redesplegar contratos.

---

### `repartirFondosWallet.js`
Distribuye fondos acumulados a criadores según porcentajes.

```bash
node scripts/repartirFondosWallet.js
```

**Cuándo usar**: Periódicamente, cuando haya ventas acumuladas.

**Salida**:
```
🚀 Iniciando reparto de fondos desde el Wallet...
📍 Usando cuenta: 0xb17c90BD1BC4fdb4c90b7371CDcEb4D8B1bC68ac
💰 Balance actual del Wallet: 0.003 ETH

👥 Criadores que recibirán pagos:
   1. 0xb17c90BD1BC4fdb4c90b7371CDcEb4D8B1bC68ac - 50.00%
   2. 0xB32A8EBb8a5c0A77feA3f82186E6aaB48A93215B - 50.00%

💸 Pagos realizados:
   1. 0xb17c90BD1BC4fdb4c90b7371CDcEb4D8B1bC68ac recibió 0.0015 ETH
   2. 0xB32A8EBb8a5c0A77feA3f82186E6aaB48A93215B recibió 0.0015 ETH

🎉 ¡Fondos repartidos exitosamente desde el Wallet!
```

---

### `agregarProducto.js` (Opcional)
Agrega un gatito desde terminal para testing.

```bash
node scripts/agregarProducto.js
```

---

### `nfts.js` (Opcional)
Sube imagen a Pinata y mintea NFT directamente.

```bash
node scripts/nfts.js
```

---

## 📮 Uso con Postman

### Importar la Colección

1. Abre Postman
2. Click en **Import**
3. Selecciona el archivo `Gatitos_NFT_API.postman_collection.json`
4. La colección aparecerá en tu sidebar

### Configurar Variables de Entorno (Opcional)

Puedes crear variables en Postman:
- `base_url`: `http://localhost:3000`
- `cuenta_0`: `0`
- `cuenta_1`: `1`

### Orden de Pruebas Recomendado

1. **Ver gatitos disponibles** → `GET /api/product/todos`
2. **Agregar un gatito** → `POST /api/product/agregar`
3. **Verificar que aparece** → `GET /api/product/todos`
4. **Ver balance inicial** → `GET /api/wallet/balance`
5. **Comprar gatito** → `POST /api/product/comprar`
6. **Ver balance actualizado** → `GET /api/wallet/balance`
7. **Repartir fondos** → `POST /api/wallet/repartir-fondos`

---

## 📂 Estructura del Proyecto

```
PROYECTO FINAL - DAPPS/
├── backend/
│   └── artifacts/           # ABIs compilados de contratos
│       └── contracts/
│           ├── GatitoNFT.sol/
│           └── GatitoWallet.sol/
├── contracts/               # Código fuente de contratos
│   ├── GatitoNFT.sol
│   └── GatitoWallet.sol
├── controllers/             # Lógica de negocio
│   ├── gatitoProducto.js   # Marketplace
│   └── gatitoWallet.js     # Multisig y fondos
├── routes/                  # Endpoints API
│   ├── gatitoProducto.js
│   └── gatitoWallet.js
├── utils/                   # Helpers
│   ├── accountManager.js   # Gestión de cuentas
│   └── contractHelper.js   # Interacción con contratos
├── scripts/                 # Scripts de utilidad
│   ├── deploy.js
│   ├── repartirFondosWallet.js
│   ├── agregarProducto.js
│   └── nfts.js
├── frontend/                # Aplicación React
│   └── src/
│       └── App.jsx
├── indexP.js               # Servidor Express principal
├── .env                    # Variables de entorno
├── hardhat.config.js       # Configuración Hardhat
└── package.json
```

---

## 🎓 Cumplimiento de Requisitos del Proyecto

| Requisito | Estado |
|-----------|--------|
| ✅ Utilizar red Ethereum Sepolia | CUMPLE |
| ✅ Crear aplicación con propósito | CUMPLE (Marketplace NFT) |
| ✅ Usar más de un contrato | CUMPLE (GatitoNFT + GatitosPaymentMultisig) |
| ✅ Backend que se comunique con contratos | CUMPLE (Express + ethers.js) |
| ✅ Frontend para interactuar | CUMPLE (React + MetaMask) |
| ✅ Cualquier lenguaje/framework | CUMPLE (Node, React, Solidity) |

---

## 🔐 Seguridad

### Contratos
- ✅ ReentrancyGuard implementado
- ✅ Control de acceso con modificadores
- ✅ OpenZeppelin audited contracts
- ✅ Require statements para validaciones

### Backend
- ⚠️ **IMPORTANTE**: Nunca subas el archivo `.env` a Git
- ⚠️ Las `PRIVATE_KEYS` son solo para desarrollo local
- ⚠️ En producción, usa servicios como AWS Secrets Manager

---

## 📊 Flujo de Compra Completo

```
1. Usuario agrega gatito desde frontend
   ↓
2. Frontend sube imagen a Pinata
   ↓
3. Backend recibe hash IPFS
   ↓
4. Backend llama a GatitoNFT.mintearGatito()
   ↓
5. Backend llama a GatitosPaymentMultisig.agregarGatito()
   ↓
6. Gatito aparece en marketplace
   ↓
7. Usuario B compra gatito
   ↓
8. Fondos se acumulan en GatitosPaymentMultisig
   ↓
9. Owner ejecuta repartirFondos()
   ↓
10. Criadores reciben su porcentaje
```

---

## 🐛 Troubleshooting

### Error: "resolver or addr is not configured for ENS name"
**Causa**: Estás pasando una dirección en vez de un índice de cuenta.

**Solución**: Usa `"cuenta": "0"` en lugar de `"cuenta": "0xAddress..."`

---

### Error: "No hay fondos que repartir"
**Causa**: El contrato no tiene balance.

**Solución**: Primero ejecuta compras de gatitos para acumular fondos.

---

### Error: "No autorizado" al repartir fondos
**Causa**: La cuenta no es cuidador.

**Solución**: Usa la cuenta índice 0 o 1 que están configuradas como cuidadores.

---

### Backend no responde
**Solución**:
```bash
# Verificar si está corriendo
netstat -ano | findstr :3000

# Reiniciar
node indexP.js
```

---

## 📞 Soporte

Para preguntas sobre el proyecto:
- Revisa la documentación de [Ethers.js](https://docs.ethers.org/v5/)
- Consulta [Hardhat Docs](https://hardhat.org/docs)
- Explora [OpenZeppelin Contracts](https://docs.openzeppelin.com/contracts/)

---

## 📜 Licencia

MIT License - Proyecto académico para la materia de DApps

---

**¡Listo para usar! 🚀**

Para comenzar:
1. Configura tu `.env`
2. Inicia el backend: `node indexP.js`
3. Inicia el frontend: `cd frontend && npm run dev`
4. Importa la colección de Postman
5. Empieza a probar las rutas

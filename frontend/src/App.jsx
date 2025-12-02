import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import './App.css';

// Usaremos tu Backend para obtener los datos
const API_BASE_URL = "http://localhost:3000/api";

// Tu dirección de Owner (La convertimos a minúsculas de una vez para comparar fácil)
const OWNER_ADDRESS = "0xb17c90BD1BC4fdb4c90b7371CDcEb4D8B1bC68ac".toLowerCase();

// DIRECCIÓN DE TU CONTRATO WALLET (Recuperada de tu deploy anterior)
const WALLET_ADDRESS = "0xd68Cff7ae20Eb2dF7A61A881E66BE9D084Ceb181";

function App() {
  const [account, setAccount] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  // 1. Cargar Productos del Backend al iniciar
  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/product/all`);
      const data = await response.json();
      if (data.success) {
        setProducts(data.products);
      }
    } catch (error) {
      console.error("Error cargando productos:", error);
    }
  };

  // 2. Conectar Wallet
  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const address = await signer.getAddress();
        setAccount(address);
      } catch (error) {
        console.error("Error conectando wallet:", error);
      }
    } else {
      alert("Instala MetaMask");
    }
  };

  // 3. Comprar Producto
  const buyProduct = async (product) => {
    if (!account) return alert("Conecta tu wallet primero");
    
    try {
        setLoading(true);
        
        // Importamos el ABI
        // Asegúrate de que este archivo exista en src/artifacts/
        const WALLET_ABI = await import('./artifacts/MultiSignPaymentWallet.json');

        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const contract = new ethers.Contract(WALLET_ADDRESS, WALLET_ABI.abi, signer);

        console.log(`Comprando producto ID: ${product.id} por ${product.price} ETH`);

        // Enviamos la transacción
        const tx = await contract.buyProduct(product.id, { 
            value: ethers.parseEther(product.price) 
        });
        
        console.log("Transacción enviada:", tx.hash);
        await tx.wait();
        
        alert("¡Compra exitosa! 😺");
        fetchProducts(); // Recargar la lista para ver el cambio de estado

    } catch (error) {
        console.error("Error en compra:", error);
        // Mostramos el error real si es posible, o uno genérico
        alert("Error en la compra: " + (error.reason || error.message || "Revisa la consola"));
    } finally {
        setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <h1>🐱 Tienda de Gatitos Blockchain</h1>
      
      {!account ? (
        <button onClick={connectWallet} style={{padding: '10px', fontSize: '16px'}}>
            🦊 Conectar Wallet
        </button>
      ) : (
        <p><strong>Cliente:</strong> {account}</p>
      )}

      <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', marginTop: '30px', flexWrap: 'wrap' }}>
        {products.map((p) => (
          <div key={p.id} style={{ border: '1px solid #ddd', borderRadius: '10px', padding: '15px', width: '200px', backgroundColor: '#242424' }}>
            {/* Imagen del gatito */}
            <img src={`https://placekitten.com/200/20${p.id}`} alt={p.name} style={{borderRadius: '5px'}}/>
            
            <h3>{p.name}</h3>
            <p>Precio: {p.price} ETH</p>
            <p>Status: {p.active ? "🟢 Disponible" : "🔴 Vendido"}</p>
            
            {/* LÓGICA CORREGIDA PARA EL BOTÓN */}
            {p.active && account && account.toLowerCase() !== OWNER_ADDRESS && (
                <button 
                    onClick={() => buyProduct(p)}
                    disabled={loading}
                    style={{ background: '#646cff', color: 'white', padding: '8px 16px', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                >
                    {loading ? "Procesando..." : "Comprar"}
                </button>
            )}

            {/* MENSAJE PARA EL DUEÑO */}
            {p.active && account && account.toLowerCase() === OWNER_ADDRESS && (
                <p style={{color: 'orange', fontWeight: 'bold'}}>👑 Eres el dueño</p>
            )}

            {/* MENSAJE SI YA SE VENDIÓ */}
            {!p.active && (
                <p style={{color: 'gray'}}>No disponible</p>
            )}

          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
import { useState, useEffect } from 'react';
import { ethers } from 'ethers'; // Ethers v5
import './App.css';

const API_BASE_URL = "http://localhost:3000/api";

const OWNER_ADDRESS = "0xb17c90BD1BC4fdb4c90b7371CDcEb4D8B1bC68ac".toLowerCase();

const WALLET_ADDRESS = "0xe1F30Da6B24CE7C6e19e317970E1780f852efB76"; 

function App() {
  const [account, setAccount] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Estados para el formulario de Agregar (Solo Owner)
  const [newName, setNewName] = useState("");
  const [newPrice, setNewPrice] = useState("");
  const [newImage, setNewImage] = useState("");

  useEffect(() => {
    fetchProducts();
    checkIfWalletIsConnected();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/product/todos`);
      const data = await response.json();
      if (data.success) {
        // Mapear los campos del backend al formato del frontend
        setProducts(data.gatitos.map(g => ({
          id: g.id,
          name: g.nombre,
          price: g.precioEth, // Ya viene formateado en ETH desde el backend
          image: g.imagen,
          active: g.disponible
        })));
      }
    } catch (error) {
      console.error("Error cargando productos:", error);
    }
  };

  // --- 1. CONEXIÓN SEGURA (Compatible v5) ---
  const checkIfWalletIsConnected = async () => {
    if (window.ethereum) {
      const accounts = await window.ethereum.request({ method: 'eth_accounts' });
      if (accounts.length > 0) {
        setAccount(accounts[0]);
      }
    }
  };

  const connectWallet = async () => {
    if (!window.ethereum) return alert("Instala MetaMask");
    try {
      const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
      setAccount(accounts[0]);
    } catch (error) {
      console.error(error);
    }
  };

  // --- 2. AGREGAR GATITO (SOLO OWNER) ---
  const handleAddProduct = async (e) => {
    e.preventDefault();
    if (!account) return;

    try {
        setLoading(true);
        // OJO: Asegúrate que esta ruta de importación sea correcta:
        const ABI = await import('./artifacts/GatitosPaymentMultisig.json');
        
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const contract = new ethers.Contract(WALLET_ADDRESS, ABI.abi, signer);

        console.log("Enviando transacción");
        
        const tx = await contract.agregarGatito(
            newName, 
            ethers.utils.parseEther(newPrice), 
            newImage
        );
        
        await tx.wait();
        alert("¡Gatito puesto en venta exitosamente!");
        
        setNewName("");
        setNewPrice("");
        setNewImage("");
        fetchProducts();

    } catch (error) {
        console.error(error);
        alert("Error al agregar: " + (error.data?.message || error.message));
    } finally {
        setLoading(false);
    }
  };

  // --- 3. COMPRAR GATITO (CLIENTES) ---
  const buyProduct = async (product) => {
    if (!account) return alert("Conecta tu wallet primero");
    
    try {
        setLoading(true);
        const ABI = await import('./artifacts/GatitosPaymentMultisig.json');
        
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const contract = new ethers.Contract(WALLET_ADDRESS, ABI.abi, signer);

        const tx = await contract.comprarGatito(product.id, { 
            value: ethers.utils.parseEther(product.price) 
        });
        
        await tx.wait();
        alert("¡Compra exitosa! El gatito es tuyo.");
        fetchProducts();

    } catch (error) {
        console.error(error);
        alert("Error en la compra: " + (error.data?.message || error.message));
    } finally {
        setLoading(false);
    }
  };

  // Determinar si el usuario conectado es el dueño
  const isOwner = account && account.toLowerCase() === OWNER_ADDRESS;

  return (
    <div style={{ minHeight: '100vh', padding: '20px', backgroundColor: '#1a1a1a', color: 'white', fontFamily: 'Arial, sans-serif' }}>
      
      {}
      <header style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        justifyContent: 'center', 
        alignItems: 'center', 
        marginBottom: '40px', 
        padding: '0 20px',
        textAlign: 'center' 
      }}>
        <h1 style={{ marginBottom: account ? '10px' : '20px' }}>🐱 Tienda de Gatitos</h1>
        
        {/* INFO DE LA CUENTA O BOTÓN DE CONEXIÓN */}
        {!account ? (
            <button onClick={connectWallet} disabled={loading} style={{ 
              padding: '10px 20px', 
              fontSize: '16px', 
              cursor: 'pointer', 
              background: '#f6851b', 
              border: 'none', 
              borderRadius: '5px', 
              color: 'white',
              marginTop: '10px' // Espacio después del título
            }}>
                Conectar Wallet
            </button>
        ) : (
            <div style={{ textAlign: 'center' }}>
                <p style={{ margin: '5px 0' }}>Conectado: <span style={{ color: '#646cff' }}>{account.slice(0,6)}...{account.slice(-4)}</span></p>
                {isOwner ? 
                    <span style={{ background: 'gold', color: 'black', padding: '2px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold' }}> DUEÑO (VENDEDOR)</span> : 
                    <span style={{ background: '#4CAF50', color: 'white', padding: '2px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold' }}> CLIENTE</span>
                }
            </div>
        )}
      </header>

      {/* --- FORMULARIO PARA EL DUEÑO (AGREGAR/VENDER) --- */}
      {isOwner && (
        <div style={{ maxWidth: '500px', margin: '0 auto 50px auto', padding: '20px', border: '1px solid #444', borderRadius: '10px', backgroundColor: '#2a2a2a' }}>
            <h2 style={{ marginTop: 0, textAlign: 'center', color: 'gold' }}> Vender Nuevo Gatito</h2>
            <form onSubmit={handleAddProduct} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <input 
                    placeholder="Nombre del Gatito" 
                    value={newName} 
                    onChange={e => setNewName(e.target.value)} 
                    style={{ padding: '10px', borderRadius: '5px', border: '1px solid #555', backgroundColor: '#333', color: 'white' }}
                    required 
                />
                <input 
                    placeholder="Precio en ETH (ej: 0.001)" 
                    value={newPrice} 
                    onChange={e => setNewPrice(e.target.value)} 
                    style={{ padding: '10px', borderRadius: '5px', border: '1px solid #555', backgroundColor: '#333', color: 'white' }}
                    required 
                />
                <input 
                    placeholder="URL de la Imagen (Pinata)" 
                    value={newImage} 
                    onChange={e => setNewImage(e.target.value)} 
                    style={{ padding: '10px', borderRadius: '5px', border: '1px solid #555', backgroundColor: '#333', color: 'white' }}
                    required 
                />
                <button type="submit" disabled={loading} style={{ padding: '12px', background: 'gold', color: 'black', border: 'none', borderRadius: '5px', fontWeight: 'bold', cursor: 'pointer' }}>
                    {loading ? "Procesando en Blockchain..." : "Poner en Venta"}
                </button>
            </form>
        </div>
      )}

      {/* --- CATÁLOGO DE PRODUCTOS --- */}
      <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>Galería de Gatitos</h2>
      
      {products.length === 0 && <p style={{textAlign: 'center', color: 'gray'}}>No hay gatitos en venta</p>}

      <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', flexWrap: 'wrap' }}>
        {products.map((p) => (
          <div key={p.id} style={{ border: '1px solid #444', borderRadius: '10px', padding: '15px', width: '250px', backgroundColor: '#242424', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            
            <img 
                src={p.image.startsWith('http') ? p.image : `https://gateway.pinata.cloud/ipfs/${p.image}`} 
                alt={p.name} 
                style={{ width: '100%', height: '200px', objectFit: 'cover', borderRadius: '5px', marginBottom: '10px' }}
                onError={(e) => { e.target.onerror = null; e.target.src = "https://placekitten.com/200/200"; }} // Fallback si falla la imagen
            />
            
            <h3 style={{ margin: '5px 0' }}>{p.name}</h3>
            <p style={{ fontSize: '1.2em', fontWeight: 'bold', color: '#646cff', margin: '5px 0' }}>{p.price} ETH</p>
            
            {/* LÓGICA DE BOTONES */}
            {p.active ? (
                // Si está disponible...
                isOwner ? (
                    <button disabled style={{ marginTop: '10px', padding: '10px', width: '100%', background: '#333', color: 'gold', border: '1px solid gold', borderRadius: '5px', cursor: 'not-allowed' }}>
                        Tu producto (En Venta)
                    </button>
                ) : (
                    <button 
                        onClick={() => buyProduct(p)} 
                        disabled={loading} 
                        style={{ marginTop: '10px', padding: '10px', width: '100%', background: '#646cff', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}
                    >
                        {loading ? "Procesando..." : "Comprar Ahora"}
                    </button>
                )
            ) : (
                // Si NO está disponible (Vendido)
                <button disabled style={{ marginTop: '10px', padding: '10px', width: '100%', background: '#333', color: 'red', border: '1px solid red', borderRadius: '5px', cursor: 'not-allowed' }}>
                    VENDIDO
                </button>
            )}

          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
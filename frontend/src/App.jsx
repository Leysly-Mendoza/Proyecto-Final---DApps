import { useState, useEffect } from 'react';
import { ethers } from 'ethers'; // v5
import './App.css';

const API_BASE_URL = "http://localhost:3000/api";

// TUS DIRECCIONES
const OWNER_ADDRESS = "0xb17c90BD1BC4fdb4c90b7371CDcEb4D8B1bC68ac".toLowerCase();
// ¡ACTUALIZA ESTA DIRECCIÓN AL TERMINAR EL DEPLOY!
const WALLET_ADDRESS = "PEGAR_TU_NUEVA_DIRECCION_WALLET_AQUI"; 

function App() {
  const [account, setAccount] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Formulario
  const [newName, setNewName] = useState("");
  const [newPrice, setNewPrice] = useState("");
  const [newImage, setNewImage] = useState("");

  useEffect(() => { fetchProducts(); }, []);

  const fetchProducts = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/product/all`);
      const data = await res.json();
      if (data.success) setProducts(data.products);
    } catch (e) { console.error(e); }
  };

  const connectWallet = async () => {
    if (window.ethereum) {
      // Ethers v5 provider
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      const signer = provider.getSigner();
      setAccount(await signer.getAddress());
    } else { alert("Instala MetaMask"); }
  };

  // --- AGREGAR (SOLO OWNER) ---
  const handleAddProduct = async (e) => {
    e.preventDefault();
    if (!account) return;
    try {
        setLoading(true);
        // Importamos el JSON correcto
        const ABI = await import('./artifacts/GatitosPaymentMultisig.json');
        
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const contract = new ethers.Contract(WALLET_ADDRESS, ABI.abi, signer);

        // Llamamos a "agregarGatito" (Tu función en Solidity)
        const tx = await contract.agregarGatito(
            newName, 
            ethers.utils.parseEther(newPrice), // v5 utils
            newImage
        );
        
        await tx.wait();
        alert("¡Gatito Agregado!");
        fetchProducts();
        setNewName(""); setNewPrice(""); setNewImage("");
    } catch (error) { 
        console.error(error); 
        alert("Error: " + (error.data?.message || error.message)); 
    } finally { setLoading(false); }
  };

  // --- COMPRAR (CLIENTES) ---
  const buyProduct = async (product) => {
    if (!account) return alert("Conecta Wallet");
    try {
        setLoading(true);
        const ABI = await import('./artifacts/GatitosPaymentMultisig.json');
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const contract = new ethers.Contract(WALLET_ADDRESS, ABI.abi, signer);

        // Llamamos a "comprarGatito" (Tu función en Solidity)
        const tx = await contract.comprarGatito(product.id, { 
            value: ethers.utils.parseEther(product.price) 
        });
        await tx.wait();
        alert("¡Compra exitosa!");
        fetchProducts();
    } catch (error) { 
        console.error(error); 
        alert("Error en compra"); 
    } finally { setLoading(false); }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial', textAlign: 'center' }}>
      <h1>🐱 Gatitos NFT (Ethers v5)</h1>
      
      {!account ? (
        <button onClick={connectWallet} style={{fontSize:'1.2rem', padding:'10px'}}>
            🦊 Conectar MetaMask
        </button>
      ) : (
        <div>
            <p>Conectado: {account.slice(0,6)}...{account.slice(-4)}</p>
            {account.toLowerCase() === OWNER_ADDRESS && 
                <span style={{background:'gold', padding:'5px', borderRadius:'5px', fontWeight:'bold'}}>👑 DUEÑO</span>
            }
        </div>
      )}

      {/* --- FORMULARIO DE DUEÑO --- */}
      {account && account.toLowerCase() === OWNER_ADDRESS && (
        <div style={{margin: '20px auto', padding:'20px', border:'2px solid #646cff', borderRadius:'10px', maxWidth:'400px'}}>
            <h3>Agregar Nuevo Gatito</h3>
            <form onSubmit={handleAddProduct} style={{display:'flex', flexDirection:'column', gap:'10px'}}>
                <input placeholder="Nombre" value={newName} onChange={e=>setNewName(e.target.value)} required />
                <input placeholder="Precio (ETH)" value={newPrice} onChange={e=>setNewPrice(e.target.value)} required />
                <input placeholder="URL Imagen" value={newImage} onChange={e=>setNewImage(e.target.value)} required />
                <button disabled={loading} style={{background:'#646cff', color:'white'}}>
                    {loading ? "Procesando..." : "Publicar"}
                </button>
            </form>
        </div>
      )}

      {/* --- LISTA DE GATITOS --- */}
      <div style={{display:'flex', gap:'20px', justifyContent:'center', marginTop:'30px', flexWrap:'wrap'}}>
        {products.map(p => (
            <div key={p.id} style={{border:'1px solid #ddd', padding:'15px', borderRadius:'10px', width:'220px', background:'#f9f9f9'}}>
                <img src={p.image.startsWith('http') ? p.image : `https://gateway.pinata.cloud/ipfs/${p.image}`} 
                     style={{width:'100%', height:'200px', objectFit:'cover', borderRadius:'5px'}} />
                <h3>{p.name}</h3>
                <p style={{fontWeight:'bold', fontSize:'1.1rem'}}>{p.price} ETH</p>
                
                {p.active ? (
                    account && account.toLowerCase() !== OWNER_ADDRESS ? 
                    <button onClick={()=>buyProduct(p)} disabled={loading} style={{background:'green', color:'white', width:'100%'}}>
                        Comprar
                    </button> 
                    : <p style={{color:'gray', fontSize:'0.9rem'}}>{account ? "(Eres el dueño)" : "Conecta Wallet"}</p>
                ) : (
                    <p style={{color:'red', fontWeight:'bold'}}>🔴 VENDIDO</p>
                )}
            </div>
        ))}
      </div>
    </div>
  );
}

export default App;
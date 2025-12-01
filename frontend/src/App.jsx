import { useState, useEffect } from 'react';
import { ethers } from 'ethers';


import { CONTRACT_ADDRESSES } from './contractsConfig';
import NFT_ABI from './artifacts/NFTClase.json';
import WALLET_ABI from './artifacts/MultiSignPaymentWallet.json';

import './App.css'; 

function App() {
  const [account, setAccount] = useState(null);
  const [isOwner, setIsOwner] = useState(false);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");

  const OWNER_ADDRESS = "0xb17c90BD1BC4fdb4c90b7371CDcEb4D8B1bC68ac".toLowerCase();

  // 1. Conectar Wallet
  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const address = await signer.getAddress();
        
        setAccount(address);
        
        // Verificar si es la dueña
        if (address.toLowerCase() === OWNER_ADDRESS) {
          setIsOwner(true);
        }
      } catch (error) {
        console.error("Error conectando:", error);
      }
    } else {
      alert("¡Necesitas instalar MetaMask!");
    }
  };

  // 2. Crear Gatito 
  const mintKitten = async () => {
    if (!account) return;
    setLoading(true);
    setStatus("Iniciando transacción...");

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      
      // Conectamos con el contrato NFT
      const nftContract = new ethers.Contract(
        CONTRACT_ADDRESSES.NFT, 
        NFT_ABI.abi, 
        signer
      );

      // Llamamos a la función mintNFT de tu contrato
      // Le pasamos tu dirección como recipient y una URL falsa de imagen
      const tx = await nftContract.mintNFT(account, "https://placekitten.com/200/300");
      
      setStatus("Esperando confirmación de Blockchain...");
      await tx.wait(); // Esperamos a que se mine el bloque
      
      setStatus(`¡Gatito creado con éxito! Hash: ${tx.hash}`);
      alert("¡Gatito Minteado!");

    } catch (error) {
      console.error(error);
      setStatus("Error: " + (error.reason || error.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', textAlign: 'center', fontFamily: 'Arial' }}>
      <h1>🐱 CryptoKitties Shop 🐱</h1>
      <p>Proyecto Final - DApps Sepolia</p>

      {!account ? (
        <button 
          onClick={connectWallet}
          style={{ padding: '10px 20px', fontSize: '18px', cursor: 'pointer', background: '#f6851b', color: 'white', border: 'none', borderRadius: '5px' }}
        >
          🦊 Conectar MetaMask
        </button>
      ) : (
        <div>
          <p><strong>Conectado como:</strong> {account.slice(0,6)}...{account.slice(-4)}</p>
          
          {isOwner ? (
            <div style={{ border: '2px solid green', padding: '20px', marginTop: '20px', borderRadius: '10px' }}>
              <h3>👑 Panel de Administrador</h3>
              <p>Eres el dueño del contrato. Puedes crear nuevos gatitos.</p>
              
              <button 
                onClick={mintKitten} 
                disabled={loading}
                style={{ padding: '10px 20px', fontSize: '16px', background: '#4CAF50', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
              >
                {loading ? "Procesando..." : "✨ Crear Nuevo Gatito (Mint)"}
              </button>
              
              <p style={{ marginTop: '10px', color: '#666' }}>{status}</p>
            </div>
          ) : (
            <div style={{ marginTop: '20px' }}>
              <h3>🛍️ Catálogo de Gatitos</h3>
              <p>Bienvenido a la tienda. (Aquí se mostrarían los gatitos disponibles)</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default App;
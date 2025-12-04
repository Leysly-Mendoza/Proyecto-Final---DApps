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
  const [newName, setNewName] = useState("");
  const [newPrice, setNewPrice] = useState("");
  const [newImage, setNewImage] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchProducts();
    checkIfWalletIsConnected();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/product/todos`);
      const data = await response.json();
      if (data.success) {
        setProducts(data.gatitos.map(g => ({
          id: g.id,
          name: g.nombre,
          price: g.precioEth, 
          image: g.imagen,
          active: g.disponible
        })));
      }
    } catch (error) {
      console.error("Error cargando productos:", error);
    }
  };

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

  const uploadToPinata = async (file) => {
    if (!file) return null;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
        method: 'POST',
        headers: {
          'pinata_api_key': '3f25c320f5a03385abc2',
          'pinata_secret_api_key': '9efa27c62cee4abe30910f0c2b245ef281b95fcbcf8ec7456068260bf72b2863'
        },
        body: formData
      });

      const data = await response.json();
      setUploading(false);

      if (data.IpfsHash) {
        return data.IpfsHash; 
      } else {
        throw new Error('Error subiendo a Pinata');
      }
    } catch (error) {
      setUploading(false);
      console.error('Error en Pinata:', error);
      throw error;
    }
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    if (!account) return;
    if (!selectedFile && !newImage) {
      alert("Por favor selecciona una imagen o ingresa una URL");
      return;
    }

    try {
        setLoading(true);
        let ipfsHash = newImage;
        if (selectedFile) {
          console.log("Subiendo imagen a Pinata");
          ipfsHash = await uploadToPinata(selectedFile);
          console.log("Imagen subida a IPFS:", ipfsHash);
        }

        const ABI = await import('./artifacts/GatitosPaymentMultisig.json');
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const contract = new ethers.Contract(WALLET_ADDRESS, ABI.abi, signer);

        console.log("Enviando transacción para agregar gatito");

        const tx = await contract.agregarGatito(
            newName,
            ethers.utils.parseEther(newPrice),
            ipfsHash 
        );

        await tx.wait();
        alert("¡Gatito puesto en venta exitosamente!");

        setNewName("");
        setNewPrice("");
        setNewImage("");
        setSelectedFile(null);
        fetchProducts();

    } catch (error) {
        console.error(error);
        alert("Error al agregar: " + (error.data?.message || error.message));
    } finally {
        setLoading(false);
    }
  };

  const buyProduct = async (product) => {
    if (!account) return alert("Conecta tu wallet primero");

    try {
        setLoading(true);

        console.log("Iniciando compra");

        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const WalletABI = await import('./artifacts/GatitosPaymentMultisig.json');
        const walletContract = new ethers.Contract(WALLET_ADDRESS, WalletABI.abi, signer);
        const priceWei = ethers.utils.parseEther(product.price);

        console.log("Comprando gatito");
        const tx = await walletContract.comprarGatito(product.id, {
            value: priceWei
        });
        await tx.wait();
        console.log("Compra completada");
        console.log("El owner puede repartir fondos cuando quiera");

        alert("¡Compra exitosa! \n\nGatito comprado\nNFT ya fue minteado\n\nEl gatito es tuyo.");
        fetchProducts();

    } catch (error) {
        console.error(error);
        alert("Error en la compra: " + (error.data?.message || error.message));
    } finally {
        setLoading(false);
    }
  };

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
        {!account ? (
            <button onClick={connectWallet} disabled={loading} style={{ 
              padding: '10px 20px', 
              fontSize: '16px', 
              cursor: 'pointer', 
              background: '#f6851b', 
              border: 'none', 
              borderRadius: '5px', 
              color: 'white',
              marginTop: '10px' 
            }}>
                Conectar a MetaMask
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

      {isOwner && (
        <div style={{ maxWidth: '500px', margin: '0 auto 50px auto', padding: '20px', border: '1px solid #444', borderRadius: '10px', backgroundColor: '#2a2a2a' }}>
            <h2 style={{ marginTop: 0, textAlign: 'center', color: 'gold' }}>Vender Nuevo Gatito (Con NFT)</h2>
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

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <label style={{ color: '#aaa', fontSize: '14px' }}>Selecciona una imagen:</label>
                    <input
                        type="file"
                        accept="image/*"
                        onChange={e => setSelectedFile(e.target.files[0])}
                        style={{ padding: '10px', borderRadius: '5px', border: '1px solid #555', backgroundColor: '#333', color: 'white' }}
                    />
                    {selectedFile && (
                        <p style={{ color: '#4CAF50', fontSize: '12px', margin: 0 }}>
                            Archivo seleccionado: {selectedFile.name}
                        </p>
                    )}
                </div>

                <div style={{ textAlign: 'center', color: '#888', fontSize: '12px' }}>- O -</div>

                <input
                    placeholder="URL de IPFS (opcional si subes archivo)"
                    value={newImage}
                    onChange={e => setNewImage(e.target.value)}
                    style={{ padding: '10px', borderRadius: '5px', border: '1px solid #555', backgroundColor: '#333', color: 'white' }}
                />

                <button type="submit" disabled={loading || uploading} style={{ padding: '12px', background: (loading || uploading) ? '#666' : 'gold', color: 'black', border: 'none', borderRadius: '5px', fontWeight: 'bold', cursor: (loading || uploading) ? 'not-allowed' : 'pointer' }}>
                    {uploading ? "Subiendo a IPFS" : loading ? "Procesando en Blockchain" : "Poner en Venta"}
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
                onError={(e) => { e.target.onerror = null; e.target.src = "https://placekitten.com/200/200"; }} 
            />
            
            <h3 style={{ margin: '5px 0' }}>{p.name}</h3>
            <p style={{ fontSize: '1.2em', fontWeight: 'bold', color: '#646cff', margin: '5px 0' }}>{p.price} ETH</p>
            
            {/* LÓGICA DE BOTONES */}
            {p.active ? (
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
                        {loading ? "Procesando" : "Comprar Ahora"}
                    </button>
                )
            ) : (
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
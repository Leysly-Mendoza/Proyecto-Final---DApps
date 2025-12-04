// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract GatitosPaymentMultisig {

    address[] public cuidadores;  
    mapping(address => bool) public esCuidador;
    uint public firmasRequeridas;

    address[] public criadores;
    mapping(address => uint256) public porcentajeGatitos;
    uint256 public totalPorcentajes;
    struct TransaccionGatito {
        uint id;
        address destino;
        uint monto;
        uint firmas;
        bool ejecutada;
    }

    TransaccionGatito[] public transacciones;
    uint public nextTxId;
    mapping(uint => mapping(address => bool)) public firmo;

    struct FirmaInfo {
        address firmante;
        uint timestamp;
    }
    mapping(uint => FirmaInfo[]) public historialFirmas;
    struct Gatito {
        uint id;
        string nombre;
        uint precio;
        string imagen; 
        address criador;
        bool disponible;
    }

    uint public nextGatitoId;
    mapping(uint => Gatito) public gatitos;
    mapping(address => uint[]) public misGatitosComprados;
    uint256 private _estado;
    modifier nonReentrant() {
        require(_estado != 2, "Reentrancy detectado");
        _estado = 2;
        _;
        _estado = 1;
    }

    event GatitoAgregado(uint id, string nombre, uint precio, string imagen, address criador);
    event GatitoComprado(uint id, address comprador, uint precio);
    event Deposito(address remitente, uint cantidad);
    event PagoLiberado(address criador, uint cantidad);

    event TxCreada(uint id, address destino, uint monto);
    event TxFirmada(uint id, address firmante);
    event TxEjecutada(uint id, address destino, uint monto);

    modifier soloCuidador() {
        require(esCuidador[msg.sender], "No autorizado");
        _;
    }
    constructor(
        address[] memory _cuidadores,
        uint _firmasRequeridas,
        address[] memory _criadores,
        uint256[] memory _porcentajes
    ) {
        _estado = 1;

        require(_cuidadores.length > 0, "Debe haber cuidadores");
        require(_firmasRequeridas > 0 && _firmasRequeridas <= _cuidadores.length);

        for(uint i=0;i<_cuidadores.length;i++){
            require(!esCuidador[_cuidadores[i]], "Duplicado");
            esCuidador[_cuidadores[i]] = true;
            cuidadores.push(_cuidadores[i]);
        }

        firmasRequeridas = _firmasRequeridas;

        require(_criadores.length == _porcentajes.length, "Listas no coinciden");

        for (uint i = 0; i < _criadores.length; i++) {
            criadores.push(_criadores[i]);
            porcentajeGatitos[_criadores[i]] = _porcentajes[i];
            totalPorcentajes += _porcentajes[i];
        }
    }

    function agregarGatito(string memory _nombre, uint _precio, string memory _imagen)
        external soloCuidador
    {
        require(_precio > 0, "Precio invalido");

        uint id = nextGatitoId++;

        gatitos[id] = Gatito({
            id: id,
            nombre: _nombre,
            precio: _precio,
            imagen: _imagen,
            criador: msg.sender,
            disponible: true
        });

        emit GatitoAgregado(id, _nombre, _precio, _imagen, msg.sender);
    }

    function comprarGatito(uint _gatitoId) external payable nonReentrant {
        Gatito storage g = gatitos[_gatitoId];

        require(g.disponible, "Gatito no disponible");
        require(msg.value == g.precio, "Monto incorrecto");

        g.disponible = false;

        emit GatitoComprado(_gatitoId, msg.sender, g.precio);
        emit Deposito(msg.sender, msg.value);

        misGatitosComprados[msg.sender].push(_gatitoId);
    }

    function obtenerGatitos() external view returns (Gatito[] memory) {
        Gatito[] memory arr = new Gatito[](nextGatitoId);
        for (uint i = 0; i < nextGatitoId; i++) {
            arr[i] = gatitos[i];
        }
        return arr;
    }

    function crearTransaccion(address _destino, uint _monto) external soloCuidador {
        require(_destino != address(0));
        require(_monto > 0);

        uint id = nextTxId++;

        transacciones.push(
            TransaccionGatito({
                id: id,
                destino: _destino,
                monto: _monto,
                firmas: 0,
                ejecutada: false
            })
        );

        emit TxCreada(id, _destino, _monto);
    }

    function firmarTransaccion(uint _txId) external soloCuidador {
        TransaccionGatito storage tx = transacciones[_txId];

        require(!firmo[_txId][msg.sender], "Ya firmaste");
        require(!tx.ejecutada, "Ya hecha");

        firmo[_txId][msg.sender] = true;
        tx.firmas++;

        historialFirmas[_txId].push(FirmaInfo(msg.sender, block.timestamp));

        emit TxFirmada(_txId, msg.sender);
    }

    function ejecutarTransaccion(uint _txId) external soloCuidador nonReentrant {
        TransaccionGatito storage tx = transacciones[_txId];

        require(!tx.ejecutada, "Ya ejecutada");
        require(tx.firmas >= firmasRequeridas, "Firmas insuficientes");

        tx.ejecutada = true;

        (bool ok, ) = payable(tx.destino).call{value: tx.monto}("");
        require(ok, "Transferencia fallo");

        emit TxEjecutada(_txId, tx.destino, tx.monto);
    }

    function repartirFondos() external soloCuidador nonReentrant {
        uint256 balance = address(this).balance;
        require(balance > 0, "No hay fondos");

        for (uint i = 0; i < criadores.length; i++) {
            address c = criadores[i];
            uint256 pago = (balance * porcentajeGatitos[c]) / totalPorcentajes;

            if (pago > 0) {
                (bool ok, ) = c.call{value: pago}("");
                require(ok, "Pago fallo");
                emit PagoLiberado(c, pago);
            }
        }
    }

    function verBalance() external view returns (uint256) {
        return address(this).balance;
    }

    function deshabilitarGatito(uint _gatitoId) external soloCuidador {
    Gatito storage g = gatitos[_gatitoId];
    require(g.disponible, "Ya esta deshabilitado");
    g.disponible = false;
}
}

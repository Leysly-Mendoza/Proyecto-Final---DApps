// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract MultiSignPaymentWallet {
    
    // --- VARIABLES PARA MULTI-FIRMA (SEGURIDAD) ---
    address[] public owners;
    uint public requireApprovals;
    mapping(address => bool) public isOwner;
    
    // --- VARIABLES PARA PAGOS (NÓMINA) ---
    address[] public payees;
    mapping(address => uint) public shares;
    uint256 public totalShares;

    // --- VARIABLES PARA TRANSACCIONES ---
    uint public nextTransactionId;
    struct Transaction {
        uint id;
        address to;
        uint amount;
        uint approvalCount;
        bool executed;
    }
    Transaction[] public transactions;
    mapping(uint => mapping(address => bool)) public approvals;

    // Estructuras para historial de aprobaciones
    struct ApprovalInfo {
        address approver;
        uint256 timestamp;
    }
    mapping(uint256 => ApprovalInfo[]) public transactionApprovals;

    // --- VARIABLES DE LA TIENDA (PRODUCTOS) ---
    struct Product {
        uint id;
        string name;
        uint price;
        string image;   // <--- NUEVO: URL de la imagen (Pinata/IPFS)
        address seller;
        bool active;    // true = Disponible, false = Vendido
    }
    uint public nextProductId;
    mapping(uint => Product) public products;
    mapping(address => uint[]) public purchases;

    // --- SEGURIDAD (REENTRANCY GUARD MANUAL) ---
    uint256 private _status;
    modifier nonReentrant() {
        require(_status != 2, "Reentrancy Guard: Reentrant call");
        _status = 2;
        _;
        _status = 1;
    }

    // --- EVENTOS ---
    event Deposit(address indexed sender, uint amount);
    event TransactionSubmitted(uint indexed txId, address indexed to, uint amount);
    event TransactionApproved(uint indexed txId, address owner);
    event TransactionExecuted(uint indexed txId, address indexed to, uint amount);
    event PaymentReleased(address indexed payee, uint amount);
    
    // Evento actualizado con imagen
    event ProductAdded(uint id, string name, uint price, string image, address seller);
    event ProductPurchased(uint id, address buyer, uint price);

    modifier onlyOwner() {
        require(isOwner[msg.sender], "Not an owner");
        _;
    }

    // --- CONSTRUCTOR ---
    constructor(
        address[] memory _owners,
        uint _requireApprovals,
        address[] memory _payees,
        uint256[] memory _shares
    ) {
        _status = 1;
        require(_owners.length > 0, "Must have owners");
        require(_requireApprovals > 0 && _requireApprovals <= _owners.length, "Invalid Approvals");

        for (uint i = 0; i < _owners.length; i++) {
            address owner = _owners[i];
            require(owner != address(0), "Invalid Address");
            require(!isOwner[owner], "Owner not unique");
            isOwner[owner] = true;
            owners.push(owner);
        }

        requireApprovals = _requireApprovals;

        // Configuración de Pagos
        require(_payees.length == _shares.length, "Length mismatch");
        require(_payees.length > 0, "No payees");

        for (uint i = 0; i < _payees.length; i++) {
            require(_payees[i] != address(0), "Invalid address");
            require(_shares[i] > 0, "Shares must be > 0");
            payees.push(_payees[i]);
            shares[_payees[i]] = _shares[i];
            totalShares += _shares[i];
        }
    }

    // --- FUNCIONES DE TIENDA (SHOP) ---

    // 1. Agregar Producto (Ahora pide IMAGEN)
    function addProduct(string memory _name, uint _price, string memory _image) external onlyOwner {
        require(_price > 0, "El precio debe ser mayor a 0");
        uint productId = nextProductId++;
        
        products[productId] = Product({
            id: productId,
            name: _name,
            price: _price,
            image: _image,  // Guardamos la URL
            seller: msg.sender,
            active: true
        });
        
        emit ProductAdded(productId, _name, _price, _image, msg.sender);
    }

    // 2. Comprar Producto (Ahora marca como VENDIDO)
    function buyProduct(uint _productId) external payable nonReentrant {
        Product storage product = products[_productId];
        
        require(product.active, "Producto ya vendido o no disponible");
        require(msg.value == product.price, "Monto incorrecto enviado");

        // CAMBIO CRÍTICO: Marcamos el producto como NO disponible
        product.active = false; 

        // El dinero se queda en el contrato (Wallet) para ser distribuido después
        emit Deposit(msg.sender, msg.value);

        purchases[msg.sender].push(_productId);
        emit ProductPurchased(_productId, msg.sender, product.price);
    }

    function disableProduct(uint _productId) external onlyOwner {
        products[_productId].active = false;
    }

    function getAllProducts() external view returns (Product[] memory) {
        Product[] memory all = new Product[](nextProductId);
        for (uint i = 0; i < nextProductId; i++) {
            all[i] = products[i];
        }
        return all;
    }

    // --- FUNCIONES DE WALLET (MULTI-SIG Y PAGOS) ---

    function deposit() public payable {
        require(msg.value > 0, "Debes mandar ether");
        emit Deposit(msg.sender, msg.value);
    }

    function SubmitTransaction(address _to, uint amount) external onlyOwner {
        require(_to != address(0), "Invalid address");
        require(amount > 0, "Invalid Amount");
        uint txtId = nextTransactionId++;

        transactions.push(
            Transaction({
                id: txtId,
                to: _to,
                amount: amount,
                approvalCount: 0,
                executed: false
            })
        );

        emit TransactionSubmitted(transactions.length - 1, _to, amount);
    }

    function approveTransaction(uint txId) external onlyOwner {
        Transaction storage transaction = transactions[txId];
        require(!transaction.executed, "Already executed");
        require(!approvals[txId][msg.sender], "Already approved");

        approvals[txId][msg.sender] = true;
        transaction.approvalCount++;

        transactionApprovals[txId].push(
            ApprovalInfo({
                approver: msg.sender,
                timestamp: block.timestamp
            })
        );

        emit TransactionApproved(txId, msg.sender);
    }

    function executeTransaction(uint txId) external onlyOwner nonReentrant {
        Transaction storage transaction = transactions[txId];
        require(transaction.approvalCount >= requireApprovals, "Not enough approvals");
        require(!transaction.executed, "Already executed");

        transaction.executed = true;

        (bool success, ) = payable(transaction.to).call{value: transaction.amount}("");
        require(success, "Transaction failed");

        emit TransactionExecuted(txId, transaction.to, transaction.amount);
    }

    function releasePayments() external onlyOwner nonReentrant {
        uint balance = address(this).balance;
        require(balance > 0, "No hay fondos para repartir");

        for (uint256 i = 0; i < payees.length; i++) {
            address payee = payees[i];
            uint256 payment = (balance * shares[payee]) / totalShares;

            if (payment > 0) {
                (bool success, ) = payee.call{value: payment}("");
                require(success, "fallo del pago");
                emit PaymentReleased(payee, payment);
            }
        }
    }

    function getTransactions() external view returns (Transaction[] memory) {
        return transactions;
    }

    function getBalance() external view returns (uint256) {
        return address(this).balance;
    }

    function getApprovals(uint256 txId) external view returns (uint256 txID, uint256 totalApprovals, ApprovalInfo[] memory approvalsList) {
        Transaction storage transaction = transactions[txId];
        ApprovalInfo[] memory infos = transactionApprovals[txId];
        return (txId, transaction.approvalCount, infos);
    }
}
// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

contract PagosGatitos {

    address public owner;

    address[] public criadores;
    mapping(address => uint256) public porcentajeGatitos;
    uint256 public totalPorcentajes;

    event PagoRecibido(address comprador, uint256 cantidad);
    event PagoRepartido(address criador, uint256 cantidad);
    event ResiduoGuardado(uint256 residuo);

    modifier onlyOwner() {
        require(msg.sender == owner, "Solo el owner puede ejecutar esto");
        _;
    }

    constructor(address[] memory _criadores, uint256[] memory _porcentajes) {
        require(_criadores.length == _porcentajes.length, "Listas no coinciden");
        require(_criadores.length > 0, "Debe haber al menos un criador");

        owner = msg.sender;

        for (uint256 i = 0; i < _criadores.length; i++) {
            require(_criadores[i] != address(0), "Direccion invalida");
            require(_porcentajes[i] > 0, "Porcentaje debe ser mayor a 0");

            criadores.push(_criadores[i]);
            porcentajeGatitos[_criadores[i]] = _porcentajes[i];
            totalPorcentajes += _porcentajes[i];
        }
    }

    function pagarGatito() public payable {
        require(msg.value > 0, "Debes enviar Ether");
        emit PagoRecibido(msg.sender, msg.value);
    }

    function verBalance() external view returns (uint256) {
        return address(this).balance;
    }

    function repartirPagos() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No hay saldo disponible");

        uint256 totalPagado;

        for (uint256 i = 0; i < criadores.length; i++) {
            address criador = criadores[i];

            uint256 pago = (balance * porcentajeGatitos[criador]) / totalPorcentajes;
            totalPagado += pago;

            (bool exito, ) = criador.call{value: pago}("");
            require(exito, "No se pudo enviar el pago");

            emit PagoRepartido(criador, pago);
        }

        // Sobra de redondeos (si existe)
        uint256 residuo = balance - totalPagado;

        if (residuo > 0) {
            emit ResiduoGuardado(residuo);
        }
    }
}
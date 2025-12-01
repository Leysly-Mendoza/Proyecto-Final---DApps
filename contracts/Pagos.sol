// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

contract Pagos{
    address []public payees;
    mapping(address=>uint)public shares;
    uint256 public totalShares;

    event Deposit(address indexed sender, uint amountt);

    constructor(address[] memory _payees, uint256[] memory _shares){
        require(_payees.length==_shares.length, "Length mistach");
        require(_payees.length>0,"No payees");
        for(uint i=0;i<_payees.length;i++){
            require(_payees[i]!=address(0), "Invalid address");
            require(_shares[i]>0, "Shares must be>0");
            payees.push(_payees[i]);
            shares[_payees[i]] =_shares[i];
            totalShares+=_shares[i];

        }
    }
    function deposit()public payable{ //genera movimiento monetario - Payable
    require(msg.value>0,"Debes mandar ether");
    emit Deposit(msg.sender,msg.value);
    }
    function getBalance()external view returns (uint256){
        return address(this).balance;
    }
    function release() external{
        uint balance =address(this).balance;
        require(balance>0, "No hay balance");
        for(uint256 i=0; i <payees.length ;i++){
            address payee=payees[i];
            uint256 payment =(balance * shares[payee])/totalShares;
            (bool success,) =payee.call{value:payment}("");
            require(success, "fallo del pago");
        }
    }
}
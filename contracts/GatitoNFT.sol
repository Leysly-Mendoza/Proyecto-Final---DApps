// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract GatitoNFT is ERC721, Ownable {

    using Counters for Counters.Counter;
    Counters.Counter private _contadorGatitos; 

    using Strings for uint256;
    mapping(uint256 => string) private gatitoURI;

    string private baseMetadataURI; 

    constructor() ERC721("GatitosBlockchain", "GATO") {}

    function setBaseURI(string memory baseUri) external onlyOwner {
        baseMetadataURI = baseUri;
    }

    function _setGatitoUri(uint256 tokenId, string memory _tokenURI) internal virtual {
        require(_exists(tokenId), "GatoNFT: No existe ese token");
        gatitoURI[tokenId] = _tokenURI;
    }

    function tokenURI(uint256 tokenId) public view virtual override returns (string memory) {
        require(_exists(tokenId), "GatoNFT: No existe ese token");
        string memory _tokenURI = gatitoURI[tokenId];
        string memory base = baseMetadataURI;

        if (bytes(base).length == 0) {
            return _tokenURI;
        }

        if (bytes(_tokenURI).length > 0) {
            return string(abi.encodePacked(base, _tokenURI));
        }

        return string(abi.encodePacked(base, tokenId.toString()));
    }

    function mintearGatito(address dueno, string memory _tokenURI) 
        public onlyOwner 
        returns (uint256) 
    {
        _contadorGatitos.increment();
        uint256 nuevoGatitoId = _contadorGatitos.current();
        _mint(dueno, nuevoGatitoId);
        _setGatitoUri(nuevoGatitoId, _tokenURI);
        return nuevoGatitoId;
    }
}
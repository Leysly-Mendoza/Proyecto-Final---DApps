// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title GatitoNFT
 * @dev Contrato ERC721 para mintear gatitos virtuales.
 * Cada gatito tiene una imagen/tokenURI almacenado en IPFS.
 */
contract GatitoNFT is ERC721, Ownable {

    using Counters for Counters.Counter;
    Counters.Counter private _contadorGatitos; // ID incremental para cada gatito

    using Strings for uint256;
    mapping(uint256 => string) private gatitoURI; // Guarda metadata individual

    string private baseMetadataURI; // base URI de IPFS (opcional)

    constructor() ERC721("GatitosBlockchain", "GATO") {}

    /**
     * @notice Define un base URI para todas las metadata de gatitos
     */
    function setBaseURI(string memory baseUri) external onlyOwner {
        baseMetadataURI = baseUri;
    }

    /**
     * @notice Asigna metadata específica (tokenURI) para un ID de gatito
     */
    function _setGatitoUri(uint256 tokenId, string memory _tokenURI) internal virtual {
        require(_exists(tokenId), "GatoNFT: No existe ese token");
        gatitoURI[tokenId] = _tokenURI;
    }

    /**
     * @dev Devuelve la metadata completa del gatito (IPFS URL)
     */
    function tokenURI(uint256 tokenId) public view virtual override returns (string memory) {
        require(_exists(tokenId), "GatoNFT: No existe ese token");

        string memory _tokenURI = gatitoURI[tokenId];
        string memory base = baseMetadataURI;

        // Si no hay base URI, regresa el tokenURI directo
        if (bytes(base).length == 0) {
            return _tokenURI;
        }

        // Si hay baseURI + tokenURI, combínalos
        if (bytes(_tokenURI).length > 0) {
            return string(abi.encodePacked(base, _tokenURI));
        }

        // Por si el token no tiene un URI único
        return string(abi.encodePacked(base, tokenId.toString()));
    }

    /**
     * @notice Mintea un nuevo Gatito NFT a un dueño
     * @param dueno dirección que recibirá el NFT
     * @param _tokenURI metadata del gatito (IPFS)
     */
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
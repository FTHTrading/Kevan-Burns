// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

interface IERC5192 {
    /// @notice Emitted when a soulbound token is locked.
    event Locked(uint256 tokenId);

    /// @notice Emitted when a soulbound token is unlocked.
    event Unlocked(uint256 tokenId);

    /// @notice Returns the locking status of an Individual Token.
    /// @dev Reverts if the token does not exist.
    /// @param tokenId The identifier for an NFT.
    function locked(uint256 tokenId) external view returns (bool);
}

/**
 * @title LegacySoulboundRoute
 * @notice EVM-based Soulbound NFT representing cross-chain root domain authorities (.legacy, .troptions).
 * Conforms to ERC-5192 for standard compliance and interoperability.
 */
contract LegacySoulboundRoute is ERC721URIStorage, Ownable, IERC5192 {
    
    struct RouteDetails {
        string label;             // e.g. "legacy" or "troptions"
        string ipfsMetadataCID;   // IPFS CID containing metadata
        uint256 registeredAt;     // Timestamp of registration
        string stellarTarget;     // Target mirror wallet address on Stellar
        string solanaTarget;      // Target mirror wallet address on Solana
    }

    uint256 private _nextTokenId;
    
    // keccak256(label) -> tokenId mapping to prevent duplicates
    mapping(bytes32 => uint256) private _routeIds;
    
    // tokenId -> RouteDetails mapping
    mapping(uint256 => RouteDetails) private _routes;

    constructor() ERC721("Legacy Soulbound Route", "LSR") Ownable(msg.sender) {}

    /**
     * @notice Mint a new soulbound route representing a domain root suffix.
     * @param to The address receiving the certification.
     * @param label The label of the route (e.g. "legacy").
     * @param tokenURI The URI pointing to the token metadata.
     * @param ipfsMetadataCID IPFS CID of metadata for cross-chain proof.
     * @param stellarTarget The Stellar public key associated with the route.
     * @param solanaTarget The Solana public key associated with the route.
     */
    function mintRoute(
        address to,
        string calldata label,
        string calldata tokenURI,
        string calldata ipfsMetadataCID,
        string calldata stellarTarget,
        string calldata solanaTarget
    ) external onlyOwner returns (uint256) {
        bytes32 labelHash = keccak256(abi.encodePacked(label));
        require(_routeIds[labelHash] == 0, "LSR: Route already registered");

        uint256 tokenId = ++_nextTokenId;
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, tokenURI);

        _routeIds[labelHash] = tokenId;
        _routes[tokenId] = RouteDetails({
            label: label,
            ipfsMetadataCID: ipfsMetadataCID,
            registeredAt: block.timestamp,
            stellarTarget: stellarTarget,
            solanaTarget: solanaTarget
        });

        emit Locked(tokenId);
        return tokenId;
    }

    /**
     * @notice Look up a route's details and ID using its name/label.
     */
    function getRouteByLabel(string calldata label) external view returns (uint256, RouteDetails memory) {
        bytes32 labelHash = keccak256(abi.encodePacked(label));
        uint256 tokenId = _routeIds[labelHash];
        require(tokenId != 0, "LSR: Route not found");
        return (tokenId, _routes[tokenId]);
    }

    /**
     * @notice Get details for a specific route tokenId.
     */
    function getRouteDetails(uint256 tokenId) external view returns (RouteDetails memory) {
        _requireOwned(tokenId);
        return _routes[tokenId];
    }

    /**
     * @notice Returns lock status of the token. Soulbound routes are permanently locked.
     */
    function locked(uint256 tokenId) external view override returns (bool) {
        _requireOwned(tokenId);
        return true;
    }

    /**
     * @notice Hook to enforce non-transferability.
     */
    function _update(
        address to,
        uint256 tokenId,
        address auth
    ) internal override returns (address) {
        address from = _ownerOf(tokenId);
        if (from != address(0) && to != address(0)) {
            revert("LSR: token is soulbound and non-transferable");
        }
        return super._update(to, tokenId, auth);
    }
}

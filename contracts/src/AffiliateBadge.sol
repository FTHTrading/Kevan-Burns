// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title AffiliateBadge
 * @notice Soulbound (non-transferable) NFT badge representing verified affiliate status
 * for FlashRouter and Legacy Vault. Used for Lit Protocol token-gating.
 */
contract AffiliateBadge is ERC721, Ownable {
    uint256 private _nextTokenId;
    mapping(address => bool) public hasBadge;

    event BadgeMinted(address indexed recipient, uint256 indexed tokenId, uint256 timestamp);

    constructor() ERC721("FlashRouter Affiliate Badge", "FRAB") Ownable(msg.sender) {}

    /**
     * @notice Mint a Soulbound Affiliate Badge. Only owner/operator can mint.
     */
    function mint(address to) external onlyOwner {
        require(!hasBadge[to], "AB: already has badge");
        uint256 tokenId = _nextTokenId++;
        _safeMint(to, tokenId);
        hasBadge[to] = true;
        emit BadgeMinted(to, tokenId, block.timestamp);
    }

    /**
     * @notice Enforce Soulbound behavior by blocking all transfers except mint and burn.
     */
    function _update(
        address to,
        uint256 tokenId,
        address auth
    ) internal override returns (address) {
        address from = super._update(to, tokenId, auth);
        require(from == address(0) || to == address(0), "AB: Soulbound token is non-transferable");
        return from;
    }
}

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title LegacyAccessControl
 * @notice On-chain access grant registry for post-release vault access.
 *
 * After a vault release is authorised, scoped decryption key grants are
 * issued to beneficiaries, executors, and attorneys. This contract records
 * those grants immutably on-chain so that any party can verify their access
 * entitlement without trusting a centralised server.
 *
 * Grants are scoped — beneficiaries receive only their allocated items.
 * No plaintext, documents, keys, or account numbers are ever stored here.
 */
contract LegacyAccessControl {

    // ─────────────────────────────────────────────
    //  Enums & Structs
    // ─────────────────────────────────────────────

    enum AccessScope {
        FULL,
        ASSET_INVENTORY,
        LEGAL_DOCS,
        ASSIGNED_ITEMS_ONLY,
        HASHES_ONLY
    }

    struct AccessGrant {
        uint256     id;
        string      vaultId;
        string      granteeId;    // application user ID
        string      granteeDID;   // W3C DID
        AccessScope scope;
        bytes32     itemsHash;    // keccak256 of JSON array of item IDs (for ASSIGNED_ITEMS_ONLY)
        address     grantedBy;
        uint256     grantedAt;
        uint256     expiresAt;    // 0 = no expiry
        bool        revoked;
        uint256     revokedAt;
    }

    // ─────────────────────────────────────────────
    //  Storage
    // ─────────────────────────────────────────────

    address public owner;
    mapping(address => bool) public operators;

    uint256 public totalGrants;

    /// grant ID → AccessGrant
    mapping(uint256 => AccessGrant) private _grants;

    /// vaultId hash → grant IDs
    mapping(bytes32 => uint256[]) private _vaultGrants;

    /// granteeId hash → grant IDs
    mapping(bytes32 => uint256[]) private _granteeGrants;

    // ─────────────────────────────────────────────
    //  Events
    // ─────────────────────────────────────────────

    event AccessGranted(
        uint256     indexed id,
        string      indexed vaultId,
        string              granteeId,
        string              granteeDID,
        AccessScope         scope,
        uint256             grantedAt
    );

    event AccessRevoked(
        uint256 indexed id,
        string  indexed vaultId,
        string          granteeId,
        address         revokedBy,
        uint256         revokedAt
    );

    // ─────────────────────────────────────────────
    //  Modifiers
    // ─────────────────────────────────────────────

    modifier onlyOwner() {
        require(msg.sender == owner, "LAC: not owner");
        _;
    }

    modifier onlyOperator() {
        require(operators[msg.sender] || msg.sender == owner, "LAC: not operator");
        _;
    }

    // ─────────────────────────────────────────────
    //  Constructor
    // ─────────────────────────────────────────────

    constructor() {
        owner = msg.sender;
        operators[msg.sender] = true;
    }

    // ─────────────────────────────────────────────
    //  Admin
    // ─────────────────────────────────────────────

    function addOperator(address op) external onlyOwner {
        operators[op] = true;
    }

    function removeOperator(address op) external onlyOwner {
        operators[op] = false;
    }

    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0));
        owner = newOwner;
    }

    // ─────────────────────────────────────────────
    //  Grant Operations
    // ─────────────────────────────────────────────

    /**
     * @notice Issue an access grant to a beneficiary or executor post-release.
     * @param vaultId     Vault being accessed
     * @param granteeId   Application user ID of grantee
     * @param granteeDID  W3C DID of grantee
     * @param scope       Access scope
     * @param itemsHash   keccak256 of item IDs array (for ASSIGNED_ITEMS_ONLY, else bytes32(0))
     * @param expiresAt   Unix timestamp expiry, 0 for no expiry
     * @return grantId    ID of the newly created grant
     */
    function issueGrant(
        string      calldata vaultId,
        string      calldata granteeId,
        string      calldata granteeDID,
        AccessScope          scope,
        bytes32              itemsHash,
        uint256              expiresAt
    ) external onlyOperator returns (uint256 grantId) {
        grantId = totalGrants;

        _grants[grantId] = AccessGrant({
            id:         grantId,
            vaultId:    vaultId,
            granteeId:  granteeId,
            granteeDID: granteeDID,
            scope:      scope,
            itemsHash:  itemsHash,
            grantedBy:  msg.sender,
            grantedAt:  block.timestamp,
            expiresAt:  expiresAt,
            revoked:    false,
            revokedAt:  0
        });

        bytes32 vk = keccak256(abi.encodePacked(vaultId));
        bytes32 gk = keccak256(abi.encodePacked(granteeId));

        _vaultGrants[vk].push(grantId);
        _granteeGrants[gk].push(grantId);

        totalGrants++;

        emit AccessGranted(grantId, vaultId, granteeId, granteeDID, scope, block.timestamp);
        return grantId;
    }

    /**
     * @notice Revoke an access grant.
     */
    function revokeGrant(uint256 grantId) external onlyOperator {
        AccessGrant storage g = _grants[grantId];
        require(grantId < totalGrants, "LAC: grant not found");
        require(!g.revoked, "LAC: already revoked");

        g.revoked   = true;
        g.revokedAt = block.timestamp;

        emit AccessRevoked(grantId, g.vaultId, g.granteeId, msg.sender, block.timestamp);
    }

    // ─────────────────────────────────────────────
    //  Read Operations
    // ─────────────────────────────────────────────

    function getGrant(uint256 grantId)
        external view returns (AccessGrant memory)
    {
        require(grantId < totalGrants, "LAC: grant not found");
        return _grants[grantId];
    }

    function getVaultGrants(string calldata vaultId)
        external view returns (uint256[] memory)
    {
        return _vaultGrants[keccak256(abi.encodePacked(vaultId))];
    }

    function getGranteeGrants(string calldata granteeId)
        external view returns (uint256[] memory)
    {
        return _granteeGrants[keccak256(abi.encodePacked(granteeId))];
    }

    /**
     * @notice Check if a grantee has an active, non-expired grant for a vault.
     */
    function hasActiveGrant(
        string calldata vaultId,
        string calldata granteeId
    ) external view returns (bool, AccessScope) {
        bytes32 gk = keccak256(abi.encodePacked(granteeId));
        uint256[] storage ids = _granteeGrants[gk];

        bytes32 vk = keccak256(abi.encodePacked(vaultId));

        for (uint i = 0; i < ids.length; i++) {
            AccessGrant storage g = _grants[ids[i]];
            if (
                !g.revoked &&
                keccak256(abi.encodePacked(g.vaultId)) == vk &&
                (g.expiresAt == 0 || block.timestamp < g.expiresAt)
            ) {
                return (true, g.scope);
            }
        }
        return (false, AccessScope.HASHES_ONLY);
    }
}

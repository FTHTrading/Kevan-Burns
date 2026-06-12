// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title LegacyVaultRegistry
 * @notice Core registry for Legacy Vault Protocol vaults on the private EVM chain.
 *
 * Stores ONLY:
 *   - Vault IDs, owner DIDs, manifest CIDs and hashes
 *   - Vault status transitions
 *   - Audit event hashes for tamper-evidence
 *   - Release policy IDs
 *
 * NEVER stores: documents, account numbers, private keys, seed phrases, plaintext.
 *
 * All data stored here is either a hash, CID reference, or DID identifier.
 * Encrypted document content lives exclusively on private IPFS.
 */
contract LegacyVaultRegistry {

    // ─────────────────────────────────────────────
    //  Enums & Structs
    // ─────────────────────────────────────────────

    enum VaultStatus {
        ACTIVE,
        REVIEW_PENDING,
        RELEASE_PENDING,
        RELEASED,
        DISPUTED,
        LOCKED
    }

    struct VaultRecord {
        string  vaultId;
        string  ownerDID;
        string  encryptedManifestCID;
        bytes32 manifestHash;
        string  releasePolicyId;
        VaultStatus status;
        uint256 createdAt;
        uint256 updatedAt;
        bool    exists;
    }

    struct ChainEvent {
        string  eventName;
        string  vaultId;
        bytes32 dataHash;      // keccak256 of event payload — no raw data on-chain
        uint256 blockHeight;
        uint256 timestamp;
    }

    // ─────────────────────────────────────────────
    //  Storage
    // ─────────────────────────────────────────────

    address public owner;
    address public policyEngine;
    address public auditLog;

    /// vaultId (string key) → VaultRecord
    mapping(bytes32 => VaultRecord) private _vaults;

    /// Per-vault event log
    mapping(bytes32 => ChainEvent[]) private _vaultEvents;

    /// Authorised operators (admin keys or governance multisig)
    mapping(address => bool) public operators;

    // ─────────────────────────────────────────────
    //  Events
    // ─────────────────────────────────────────────

    event VaultCreated(
        string  indexed vaultId,
        string  ownerDID,
        string  manifestCID,
        bytes32 manifestHash,
        uint256 timestamp
    );

    event ManifestUpdated(
        string  indexed vaultId,
        string  newCID,
        bytes32 newHash,
        uint256 version,
        uint256 timestamp
    );

    event VaultStatusChanged(
        string  indexed vaultId,
        VaultStatus previousStatus,
        VaultStatus newStatus,
        address     changedBy,
        uint256     timestamp
    );

    event AuditEventAnchored(
        string  indexed vaultId,
        string  eventId,
        bytes32 eventHash,
        uint256 blockHeight,
        uint256 timestamp
    );

    event OperatorAdded(address indexed operator);
    event OperatorRemoved(address indexed operator);

    // ─────────────────────────────────────────────
    //  Modifiers
    // ─────────────────────────────────────────────

    modifier onlyOwner() {
        require(msg.sender == owner, "LVR: not owner");
        _;
    }

    modifier onlyOperator() {
        require(operators[msg.sender] || msg.sender == owner, "LVR: not operator");
        _;
    }

    modifier vaultExists(string calldata vaultId) {
        require(_vaults[_key(vaultId)].exists, "LVR: vault not found");
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
        emit OperatorAdded(op);
    }

    function removeOperator(address op) external onlyOwner {
        operators[op] = false;
        emit OperatorRemoved(op);
    }

    function setPolicyEngine(address _pe) external onlyOwner {
        policyEngine = _pe;
    }

    function setAuditLog(address _al) external onlyOwner {
        auditLog = _al;
    }

    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "LVR: zero address");
        owner = newOwner;
    }

    // ─────────────────────────────────────────────
    //  Core Write Operations
    // ─────────────────────────────────────────────

    /**
     * @notice Register a new vault on-chain.
     * @param vaultId          Application-assigned vault identifier (cuid/uuid)
     * @param ownerDID         W3C DID of the vault owner
     * @param manifestCID      IPFS CID of the encrypted manifest blob
     * @param manifestHash     SHA-256 hash of the encrypted manifest bytes (bytes32)
     * @param releasePolicyId  Opaque policy identifier
     */
    function registerVault(
        string calldata vaultId,
        string calldata ownerDID,
        string calldata manifestCID,
        bytes32         manifestHash,
        string calldata releasePolicyId
    ) external onlyOperator {
        bytes32 k = _key(vaultId);
        require(!_vaults[k].exists, "LVR: vault already registered");

        _vaults[k] = VaultRecord({
            vaultId:              vaultId,
            ownerDID:             ownerDID,
            encryptedManifestCID: manifestCID,
            manifestHash:         manifestHash,
            releasePolicyId:      releasePolicyId,
            status:               VaultStatus.ACTIVE,
            createdAt:            block.timestamp,
            updatedAt:            block.timestamp,
            exists:               true
        });

        _emitEvent(vaultId, "VaultCreated", keccak256(abi.encodePacked(ownerDID)));

        emit VaultCreated(vaultId, ownerDID, manifestCID, manifestHash, block.timestamp);
    }

    /**
     * @notice Update the vault manifest CID and hash (called on every vault save).
     */
    function updateManifest(
        string calldata vaultId,
        string calldata newCID,
        bytes32         newHash
    ) external onlyOperator vaultExists(vaultId) {
        bytes32 k = _key(vaultId);
        VaultRecord storage v = _vaults[k];

        v.encryptedManifestCID = newCID;
        v.manifestHash         = newHash;
        v.updatedAt            = block.timestamp;

        uint256 ver = _vaultEvents[k].length; // event count doubles as version

        _emitEvent(vaultId, "ManifestUpdated", keccak256(abi.encodePacked(newCID, newHash)));

        emit ManifestUpdated(vaultId, newCID, newHash, ver, block.timestamp);
    }

    /**
     * @notice Transition vault status (e.g., ACTIVE → REVIEW_PENDING).
     */
    function setVaultStatus(
        string calldata vaultId,
        VaultStatus     newStatus
    ) external onlyOperator vaultExists(vaultId) {
        bytes32 k = _key(vaultId);
        VaultRecord storage v = _vaults[k];

        VaultStatus prev = v.status;
        _validateStatusTransition(prev, newStatus);

        v.status    = newStatus;
        v.updatedAt = block.timestamp;

        _emitEvent(vaultId, _statusEventName(newStatus), bytes32(uint256(newStatus)));

        emit VaultStatusChanged(vaultId, prev, newStatus, msg.sender, block.timestamp);
    }

    /**
     * @notice Anchor an audit event hash for tamper-evidence.
     * @param vaultId    Vault the event belongs to
     * @param eventId    Application-layer event ID
     * @param eventHash  keccak256 or SHA-256 of the audit event payload
     */
    function anchorAuditEvent(
        string calldata vaultId,
        string calldata eventId,
        bytes32         eventHash
    ) external onlyOperator vaultExists(vaultId) {
        _emitEvent(vaultId, "AuditEventAnchored", eventHash);

        emit AuditEventAnchored(
            vaultId,
            eventId,
            eventHash,
            block.number,
            block.timestamp
        );
    }

    // ─────────────────────────────────────────────
    //  Read Operations
    // ─────────────────────────────────────────────

    function getVault(string calldata vaultId)
        external
        view
        returns (VaultRecord memory)
    {
        bytes32 k = _key(vaultId);
        require(_vaults[k].exists, "LVR: vault not found");
        return _vaults[k];
    }

    function getVaultStatus(string calldata vaultId)
        external
        view
        returns (VaultStatus)
    {
        bytes32 k = _key(vaultId);
        require(_vaults[k].exists, "LVR: vault not found");
        return _vaults[k].status;
    }

    function getVaultEvents(string calldata vaultId)
        external
        view
        vaultExists(vaultId)
        returns (ChainEvent[] memory)
    {
        return _vaultEvents[_key(vaultId)];
    }

    function vaultRegistered(string calldata vaultId)
        external
        view
        returns (bool)
    {
        return _vaults[_key(vaultId)].exists;
    }

    // ─────────────────────────────────────────────
    //  Internal Helpers
    // ─────────────────────────────────────────────

    function _key(string memory vaultId) internal pure returns (bytes32) {
        return keccak256(abi.encodePacked(vaultId));
    }

    function _emitEvent(
        string memory  vaultId,
        string memory  eventName,
        bytes32        dataHash
    ) internal {
        bytes32 k = _key(vaultId);
        _vaultEvents[k].push(ChainEvent({
            eventName:   eventName,
            vaultId:     vaultId,
            dataHash:    dataHash,
            blockHeight: block.number,
            timestamp:   block.timestamp
        }));
    }

    function _validateStatusTransition(
        VaultStatus from,
        VaultStatus to
    ) internal pure {
        // LOCKED vaults cannot be modified
        require(from != VaultStatus.LOCKED,    "LVR: vault is locked");
        // RELEASED vaults cannot go back
        require(from != VaultStatus.RELEASED || to == VaultStatus.LOCKED,
                "LVR: released vault cannot change status");
    }

    function _statusEventName(VaultStatus s) internal pure returns (string memory) {
        if (s == VaultStatus.ACTIVE)          return "VaultUnlocked";
        if (s == VaultStatus.REVIEW_PENDING)  return "ReleaseRequested";
        if (s == VaultStatus.RELEASE_PENDING) return "GuardianQuorumMet";
        if (s == VaultStatus.RELEASED)        return "ReleaseApproved";
        if (s == VaultStatus.DISPUTED)        return "DisputeOpened";
        if (s == VaultStatus.LOCKED)          return "VaultLocked";
        return "UnknownStatus";
    }
}

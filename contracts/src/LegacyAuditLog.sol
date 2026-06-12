// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title LegacyAuditLog
 * @notice Append-only, tamper-evident audit event stream for Legacy Vault Protocol.
 *
 * Each event includes a `previousEventHash` linking to the prior event in the
 * stream, forming a hash-linked list. Any modification to a past event breaks
 * the chain — detectable by any observer node.
 *
 * The 22 AuditAction types mirror the Prisma AuditAction enum exactly.
 * Only hashes and metadata identifiers are stored — no personal data, documents,
 * keys, or account numbers.
 */
contract LegacyAuditLog {

    // ─────────────────────────────────────────────
    //  Enums & Structs
    // ─────────────────────────────────────────────

    enum AuditAction {
        // Vault lifecycle (0–4)
        VAULT_CREATED,
        VAULT_UPDATED,
        VAULT_LOCKED,
        VAULT_UNLOCKED,
        MANIFEST_UPDATED,
        // Document (5–8)
        DOCUMENT_UPLOADED,
        DOCUMENT_ACCESSED,
        DOCUMENT_VERIFIED,
        DOCUMENT_DELETED,
        // Assets (9–11)
        ASSET_ADDED,
        ASSET_REMOVED,
        WALLET_ADDED,
        // Policy & release (12–19)
        RELEASE_POLICY_SET,
        RELEASE_REQUESTED,
        DEATH_PROOF_SUBMITTED,
        ATTORNEY_ATTESTED,
        GUARDIAN_APPROVED,
        RELEASE_APPROVED,
        RELEASE_DENIED,
        DISPUTE_OPENED,
        // Access & identity (20–21)
        DISPUTE_RESOLVED,
        ACCESS_GRANTED,
        // Administrative (22)
        ACCESS_REVOKED,
        FAILED_ACCESS,
        LOGIN,
        ADMIN_ACTION
    }

    struct AuditEvent {
        uint256     id;
        string      vaultId;       // may be empty for account-level actions
        string      actorId;       // application user ID (not address — privacy)
        AuditAction action;
        bytes32     targetHash;    // hash of affected object (doc CID hash, wallet addr hash, etc.)
        bytes32     metadataHash;  // hash of action metadata payload
        bytes32     previousHash;  // hash of prior event — tamper-detection chain
        uint256     timestamp;
        uint256     blockHeight;
    }

    // ─────────────────────────────────────────────
    //  Storage
    // ─────────────────────────────────────────────

    address public owner;
    mapping(address => bool) public operators;

    uint256 public totalEvents;
    bytes32 public latestHash;  // rolling hash of the most recent event

    /// Sequential event log
    AuditEvent[] private _events;

    /// Per-vault event index (stores event IDs)
    mapping(bytes32 => uint256[]) private _vaultEventIds;

    // ─────────────────────────────────────────────
    //  Events
    // ─────────────────────────────────────────────

    event AuditEventRecorded(
        uint256     indexed id,
        string      indexed vaultId,
        AuditAction         action,
        bytes32             eventHash,
        uint256             timestamp
    );

    // ─────────────────────────────────────────────
    //  Modifiers
    // ─────────────────────────────────────────────

    modifier onlyOwner() {
        require(msg.sender == owner, "LAL: not owner");
        _;
    }

    modifier onlyOperator() {
        require(operators[msg.sender] || msg.sender == owner, "LAL: not operator");
        _;
    }

    // ─────────────────────────────────────────────
    //  Constructor
    // ─────────────────────────────────────────────

    constructor() {
        owner = msg.sender;
        operators[msg.sender] = true;
        latestHash = bytes32(0); // genesis
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
    //  Write Operations
    // ─────────────────────────────────────────────

    /**
     * @notice Append an audit event to the immutable log.
     * @param vaultId       Application vault ID (empty string for account events)
     * @param actorId       Application actor ID (hashed at app layer for privacy)
     * @param action        The audit action type
     * @param targetHash    SHA-256 / keccak256 of affected object
     * @param metadataHash  keccak256 of event metadata JSON
     * @return eventId      Sequential ID of the recorded event
     * @return eventHash    Hash of the new event (for linking)
     */
    function recordEvent(
        string      calldata vaultId,
        string      calldata actorId,
        AuditAction          action,
        bytes32              targetHash,
        bytes32              metadataHash
    ) external onlyOperator returns (uint256 eventId, bytes32 eventHash) {
        eventId = totalEvents;

        // Build event hash — links to previous event
        eventHash = keccak256(abi.encodePacked(
            eventId,
            vaultId,
            actorId,
            uint256(action),
            targetHash,
            metadataHash,
            latestHash,
            block.timestamp,
            block.number
        ));

        AuditEvent memory ev = AuditEvent({
            id:           eventId,
            vaultId:      vaultId,
            actorId:      actorId,
            action:       action,
            targetHash:   targetHash,
            metadataHash: metadataHash,
            previousHash: latestHash,
            timestamp:    block.timestamp,
            blockHeight:  block.number
        });

        _events.push(ev);

        if (bytes(vaultId).length > 0) {
            _vaultEventIds[keccak256(abi.encodePacked(vaultId))].push(eventId);
        }

        latestHash = eventHash;
        totalEvents++;

        emit AuditEventRecorded(eventId, vaultId, action, eventHash, block.timestamp);
        return (eventId, eventHash);
    }

    // ─────────────────────────────────────────────
    //  Read Operations
    // ─────────────────────────────────────────────

    function getEvent(uint256 eventId)
        external
        view
        returns (AuditEvent memory)
    {
        require(eventId < totalEvents, "LAL: event not found");
        return _events[eventId];
    }

    function getVaultEventIds(string calldata vaultId)
        external
        view
        returns (uint256[] memory)
    {
        return _vaultEventIds[keccak256(abi.encodePacked(vaultId))];
    }

    /**
     * @notice Verify the chain integrity for a range of events.
     * Returns false if any event's previousHash doesn't match the prior event's hash.
     */
    function verifyChain(uint256 fromId, uint256 toId)
        external
        view
        returns (bool valid)
    {
        require(toId < totalEvents, "LAL: range out of bounds");
        require(fromId <= toId, "LAL: invalid range");

        for (uint256 i = fromId + 1; i <= toId; i++) {
            bytes32 expected = keccak256(abi.encodePacked(
                _events[i-1].id,
                _events[i-1].vaultId,
                _events[i-1].actorId,
                uint256(_events[i-1].action),
                _events[i-1].targetHash,
                _events[i-1].metadataHash,
                _events[i-1].previousHash,
                _events[i-1].timestamp,
                _events[i-1].blockHeight
            ));
            if (_events[i].previousHash != expected) return false;
        }
        return true;
    }

    function getLatestEvents(uint256 count)
        external
        view
        returns (AuditEvent[] memory)
    {
        uint256 total = totalEvents;
        if (count > total) count = total;
        AuditEvent[] memory result = new AuditEvent[](count);
        for (uint256 i = 0; i < count; i++) {
            result[i] = _events[total - count + i];
        }
        return result;
    }
}

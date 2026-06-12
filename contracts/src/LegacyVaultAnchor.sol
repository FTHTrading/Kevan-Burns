// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title LegacyVaultAnchor
 * @notice Immutable manifest hash anchoring and cryptographic attestation records.
 *
 * Every vault state change produces a manifest hash that is written here.
 * Anchors are strictly append-only — no update or delete is possible.
 * Each anchor has a monotonically increasing version number per vault.
 *
 * Attestations record the signed approval of executors, attorneys, guardians,
 * and notaries — each linked to a W3C Verifiable Credential hash.
 */
contract LegacyVaultAnchor {

    // ─────────────────────────────────────────────
    //  Enums & Structs
    // ─────────────────────────────────────────────

    enum AttestationRole {
        EXECUTOR,
        ATTORNEY,
        GUARDIAN,
        NOTARY,
        AUDITOR
    }

    enum AttestationKind {
        AUTHORITY_ESTABLISHED,
        GUARDIAN_APPROVAL,
        DEATH_PROOF_VERIFIED,
        ATTORNEY_VERIFIED,
        WAITING_PERIOD_CONFIRMED,
        DISPUTE_RAISED,
        DISPUTE_RESOLVED
    }

    struct ManifestAnchor {
        string  vaultId;
        bytes32 manifestHash;     // SHA-256 of full encrypted vault manifest
        string  ipfsCID;          // Optional IPFS CID reference
        uint32  version;          // Monotonically increasing per vault
        address anchoredBy;
        uint256 anchoredAt;
    }

    struct Attestation {
        string          vaultId;
        address         attester;
        string          attesterDID;
        AttestationRole role;
        AttestationKind kind;
        bytes32         credentialHash;   // W3C VC JWT SHA-256 hash
        bytes32         evidenceHash;     // Supporting document hash
        uint256         timestamp;
        uint256         blockHeight;
    }

    // ─────────────────────────────────────────────
    //  Storage
    // ─────────────────────────────────────────────

    address public owner;
    mapping(address => bool) public operators;

    /// vaultId → ordered anchor list (append-only)
    mapping(bytes32 => ManifestAnchor[]) private _anchors;

    /// vaultId → attestation list
    mapping(bytes32 => Attestation[]) private _attestations;

    /// vaultId → current version number
    mapping(bytes32 => uint32) private _versions;

    // ─────────────────────────────────────────────
    //  Events
    // ─────────────────────────────────────────────

    event ManifestAnchored(
        string  indexed vaultId,
        bytes32         manifestHash,
        string          ipfsCID,
        uint32          version,
        address         anchoredBy,
        uint256         timestamp
    );

    event AttestationRecorded(
        string          indexed vaultId,
        address         indexed attester,
        AttestationRole         role,
        AttestationKind         kind,
        bytes32                 credentialHash,
        uint256                 timestamp
    );

    // ─────────────────────────────────────────────
    //  Modifiers
    // ─────────────────────────────────────────────

    modifier onlyOwner() {
        require(msg.sender == owner, "LVA: not owner");
        _;
    }

    modifier onlyOperator() {
        require(operators[msg.sender] || msg.sender == owner, "LVA: not operator");
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
    //  Anchor Operations
    // ─────────────────────────────────────────────

    /**
     * @notice Anchor a vault manifest hash on-chain.
     * @param vaultId       Application vault ID
     * @param manifestHash  SHA-256 of the encrypted manifest bytes
     * @param ipfsCID       IPFS CID of the encrypted manifest (optional)
     * @return version      The version number assigned to this anchor
     */
    function anchorManifest(
        string  calldata vaultId,
        bytes32          manifestHash,
        string  calldata ipfsCID
    ) external onlyOperator returns (uint32 version) {
        bytes32 vk = _key(vaultId);

        _versions[vk] += 1;
        version = _versions[vk];

        _anchors[vk].push(ManifestAnchor({
            vaultId:      vaultId,
            manifestHash: manifestHash,
            ipfsCID:      ipfsCID,
            version:      version,
            anchoredBy:   msg.sender,
            anchoredAt:   block.timestamp
        }));

        emit ManifestAnchored(vaultId, manifestHash, ipfsCID, version, msg.sender, block.timestamp);
        return version;
    }

    /**
     * @notice Record an attestation (guardian approval, attorney verification, etc.)
     * @param vaultId        Vault the attestation applies to
     * @param attester       Address of the attesting party
     * @param attesterDID    W3C DID of the attesting party
     * @param role           Role of the attester
     * @param kind           Type of attestation
     * @param credentialHash SHA-256 hash of the W3C VC JWT
     * @param evidenceHash   SHA-256 hash of supporting document
     */
    function recordAttestation(
        string          calldata vaultId,
        address                  attester,
        string          calldata attesterDID,
        AttestationRole          role,
        AttestationKind          kind,
        bytes32                  credentialHash,
        bytes32                  evidenceHash
    ) external onlyOperator {
        bytes32 vk = _key(vaultId);

        _attestations[vk].push(Attestation({
            vaultId:        vaultId,
            attester:       attester,
            attesterDID:    attesterDID,
            role:           role,
            kind:           kind,
            credentialHash: credentialHash,
            evidenceHash:   evidenceHash,
            timestamp:      block.timestamp,
            blockHeight:    block.number
        }));

        emit AttestationRecorded(vaultId, attester, role, kind, credentialHash, block.timestamp);
    }

    // ─────────────────────────────────────────────
    //  Read Operations
    // ─────────────────────────────────────────────

    function getAnchors(string calldata vaultId)
        external view returns (ManifestAnchor[] memory)
    {
        return _anchors[_key(vaultId)];
    }

    function getLatestAnchor(string calldata vaultId)
        external view returns (ManifestAnchor memory)
    {
        bytes32 vk = _key(vaultId);
        ManifestAnchor[] storage anchors = _anchors[vk];
        require(anchors.length > 0, "LVA: no anchors for vault");
        return anchors[anchors.length - 1];
    }

    function getAttestations(string calldata vaultId)
        external view returns (Attestation[] memory)
    {
        return _attestations[_key(vaultId)];
    }

    function getCurrentVersion(string calldata vaultId)
        external view returns (uint32)
    {
        return _versions[_key(vaultId)];
    }

    /**
     * @notice Verify that a manifest hash matches the on-chain anchor at a specific version.
     */
    function verifyManifest(
        string  calldata vaultId,
        bytes32          manifestHash,
        uint32           version
    ) external view returns (bool) {
        bytes32 vk = _key(vaultId);
        ManifestAnchor[] storage anchors = _anchors[vk];
        for (uint i = 0; i < anchors.length; i++) {
            if (anchors[i].version == version) {
                return anchors[i].manifestHash == manifestHash;
            }
        }
        return false;
    }

    // ─────────────────────────────────────────────
    //  Internal
    // ─────────────────────────────────────────────

    function _key(string memory s) internal pure returns (bytes32) {
        return keccak256(abi.encodePacked(s));
    }
}

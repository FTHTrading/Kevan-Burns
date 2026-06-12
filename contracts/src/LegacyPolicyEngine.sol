// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title LegacyPolicyEngine
 * @notice On-chain release policy snapshots and condition satisfaction tracking
 *         for Legacy Vault Protocol.
 *
 * This contract enforces that ALL required conditions are met before a vault
 * can be marked RELEASED. It is the sole authoritative source for release state.
 *
 * Conditions (all must be met):
 *   1. Executor identity verified (IAL 2 or 3)
 *   2. Death certificate / court order uploaded and hashed
 *   3. Attorney / notary attestation
 *   4. Guardian quorum (N-of-M threshold)
 *   5. Waiting period elapsed (wall-clock enforced)
 *
 * LEGAL DISCLAIMER: This contract provides technical workflow infrastructure only.
 * Actual legal authority to access or transfer assets depends on applicable estate
 * law, court orders, platform terms, and qualified legal counsel. Nothing here
 * constitutes legal advice or replaces a properly executed will, trust, or
 * probate proceeding.
 */
contract LegacyPolicyEngine {

    // ─────────────────────────────────────────────
    //  Structs
    // ─────────────────────────────────────────────

    struct ReleasePolicy {
        string  vaultId;
        string  policyId;
        bool    requireExecutorIdentity;
        bool    requireDeathCertificate;
        bool    requireAttorneyAttestation;
        bool    requireGuardianQuorum;
        uint32  guardianQuorumN;   // required approvals
        uint32  guardianQuorumM;   // total guardians
        uint32  waitingPeriodDays;
        uint256 policyHash;        // keccak256 of serialised policy
        uint256 anchoredAt;
        uint32  version;
        bool    exists;
    }

    enum ReleaseCondition {
        EXECUTOR_IDENTITY_VERIFIED,
        DEATH_CERTIFICATE_UPLOADED,
        ATTORNEY_ATTESTED,
        GUARDIAN_QUORUM_REACHED,
        WAITING_PERIOD_ELAPSED
    }

    struct ConditionRecord {
        ReleaseCondition condition;
        address          satisfiedBy;
        bytes32          evidenceHash;   // Hash of supporting document CID
        uint256          satisfiedAt;
    }

    struct ReleaseState {
        string  vaultId;
        string  claimId;
        bool    identityVerified;
        bool    deathCertUploaded;
        bool    attorneyAttested;
        uint32  guardianApprovals;
        bool    guardianQuorumMet;
        uint256 quorumMetAt;
        bool    waitingPeriodComplete;
        uint256 waitingPeriodEndsAt;
        bool    disputed;
        bool    released;
        bool    denied;
        bool    exists;
    }

    // ─────────────────────────────────────────────
    //  Storage
    // ─────────────────────────────────────────────

    address public owner;
    mapping(address => bool) public operators;

    /// vaultId key → policy
    mapping(bytes32 => ReleasePolicy) private _policies;

    /// claimId key → release state
    mapping(bytes32 => ReleaseState) private _claims;

    /// claimId key → condition records
    mapping(bytes32 => ConditionRecord[]) private _conditions;

    /// vaultId → active claimId
    mapping(bytes32 => bytes32) private _activeClaim;

    // ─────────────────────────────────────────────
    //  Events
    // ─────────────────────────────────────────────

    event PolicyAnchored(
        string  indexed vaultId,
        string  policyId,
        uint256 policyHash,
        uint32  version,
        uint256 timestamp
    );

    event ClaimOpened(
        string  indexed vaultId,
        string  indexed claimId,
        address         claimant,
        uint256         timestamp
    );

    event ConditionSatisfied(
        string           indexed claimId,
        ReleaseCondition         condition,
        address                  satisfiedBy,
        bytes32                  evidenceHash,
        uint256                  timestamp
    );

    event WaitingPeriodStarted(
        string  indexed claimId,
        uint256         endsAt
    );

    event ReleaseAuthorised(
        string  indexed vaultId,
        string  indexed claimId,
        bytes32         conditionsHash,
        address         authorisedBy,
        uint256         timestamp
    );

    event ClaimDenied(
        string  indexed claimId,
        string          reason,
        address         deniedBy,
        uint256         timestamp
    );

    event DisputeRaised(
        string  indexed claimId,
        string          reason,
        address         raisedBy,
        uint256         timestamp
    );

    event DisputeResolved(
        string  indexed claimId,
        bool            releaseProceeds,
        address         resolvedBy,
        uint256         timestamp
    );

    // ─────────────────────────────────────────────
    //  Modifiers
    // ─────────────────────────────────────────────

    modifier onlyOwner() {
        require(msg.sender == owner, "LPE: not owner");
        _;
    }

    modifier onlyOperator() {
        require(operators[msg.sender] || msg.sender == owner, "LPE: not operator");
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
    //  Policy Management
    // ─────────────────────────────────────────────

    /**
     * @notice Anchor a release policy snapshot on-chain.
     * Policy content is stored in the app DB; only the hash lives here.
     */
    function anchorPolicy(
        string calldata vaultId,
        string calldata policyId,
        bool            requireExecutorIdentity,
        bool            requireDeathCertificate,
        bool            requireAttorneyAttestation,
        bool            requireGuardianQuorum,
        uint32          guardianQuorumN,
        uint32          guardianQuorumM,
        uint32          waitingPeriodDays
    ) external onlyOperator {
        bytes32 vk = _key(vaultId);

        uint32 newVersion = _policies[vk].exists
            ? _policies[vk].version + 1
            : 1;

        uint256 ph = uint256(keccak256(abi.encodePacked(
            policyId,
            requireExecutorIdentity,
            requireDeathCertificate,
            requireAttorneyAttestation,
            requireGuardianQuorum,
            guardianQuorumN,
            guardianQuorumM,
            waitingPeriodDays,
            newVersion
        )));

        _policies[vk] = ReleasePolicy({
            vaultId:                    vaultId,
            policyId:                   policyId,
            requireExecutorIdentity:    requireExecutorIdentity,
            requireDeathCertificate:    requireDeathCertificate,
            requireAttorneyAttestation: requireAttorneyAttestation,
            requireGuardianQuorum:      requireGuardianQuorum,
            guardianQuorumN:            guardianQuorumN,
            guardianQuorumM:            guardianQuorumM,
            waitingPeriodDays:          waitingPeriodDays,
            policyHash:                 ph,
            anchoredAt:                 block.timestamp,
            version:                    newVersion,
            exists:                     true
        });

        emit PolicyAnchored(vaultId, policyId, ph, newVersion, block.timestamp);
    }

    // ─────────────────────────────────────────────
    //  Claim Lifecycle
    // ─────────────────────────────────────────────

    /**
     * @notice Open a new release claim for a vault.
     */
    function openClaim(
        string calldata vaultId,
        string calldata claimId,
        address         claimant
    ) external onlyOperator {
        bytes32 vk = _key(vaultId);
        bytes32 ck = _key(claimId);

        require(_policies[vk].exists, "LPE: no policy for vault");
        require(!_claims[ck].exists, "LPE: claim already exists");

        _claims[ck] = ReleaseState({
            vaultId:              vaultId,
            claimId:              claimId,
            identityVerified:     false,
            deathCertUploaded:    false,
            attorneyAttested:     false,
            guardianApprovals:    0,
            guardianQuorumMet:    false,
            quorumMetAt:          0,
            waitingPeriodComplete: false,
            waitingPeriodEndsAt:  0,
            disputed:             false,
            released:             false,
            denied:               false,
            exists:               true
        });

        _activeClaim[vk] = ck;

        emit ClaimOpened(vaultId, claimId, claimant, block.timestamp);
    }

    /**
     * @notice Record that a condition has been satisfied.
     * @param claimId       The claim this satisfies
     * @param condition     Which condition (enum)
     * @param evidenceHash  Hash of supporting document (death cert CID, VC hash, etc.)
     */
    function satisfyCondition(
        string calldata  claimId,
        ReleaseCondition condition,
        bytes32          evidenceHash
    ) external onlyOperator {
        bytes32 ck = _key(claimId);
        ReleaseState storage rs = _claims[ck];
        require(rs.exists, "LPE: claim not found");
        require(!rs.released, "LPE: already released");
        require(!rs.denied, "LPE: claim denied");
        require(!rs.disputed, "LPE: claim disputed");

        // Update condition flags
        if (condition == ReleaseCondition.EXECUTOR_IDENTITY_VERIFIED) {
            rs.identityVerified = true;
        } else if (condition == ReleaseCondition.DEATH_CERTIFICATE_UPLOADED) {
            rs.deathCertUploaded = true;
        } else if (condition == ReleaseCondition.ATTORNEY_ATTESTED) {
            rs.attorneyAttested = true;
        } else if (condition == ReleaseCondition.GUARDIAN_QUORUM_REACHED) {
            rs.guardianApprovals += 1;

            // Check quorum
            bytes32 vk = _key(rs.vaultId);
            ReleasePolicy storage pol = _policies[vk];
            if (rs.guardianApprovals >= pol.guardianQuorumN && !rs.guardianQuorumMet) {
                rs.guardianQuorumMet = true;
                rs.quorumMetAt       = block.timestamp;
                uint256 endsAt       = block.timestamp + (uint256(pol.waitingPeriodDays) * 1 days);
                rs.waitingPeriodEndsAt = endsAt;
                emit WaitingPeriodStarted(claimId, endsAt);
            }
        } else if (condition == ReleaseCondition.WAITING_PERIOD_ELAPSED) {
            require(rs.guardianQuorumMet, "LPE: quorum not met");
            require(block.timestamp >= rs.waitingPeriodEndsAt, "LPE: waiting period not elapsed");
            rs.waitingPeriodComplete = true;
        }

        _conditions[ck].push(ConditionRecord({
            condition:    condition,
            satisfiedBy:  msg.sender,
            evidenceHash: evidenceHash,
            satisfiedAt:  block.timestamp
        }));

        emit ConditionSatisfied(claimId, condition, msg.sender, evidenceHash, block.timestamp);
    }

    /**
     * @notice Authorise release — verifies ALL conditions are met on-chain.
     *         Only callable by operator (admin). Never auto-triggers.
     */
    function authoriseRelease(
        string calldata vaultId,
        string calldata claimId
    ) external onlyOperator returns (bytes32 conditionsHash) {
        bytes32 vk = _key(vaultId);
        bytes32 ck = _key(claimId);
        ReleaseState storage rs = _claims[ck];
        ReleasePolicy storage pol = _policies[vk];

        require(rs.exists,           "LPE: claim not found");
        require(!rs.released,        "LPE: already released");
        require(!rs.denied,          "LPE: claim denied");
        require(!rs.disputed,        "LPE: claim is disputed");

        // Verify all required conditions
        require(!pol.requireExecutorIdentity    || rs.identityVerified,     "LPE: identity not verified");
        require(!pol.requireDeathCertificate    || rs.deathCertUploaded,    "LPE: death cert not uploaded");
        require(!pol.requireAttorneyAttestation || rs.attorneyAttested,     "LPE: attorney not attested");
        require(!pol.requireGuardianQuorum      || rs.guardianQuorumMet,    "LPE: quorum not met");
        require(rs.waitingPeriodComplete || block.timestamp >= rs.waitingPeriodEndsAt,
                "LPE: waiting period active");

        rs.released = true;

        // Compute conditions hash for audit
        conditionsHash = keccak256(abi.encodePacked(
            claimId,
            rs.identityVerified,
            rs.deathCertUploaded,
            rs.attorneyAttested,
            rs.guardianApprovals,
            rs.waitingPeriodEndsAt
        ));

        emit ReleaseAuthorised(vaultId, claimId, conditionsHash, msg.sender, block.timestamp);
        return conditionsHash;
    }

    /**
     * @notice Deny a claim.
     */
    function denyClaim(
        string calldata claimId,
        string calldata reason
    ) external onlyOperator {
        bytes32 ck = _key(claimId);
        ReleaseState storage rs = _claims[ck];
        require(rs.exists && !rs.released, "LPE: invalid state");
        rs.denied = true;
        emit ClaimDenied(claimId, reason, msg.sender, block.timestamp);
    }

    /**
     * @notice Raise a dispute — freezes the claim.
     */
    function raiseDispute(
        string calldata claimId,
        string calldata reason
    ) external onlyOperator {
        bytes32 ck = _key(claimId);
        ReleaseState storage rs = _claims[ck];
        require(rs.exists && !rs.released && !rs.denied, "LPE: invalid state");
        rs.disputed = true;
        emit DisputeRaised(claimId, reason, msg.sender, block.timestamp);
    }

    /**
     * @notice Resolve a dispute.
     * @param releaseProceeds  If true, dispute cleared and release can proceed.
     *                         If false, claim is denied.
     */
    function resolveDispute(
        string calldata claimId,
        bool            releaseProceeds
    ) external onlyOperator {
        bytes32 ck = _key(claimId);
        ReleaseState storage rs = _claims[ck];
        require(rs.exists && rs.disputed, "LPE: not disputed");

        rs.disputed = false;
        if (!releaseProceeds) rs.denied = true;

        emit DisputeResolved(claimId, releaseProceeds, msg.sender, block.timestamp);
    }

    // ─────────────────────────────────────────────
    //  Read Operations
    // ─────────────────────────────────────────────

    function getPolicy(string calldata vaultId)
        external view returns (ReleasePolicy memory)
    {
        return _policies[_key(vaultId)];
    }

    function getClaimState(string calldata claimId)
        external view returns (ReleaseState memory)
    {
        bytes32 ck = _key(claimId);
        require(_claims[ck].exists, "LPE: claim not found");
        return _claims[ck];
    }

    function getConditions(string calldata claimId)
        external view returns (ConditionRecord[] memory)
    {
        return _conditions[_key(claimId)];
    }

    function allConditionsMet(string calldata claimId)
        external view returns (bool)
    {
        bytes32 ck = _key(claimId);
        ReleaseState storage rs = _claims[ck];
        if (!rs.exists || rs.denied || rs.disputed) return false;

        bytes32 vk = _key(rs.vaultId);
        ReleasePolicy storage pol = _policies[vk];

        bool identity  = !pol.requireExecutorIdentity    || rs.identityVerified;
        bool death     = !pol.requireDeathCertificate    || rs.deathCertUploaded;
        bool attorney  = !pol.requireAttorneyAttestation || rs.attorneyAttested;
        bool quorum    = !pol.requireGuardianQuorum      || rs.guardianQuorumMet;
        bool waiting   = rs.waitingPeriodComplete || (
            rs.waitingPeriodEndsAt > 0 && block.timestamp >= rs.waitingPeriodEndsAt
        );

        return identity && death && attorney && quorum && waiting;
    }

    // ─────────────────────────────────────────────
    //  Internal
    // ─────────────────────────────────────────────

    function _key(string memory s) internal pure returns (bytes32) {
        return keccak256(abi.encodePacked(s));
    }
}

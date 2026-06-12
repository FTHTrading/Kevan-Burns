// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title LegacyNamespaceRegistry
 * @notice Sovereign `.legacy` namespace registry for Legacy Vault Protocol.
 *
 * A namespace is the root identity that parents all vaults for a person or entity.
 * Format: `name.legacy`  (e.g., `smithfamily.legacy`)
 *
 * Stores: namespace label hash, owner address, DID, member roles, status.
 * Never stores: private data, documents, keys.
 */
contract LegacyNamespaceRegistry {

    // ─────────────────────────────────────────────
    //  Enums & Structs
    // ─────────────────────────────────────────────

    enum NamespaceStatus {
        ACTIVE,
        PROBATE_PENDING,
        FROZEN,
        RELEASED,
        DISPUTED,
        ARCHIVED,
        DEACTIVATED
    }

    enum NamespaceRole {
        OWNER,
        EXECUTOR,
        ATTORNEY,
        GUARDIAN,
        BENEFICIARY,
        AUDITOR,
        OBSERVER
    }

    struct Member {
        address    account;
        string     did;
        NamespaceRole role;
        uint256    addedAt;
        bool       active;
    }

    struct NamespaceRecord {
        bytes32         labelHash;   // keccak256(label) — label stored off-chain / in DB
        string          label;       // e.g. "smithfamily.legacy" — public identifier only
        address         ownerAddr;
        string          ownerDID;
        NamespaceStatus status;
        uint256         planTier;    // 0=free 1=family 2=professional 3=enterprise
        uint256         createdAt;
        uint256         updatedAt;
        bool            exists;
    }

    // ─────────────────────────────────────────────
    //  Storage
    // ─────────────────────────────────────────────

    address public owner;
    mapping(address => bool) public operators;

    /// label hash → namespace record
    mapping(bytes32 => NamespaceRecord) private _namespaces;

    /// label hash → members list
    mapping(bytes32 => Member[]) private _members;

    /// label hash → member index by address
    mapping(bytes32 => mapping(address => uint256)) private _memberIndex;

    /// owner address → list of namespace label hashes
    mapping(address => bytes32[]) private _ownerNamespaces;

    // ─────────────────────────────────────────────
    //  Events
    // ─────────────────────────────────────────────

    event NamespaceRegistered(
        bytes32 indexed labelHash,
        string  label,
        address ownerAddr,
        string  ownerDID,
        uint256 planTier,
        uint256 timestamp
    );

    event NamespaceStatusChanged(
        bytes32         indexed labelHash,
        NamespaceStatus         previousStatus,
        NamespaceStatus         newStatus,
        address                 changedBy,
        uint256                 timestamp
    );

    event MemberAdded(
        bytes32       indexed labelHash,
        address       indexed account,
        string                did,
        NamespaceRole         role,
        uint256               timestamp
    );

    event MemberRemoved(
        bytes32 indexed labelHash,
        address indexed account,
        uint256         timestamp
    );

    event OwnershipTransferred(
        bytes32 indexed labelHash,
        address indexed from,
        address indexed to,
        uint256         timestamp
    );

    // ─────────────────────────────────────────────
    //  Modifiers
    // ─────────────────────────────────────────────

    modifier onlyOwner() {
        require(msg.sender == owner, "LNR: not owner");
        _;
    }

    modifier onlyOperator() {
        require(operators[msg.sender] || msg.sender == owner, "LNR: not operator");
        _;
    }

    modifier nsExists(bytes32 lh) {
        require(_namespaces[lh].exists, "LNR: namespace not found");
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
        require(newOwner != address(0), "LNR: zero address");
        owner = newOwner;
    }

    // ─────────────────────────────────────────────
    //  Core Write Operations
    // ─────────────────────────────────────────────

    /**
     * @notice Register a new `.legacy` namespace.
     * @param label     Full namespace label e.g. "smithfamily.legacy"
     * @param ownerAddr Ethereum address of the namespace owner
     * @param ownerDID  W3C DID of the namespace owner
     * @param planTier  Subscription tier (0–3)
     */
    function registerNamespace(
        string  calldata label,
        address          ownerAddr,
        string  calldata ownerDID,
        uint256          planTier
    ) external onlyOperator {
        bytes32 lh = keccak256(abi.encodePacked(label));
        require(!_namespaces[lh].exists, "LNR: namespace already taken");

        _namespaces[lh] = NamespaceRecord({
            labelHash:  lh,
            label:      label,
            ownerAddr:  ownerAddr,
            ownerDID:   ownerDID,
            status:     NamespaceStatus.ACTIVE,
            planTier:   planTier,
            createdAt:  block.timestamp,
            updatedAt:  block.timestamp,
            exists:     true
        });

        _ownerNamespaces[ownerAddr].push(lh);

        // Auto-add owner as OWNER member
        _addMemberInternal(lh, ownerAddr, ownerDID, NamespaceRole.OWNER);

        emit NamespaceRegistered(lh, label, ownerAddr, ownerDID, planTier, block.timestamp);
    }

    /**
     * @notice Add a member to a namespace with a specific role.
     */
    function addMember(
        string  calldata label,
        address          memberAddr,
        string  calldata memberDID,
        NamespaceRole    role
    ) external onlyOperator {
        bytes32 lh = keccak256(abi.encodePacked(label));
        require(_namespaces[lh].exists, "LNR: namespace not found");

        _addMemberInternal(lh, memberAddr, memberDID, role);

        emit MemberAdded(lh, memberAddr, memberDID, role, block.timestamp);
    }

    /**
     * @notice Remove (deactivate) a member from a namespace.
     */
    function removeMember(
        string  calldata label,
        address          memberAddr
    ) external onlyOperator {
        bytes32 lh = keccak256(abi.encodePacked(label));
        require(_namespaces[lh].exists, "LNR: namespace not found");

        uint256 idx = _memberIndex[lh][memberAddr];
        require(idx < _members[lh].length, "LNR: member not found");
        require(_members[lh][idx].active, "LNR: member not active");
        // Prevent removing the owner
        require(_members[lh][idx].role != NamespaceRole.OWNER, "LNR: cannot remove owner");

        _members[lh][idx].active = false;

        emit MemberRemoved(lh, memberAddr, block.timestamp);
    }

    /**
     * @notice Transition namespace status.
     */
    function setNamespaceStatus(
        string          calldata label,
        NamespaceStatus          newStatus
    ) external onlyOperator {
        bytes32 lh = keccak256(abi.encodePacked(label));
        require(_namespaces[lh].exists, "LNR: namespace not found");

        NamespaceRecord storage ns = _namespaces[lh];
        NamespaceStatus prev = ns.status;

        ns.status    = newStatus;
        ns.updatedAt = block.timestamp;

        emit NamespaceStatusChanged(lh, prev, newStatus, msg.sender, block.timestamp);
    }

    /**
     * @notice Transfer namespace ownership to a new address.
     */
    function transferNamespaceOwnership(
        string  calldata label,
        address          newOwner,
        string  calldata newOwnerDID
    ) external onlyOperator {
        bytes32 lh = keccak256(abi.encodePacked(label));
        require(_namespaces[lh].exists, "LNR: namespace not found");

        NamespaceRecord storage ns = _namespaces[lh];
        address prev = ns.ownerAddr;

        ns.ownerAddr = newOwner;
        ns.ownerDID  = newOwnerDID;
        ns.updatedAt = block.timestamp;

        _ownerNamespaces[newOwner].push(lh);

        emit OwnershipTransferred(lh, prev, newOwner, block.timestamp);
    }

    // ─────────────────────────────────────────────
    //  Read Operations
    // ─────────────────────────────────────────────

    function getNamespace(string calldata label)
        external
        view
        returns (NamespaceRecord memory)
    {
        bytes32 lh = keccak256(abi.encodePacked(label));
        require(_namespaces[lh].exists, "LNR: namespace not found");
        return _namespaces[lh];
    }

    function getMembers(string calldata label)
        external
        view
        returns (Member[] memory)
    {
        bytes32 lh = keccak256(abi.encodePacked(label));
        require(_namespaces[lh].exists, "LNR: namespace not found");
        return _members[lh];
    }

    function namespaceExists(string calldata label)
        external
        view
        returns (bool)
    {
        return _namespaces[keccak256(abi.encodePacked(label))].exists;
    }

    function getOwnerNamespaces(address ownerAddr)
        external
        view
        returns (bytes32[] memory)
    {
        return _ownerNamespaces[ownerAddr];
    }

    // ─────────────────────────────────────────────
    //  Internal
    // ─────────────────────────────────────────────

    function _addMemberInternal(
        bytes32       lh,
        address       memberAddr,
        string memory memberDID,
        NamespaceRole role
    ) internal {
        uint256 idx = _members[lh].length;
        _members[lh].push(Member({
            account: memberAddr,
            did:     memberDID,
            role:    role,
            addedAt: block.timestamp,
            active:  true
        }));
        _memberIndex[lh][memberAddr] = idx;
    }
}

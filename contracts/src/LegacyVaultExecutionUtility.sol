// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

interface ILegacyVaultRegistry {
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
    function getVault(string calldata vaultId) external view returns (VaultRecord memory);
    function setVaultStatus(string calldata vaultId, VaultStatus newStatus) external;
    function vaultRegistered(string calldata vaultId) external view returns (bool);
}

interface ILegacyPolicyEngine {
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
    function allConditionsMet(string calldata claimId) external view returns (bool);
    function getClaimState(string calldata claimId) external view returns (ReleaseState memory);
    function authoriseRelease(string calldata vaultId, string calldata claimId) external returns (bytes32);
}

interface IERC6551Account {
    function execute(address to, uint256 value, bytes calldata data, uint8 operation) external payable returns (bytes memory);
}

/**
 * @title LegacyVaultExecutionUtility
 * @notice Automated Estate Settlement Coordination & Execution Engine.
 * Verifies estate release conditions on the Policy Engine, transitions Vault Registry state,
 * and handles automated token distribution from the ERC-6551 Token-Bound Account (TBA) to beneficiaries.
 */
contract LegacyVaultExecutionUtility is Ownable {

    struct Share {
        address beneficiary;
        uint256 basisPoints; // 10000 basis points = 100%
    }

    address public vaultRegistry;
    address public policyEngine;

    // keccak256(vaultId) -> Share list
    mapping(bytes32 => Share[]) private _vaultShares;

    // Authorised operators (multisig or admin backend keys)
    mapping(address => bool) public operators;

    event BeneficiarySharesUpdated(string indexed vaultId, Share[] shares);
    event VaultEstateDistributed(string indexed vaultId, address indexed token, uint256 totalDistributed, uint256 beneficiariesCount);
    event OperatorUpdated(address indexed operator, bool status);

    modifier onlyOperator() {
        require(operators[msg.sender] || msg.sender == owner(), "LVEU: not operator");
        _;
    }

    constructor(address _vaultRegistry, address _policyEngine) Ownable(msg.sender) {
        vaultRegistry = _vaultRegistry;
        policyEngine = _policyEngine;
        operators[msg.sender] = true;
    }

    function setOperators(address op, bool status) external onlyOwner {
        operators[op] = status;
        emit OperatorUpdated(op, status);
    }

    function setRegistries(address _vaultRegistry, address _policyEngine) external onlyOwner {
        vaultRegistry = _vaultRegistry;
        policyEngine = _policyEngine;
    }

    /**
     * @notice Set estate distribution shares for a specific vault.
     * @param vaultId Vault identifier
     * @param beneficiaries Array of beneficiary addresses
     * @param basisPoints Array of shares in basis points (100 = 1%)
     */
    function setBeneficiaryShares(
        string calldata vaultId,
        address[] calldata beneficiaries,
        uint256[] calldata basisPoints
    ) external onlyOperator {
        require(beneficiaries.length == basisPoints.length, "LVEU: arrays length mismatch");
        require(beneficiaries.length > 0, "LVEU: empty beneficiaries array");

        bytes32 vk = keccak256(abi.encodePacked(vaultId));
        delete _vaultShares[vk];

        uint256 totalShares = 0;
        for (uint256 i = 0; i < beneficiaries.length; i++) {
            require(beneficiaries[i] != address(0), "LVEU: zero address beneficiary");
            require(basisPoints[i] > 0, "LVEU: share must be greater than 0");
            _vaultShares[vk].push(Share({
                beneficiary: beneficiaries[i],
                basisPoints: basisPoints[i]
            }));
            totalShares += basisPoints[i];
        }

        require(totalShares == 10000, "LVEU: total shares must equal 10000 basis points (100%)");

        emit BeneficiarySharesUpdated(vaultId, _vaultShares[vk]);
    }

    /**
     * @notice Coordinates conditions audit, changes vault state to RELEASED,
     * and triggers automatic estate distribution out of the vault's TBA wallet.
     * @param vaultId Vault identifier
     * @param claimId Claim identifier from the policy engine
     * @param tbaAddress Address of the vault's ERC-6551 Token Bound Account wallet
     * @param tokenAddress Address of the ERC-20 token being distributed
     */
    function executeVaultRelease(
        string calldata vaultId,
        string calldata claimId,
        address tbaAddress,
        address tokenAddress
    ) external onlyOperator {
        ILegacyPolicyEngine pe = ILegacyPolicyEngine(policyEngine);
        ILegacyVaultRegistry vr = ILegacyVaultRegistry(vaultRegistry);

        // 1. Audit Policy conditions are satisfied
        require(pe.allConditionsMet(claimId), "LVEU: Policy conditions not satisfied");
        
        ILegacyPolicyEngine.ReleaseState memory state = pe.getClaimState(claimId);
        require(keccak256(abi.encodePacked(state.vaultId)) == keccak256(abi.encodePacked(vaultId)), "LVEU: Claim does not match vault");

        // 2. Authorise release on the policy engine if not already done
        if (!state.released) {
            pe.authoriseRelease(vaultId, claimId);
        }

        // 3. Mark vault as RELEASED in vault registry
        vr.setVaultStatus(vaultId, ILegacyVaultRegistry.VaultStatus.RELEASED);

        // 4. Resolve shares & execute TBA transfers
        bytes32 vk = keccak256(abi.encodePacked(vaultId));
        Share[] storage shares = _vaultShares[vk];
        require(shares.length > 0, "LVEU: Beneficiary shares not configured");

        IERC20 token = IERC20(tokenAddress);
        uint256 tbaBalance = token.balanceOf(tbaAddress);
        require(tbaBalance > 0, "LVEU: TBA token balance is 0");

        uint256 distributedAmount = 0;
        uint256 sharesCount = shares.length;

        for (uint256 i = 0; i < sharesCount; i++) {
            address beneficiary = shares[i].beneficiary;
            uint256 shareAmount = (tbaBalance * shares[i].basisPoints) / 10000;

            if (shareAmount > 0) {
                // Call execute on the ERC-6551 Account to transfer tokens
                bytes memory payload = abi.encodeWithSelector(
                    IERC20.transfer.selector,
                    beneficiary,
                    shareAmount
                );

                IERC6551Account(tbaAddress).execute(
                    tokenAddress,
                    0,       // msg.value is 0 for ERC-20 transfers
                    payload,
                    0        // operation: 0 is standard call
                );

                distributedAmount += shareAmount;
            }
        }

        emit VaultEstateDistributed(vaultId, tokenAddress, distributedAmount, sharesCount);
    }

    /**
     * @notice Get the configuration shares for a vault.
     */
    function getBeneficiaryShares(string calldata vaultId) external view returns (Share[] memory) {
        return _vaultShares[keccak256(abi.encodePacked(vaultId))];
    }
}

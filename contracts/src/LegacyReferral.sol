// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

interface IERC20 {
    function transfer(address recipient, uint256 amount) external returns (bool);
    function transferFrom(address sender, address recipient, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
}

/**
 * @title LegacyReferral
 * @notice Web3-native affiliate and referral contract for FlashRouter and Legacy Vault.
 *
 * Handles on-chain referrer attribution, multi-level rewards, and fee splits.
 * Supports payouts in native gas tokens or specified ERC20 tokens (e.g., USDC, TROPTIONS).
 */
contract LegacyReferral {

    // ─────────────────────────────────────────────
    //  Structs & Storage
    // ─────────────────────────────────────────────

    struct ReferrerConfig {
        bytes32 namespaceHash; // keccak256(name.legacy)
        address parentReferrer; // Level 2 referrer address
        uint256 totalReferrals;
        uint256 totalEarned;
        bool active;
    }

    address public owner;
    mapping(address => bool) public operators;
    
    // Default fee splits (basis points, 10000 = 100%)
    uint256 public level1Bps = 1500; // 15%
    uint256 public level2Bps = 500;  // 5%

    // User address => Referrer config
    mapping(address => ReferrerConfig) public referrers;

    // Customer address => Referrer (Level 1) address
    mapping(address => address) public customerToReferrer;

    // ─────────────────────────────────────────────
    //  Events
    // ─────────────────────────────────────────────

    event ReferrerRegistered(
        address indexed referrer,
        bytes32 indexed namespaceHash,
        address parentReferrer,
        uint256 timestamp
    );

    event ReferralLinked(
        address indexed customer,
        address indexed referrer,
        uint256 timestamp
    );

    event RewardPaid(
        address indexed customer,
        address indexed referrer,
        uint256 amount,
        address tokenAddress,
        uint256 level,
        uint256 timestamp
    );

    event ParameterUpdated(
        string parameterName,
        uint256 value,
        uint256 timestamp
    );

    // ─────────────────────────────────────────────
    //  Modifiers
    // ─────────────────────────────────────────────

    modifier onlyOwner() {
        require(msg.sender == owner, "LR: not owner");
        _;
    }

    modifier onlyOperator() {
        require(operators[msg.sender] || msg.sender == owner, "LR: not operator");
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
    //  Admin Operations
    // ─────────────────────────────────────────────

    function setOperator(address op, bool status) external onlyOwner {
        operators[op] = status;
    }

    function setRewardSplits(uint256 _level1Bps, uint256 _level2Bps) external onlyOwner {
        require(_level1Bps + _level2Bps <= 10000, "LR: split exceeds 100%");
        level1Bps = _level1Bps;
        level2Bps = _level2Bps;
        emit ParameterUpdated("level1Bps", _level1Bps, block.timestamp);
        emit ParameterUpdated("level2Bps", _level2Bps, block.timestamp);
    }

    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "LR: zero address");
        owner = newOwner;
    }

    // ─────────────────────────────────────────────
    //  Core Actions
    // ─────────────────────────────────────────────

    /**
     * @notice Register an affiliate/referrer with an optional namespace and parent referrer.
     */
    function registerReferrer(
        address referrerAddr,
        string calldata namespace,
        address parentReferrer
    ) external onlyOperator {
        require(referrerAddr != address(0), "LR: zero address");
        require(referrerAddr != parentReferrer, "LR: self parent");
        
        bytes32 nsHash = keccak256(abi.encodePacked(namespace));
        
        referrers[referrerAddr] = ReferrerConfig({
            namespaceHash: nsHash,
            parentReferrer: parentReferrer,
            totalReferrals: referrers[referrerAddr].totalReferrals,
            totalEarned: referrers[referrerAddr].totalEarned,
            active: true
        });

        emit ReferrerRegistered(referrerAddr, nsHash, parentReferrer, block.timestamp);
    }

    /**
     * @notice Link a customer to their referrer.
     */
    function linkCustomer(address customer, address referrer) external onlyOperator {
        require(customer != address(0) && referrer != address(0), "LR: zero address");
        require(customer != referrer, "LR: self refer");
        require(referrers[referrer].active, "LR: inactive referrer");
        require(customerToReferrer[customer] == address(0), "LR: already linked");

        customerToReferrer[customer] = referrer;
        referrers[referrer].totalReferrals += 1;

        emit ReferralLinked(customer, referrer, block.timestamp);
    }

    /**
     * @notice Distribute rewards for a purchase using native currency (ETH/POL/etc).
     */
    function distributeNativeReward(address customer) external payable onlyOperator {
        require(msg.value > 0, "LR: zero payment");
        address l1Referrer = customerToReferrer[customer];
        if (l1Referrer == address(0)) {
            // No referrer: forward entire balance to owner
            payable(owner).transfer(msg.value);
            return;
        }

        uint256 l1Amount = (msg.value * level1Bps) / 10000;
        uint256 l2Amount = 0;
        address l2Referrer = referrers[l1Referrer].parentReferrer;

        if (l2Referrer != address(0) && referrers[l2Referrer].active) {
            l2Amount = (msg.value * level2Bps) / 10000;
        }

        uint256 remaining = msg.value - l1Amount - l2Amount;

        // Pay Level 1 Referrer
        if (l1Amount > 0) {
            referrers[l1Referrer].totalEarned += l1Amount;
            payable(l1Referrer).transfer(l1Amount);
            emit RewardPaid(customer, l1Referrer, l1Amount, address(0), 1, block.timestamp);
        }

        // Pay Level 2 Referrer
        if (l2Amount > 0) {
            referrers[l2Referrer].totalEarned += l2Amount;
            payable(l2Referrer).transfer(l2Amount);
            emit RewardPaid(customer, l2Referrer, l2Amount, address(0), 2, block.timestamp);
        }

        // Pay Platform Owner
        if (remaining > 0) {
            payable(owner).transfer(remaining);
        }
    }

    /**
     * @notice Distribute rewards for a purchase using an ERC20 token (e.g., USDC).
     */
    function distributeTokenReward(
        address customer,
        address tokenAddress,
        uint256 totalAmount
    ) external onlyOperator {
        require(totalAmount > 0, "LR: zero amount");
        require(tokenAddress != address(0), "LR: zero token address");

        // Transfer full payment token from sender (operator/contract) to this contract
        IERC20 token = IERC20(tokenAddress);
        require(token.transferFrom(msg.sender, address(this), totalAmount), "LR: transferFrom failed");

        address l1Referrer = customerToReferrer[customer];
        if (l1Referrer == address(0)) {
            // No referrer: forward entire balance to owner
            require(token.transfer(owner, totalAmount), "LR: owner transfer failed");
            return;
        }

        uint256 l1Amount = (totalAmount * level1Bps) / 10000;
        uint256 l2Amount = 0;
        address l2Referrer = referrers[l1Referrer].parentReferrer;

        if (l2Referrer != address(0) && referrers[l2Referrer].active) {
            l2Amount = (totalAmount * level2Bps) / 10000;
        }

        uint256 remaining = totalAmount - l1Amount - l2Amount;

        // Pay Level 1 Referrer
        if (l1Amount > 0) {
            referrers[l1Referrer].totalEarned += l1Amount;
            require(token.transfer(l1Referrer, l1Amount), "LR: l1 transfer failed");
            emit RewardPaid(customer, l1Referrer, l1Amount, tokenAddress, 1, block.timestamp);
        }

        // Pay Level 2 Referrer
        if (l2Amount > 0) {
            referrers[l2Referrer].totalEarned += l2Amount;
            require(token.transfer(l2Referrer, l2Amount), "LR: l2 transfer failed");
            emit RewardPaid(customer, l2Referrer, l2Amount, tokenAddress, 2, block.timestamp);
        }

        // Pay Platform Owner
        if (remaining > 0) {
            require(token.transfer(owner, remaining), "LR: owner remaining transfer failed");
        }
    }
}

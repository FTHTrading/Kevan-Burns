// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

interface ILegacyReferral {
    function customerToReferrer(address customer) external view returns (address);
    function distributeNativeReward(address customer) external payable;
    function distributeTokenReward(address customer, address tokenAddress, uint256 totalAmount) external;
}

interface IAffiliateBadge {
    function hasBadge(address account) external view returns (bool);
    function balanceOf(address owner) external view returns (uint256);
}

/**
 * @title LegacyFeeDistributionUtility
 * @notice Ecosystem Fee, Subscription, and Referral Router.
 * Manages plan tiers, pricing, and root name registration fees in native gas tokens and ERC-20s.
 * Integrates directly with AffiliateBadge for discounts and LegacyReferral for revenue sharing splits.
 */
contract LegacyFeeDistributionUtility is Ownable {
    using SafeERC20 for IERC20;

    address public referralContract;
    address public affiliateBadgeContract;
    address public treasury;

    // Discount for affiliate badge holders (basis points, 1000 = 10% discount)
    uint256 public badgeDiscountBps = 1000;

    // Suffix root registration fees
    uint256 public nativeRootRegistrationFee;
    mapping(address => uint256) public tokenRootRegistrationFees;

    // Subscription plan tier prices (0 = Free, 1 = Family, 2 = Professional, 3 = Enterprise)
    mapping(uint256 => uint256) public nativeTierPrices;
    // token address -> tierId -> price
    mapping(address => mapping(uint256 => uint256)) public tokenTierPrices;

    event SubscriptionPurchased(address indexed user, uint256 tier, address token, uint256 amountPaid);
    event NamespaceRegistrationPaid(address indexed user, string label, address token, uint256 amountPaid);
    event PriceUpdated(string feeType, uint256 tierOrId, address token, uint256 price);
    event DiscountUpdated(uint256 newDiscountBps);
    event AddressesUpdated(address referral, address badge, address treasuryAddr);

    constructor(
        address _referralContract,
        address _affiliateBadgeContract,
        address _treasury
    ) Ownable(msg.sender) {
        referralContract = _referralContract;
        affiliateBadgeContract = _affiliateBadgeContract;
        treasury = _treasury;
        
        // Initial defaults
        nativeRootRegistrationFee = 0.05 ether; // 0.05 ETH
        badgeDiscountBps = 1000; // 10% discount
        
        // Default native tiers
        nativeTierPrices[1] = 0.01 ether; // Family: 0.01 ETH/month
        nativeTierPrices[2] = 0.03 ether; // Professional: 0.03 ETH/month
        nativeTierPrices[3] = 0.1 ether;  // Enterprise: 0.1 ETH/month
    }

    function setAddresses(
        address _referralContract,
        address _affiliateBadgeContract,
        address _treasury
    ) external onlyOwner {
        referralContract = _referralContract;
        affiliateBadgeContract = _affiliateBadgeContract;
        treasury = _treasury;
        emit AddressesUpdated(_referralContract, _affiliateBadgeContract, _treasury);
    }

    function setBadgeDiscount(uint256 _discountBps) external onlyOwner {
        require(_discountBps <= 5000, "LFDU: discount cannot exceed 50%");
        badgeDiscountBps = _discountBps;
        emit DiscountUpdated(_discountBps);
    }

    function setRegistrationFees(uint256 nativeFee, address token, uint256 tokenFee) external onlyOwner {
        nativeRootRegistrationFee = nativeFee;
        tokenRootRegistrationFees[token] = tokenFee;
        emit PriceUpdated("Registration", 0, address(0), nativeFee);
        if (token != address(0)) {
            emit PriceUpdated("Registration", 0, token, tokenFee);
        }
    }

    function setTierPrices(uint256 tier, uint256 nativePrice, address token, uint256 tokenPrice) external onlyOwner {
        nativeTierPrices[tier] = nativePrice;
        if (token != address(0)) {
            tokenTierPrices[token][tier] = tokenPrice;
        }
        emit PriceUpdated("Subscription", tier, address(0), nativePrice);
        if (token != address(0)) {
            emit PriceUpdated("Subscription", tier, token, tokenPrice);
        }
    }

    /**
     * @notice Helper to check if a user has an affiliate badge.
     */
    function hasAffiliateDiscount(address user) public view returns (bool) {
        if (affiliateBadgeContract == address(0)) return false;
        try IAffiliateBadge(affiliateBadgeContract).hasBadge(user) returns (bool result) {
            if (result) return true;
        } catch {}
        try IAffiliateBadge(affiliateBadgeContract).balanceOf(user) returns (uint256 balance) {
            return balance > 0;
        } catch {}
        return false;
    }

    /**
     * @notice Calculate price for a subscription tier with discount applied.
     */
    function getSubscriptionPrice(address user, address token, uint256 tier) public view returns (uint256) {
        uint256 basePrice = token == address(0) ? nativeTierPrices[tier] : tokenTierPrices[token][tier];
        if (hasAffiliateDiscount(user)) {
            return (basePrice * (10000 - badgeDiscountBps)) / 10000;
        }
        return basePrice;
    }

    /**
     * @notice Calculate price for a namespace root registration with discount applied.
     */
    function getRegistrationPrice(address user, address token) public view returns (uint256) {
        uint256 basePrice = token == address(0) ? nativeRootRegistrationFee : tokenRootRegistrationFees[token];
        if (hasAffiliateDiscount(user)) {
            return (basePrice * (10000 - badgeDiscountBps)) / 10000;
        }
        return basePrice;
    }

    /**
     * @notice Buy a subscription tier using native gas tokens (ETH/POL).
     */
    function purchaseSubscriptionWithNative(uint256 tier) external payable {
        uint256 price = getSubscriptionPrice(msg.sender, address(0), tier);
        require(msg.value >= price, "LFDU: Insufficient native payment");

        // Refund excess
        uint256 excess = msg.value - price;
        if (excess > 0) {
            payable(msg.sender).transfer(excess);
        }

        // Split revenue via referral engine
        if (referralContract != address(0)) {
            ILegacyReferral(referralContract).distributeNativeReward{value: price}(msg.sender);
        } else {
            payable(treasury != address(0) ? treasury : owner()).transfer(price);
        }

        emit SubscriptionPurchased(msg.sender, tier, address(0), price);
    }

    /**
     * @notice Buy a subscription tier using ERC-20 tokens (e.g. USDC).
     */
    function purchaseSubscriptionWithToken(address token, uint256 tier) external {
        require(token != address(0), "LFDU: Invalid token address");
        uint256 price = getSubscriptionPrice(msg.sender, token, tier);
        require(price > 0, "LFDU: Tier price is 0 for this token");

        // Pull tokens to this contract
        IERC20(token).safeTransferFrom(msg.sender, address(this), price);

        // Split revenue via referral engine
        if (referralContract != address(0)) {
            IERC20(token).approve(referralContract, price);
            ILegacyReferral(referralContract).distributeTokenReward(msg.sender, token, price);
        } else {
            IERC20(token).safeTransfer(treasury != address(0) ? treasury : owner(), price);
        }

        emit SubscriptionPurchased(msg.sender, tier, token, price);
    }

    /**
     * @notice Pay namespace registration fees using native gas tokens (ETH/POL).
     */
    function payRegistrationWithNative(string calldata label) external payable {
        uint256 price = getRegistrationPrice(msg.sender, address(0));
        require(msg.value >= price, "LFDU: Insufficient native payment");

        // Refund excess
        uint256 excess = msg.value - price;
        if (excess > 0) {
            payable(msg.sender).transfer(excess);
        }

        // Split revenue via referral engine
        if (referralContract != address(0)) {
            ILegacyReferral(referralContract).distributeNativeReward{value: price}(msg.sender);
        } else {
            payable(treasury != address(0) ? treasury : owner()).transfer(price);
        }

        emit NamespaceRegistrationPaid(msg.sender, label, address(0), price);
    }

    /**
     * @notice Pay namespace registration fees using ERC-20 tokens (e.g. USDC).
     */
    function payRegistrationWithToken(string calldata label, address token) external {
        require(token != address(0), "LFDU: Invalid token address");
        uint256 price = getRegistrationPrice(msg.sender, token);
        require(price > 0, "LFDU: Price is 0 for this token");

        // Pull tokens to this contract
        IERC20(token).safeTransferFrom(msg.sender, address(this), price);

        // Split revenue via referral engine
        if (referralContract != address(0)) {
            IERC20(token).approve(referralContract, price);
            ILegacyReferral(referralContract).distributeTokenReward(msg.sender, token, price);
        } else {
            IERC20(token).safeTransfer(treasury != address(0) ? treasury : owner(), price);
        }

        emit NamespaceRegistrationPaid(msg.sender, label, token, price);
    }
}

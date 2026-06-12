// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title MockTBAHelper
 * @notice Simplistic mock of an ERC-6551 Token Bound Account (TBA) wallet
 * to execute calls to external contracts (such as ERC-20 transfers) in tests.
 */
contract MockTBAHelper {
    /**
     * @notice Simulates ERC-6551 execute function.
     */
    function execute(
        address to,
        uint256 value,
        bytes calldata data,
        uint8 /* operation */
    ) external payable returns (bytes memory) {
        (bool success, bytes memory result) = to.call{value: value}(data);
        require(success, "MockTBAHelper: execution failed");
        return result;
    }

    // Support receiving native value
    receive() external payable {}
}

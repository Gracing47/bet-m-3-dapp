// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title MockToken
 * @dev An ERC20 token implementation for testing the BetM3 platform.
 * Allows minting tokens for testing purposes.
 */
contract MockToken is ERC20, Ownable {
    /**
     * @dev Constructor that initializes the token with name and symbol.
     */
    constructor() ERC20("BETM3 Mock Token", "BMT") {}

    /**
     * @dev Function to mint tokens to the specified address.
     * @param to The address that will receive the minted tokens.
     * @param amount The amount of tokens to mint.
     */
    function mint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
    }
} 
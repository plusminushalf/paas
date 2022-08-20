// SPDX-License-Identifier: MIT

pragma solidity 0.8.12;

import "@account-abstraction/contracts/samples/SimpleWallet.sol";

contract TestWallet is SimpleWallet {
    constructor(EntryPoint anEntryPoint, address anOwner)
        SimpleWallet(anEntryPoint, anOwner)
    {}
}

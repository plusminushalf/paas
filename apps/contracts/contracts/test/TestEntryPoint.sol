// SPDX-License-Identifier: MIT

pragma solidity 0.8.12;

import "@account-abstraction/contracts/EntryPoint.sol";

contract TestEntryPoint is EntryPoint {
    constructor(
        address _create2factory,
        uint256 _paymasterStake,
        uint32 _unstakeDelaySec
    ) EntryPoint(_create2factory, _paymasterStake, _unstakeDelaySec) {}
}

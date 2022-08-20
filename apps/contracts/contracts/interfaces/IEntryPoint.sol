// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.12;

/* solhint-disable reason-string */

interface IEntryPoint {
    function unstakeDelaySec() external view returns (uint32);

    function balanceOf(address account) external view returns (uint256);

    function depositTo(address account) external payable;

    function addStake(uint32 _unstakeDelaySec) external payable;

    function unlockStake() external;

    function withdrawStake(address payable withdrawAddress) external;

    function withdrawTo(address payable withdrawAddress, uint256 withdrawAmount)
        external;
}

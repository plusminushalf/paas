// SPDX-License-Identifier: MIT

pragma solidity ^0.8.12;

/* solhint-disable reason-string */

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

import "hardhat/console.sol";
import "./interfaces/IPaymaster.sol";
import "./interfaces/IEntryPoint.sol";

/**
 * Helper class for creating a paymaster.
 * provides helper methods for staking.
 * validates that the postOp is called only by the entryPoint
 */
abstract contract BasePaymaster is
    IPaymaster,
    Ownable,
    UUPSUpgradeable,
    Initializable
{
    IEntryPoint[] public entryPoints;

    constructor() {}

    function initialize(IEntryPoint[] memory _entryPoints, address owner)
        internal
    {
        entryPoints = _entryPoints;
        _transferOwnership(owner);
    }

    function _authorizeUpgrade(address) internal override onlyOwner {}

    function searchEntryPoint(IEntryPoint entryPoint)
        internal
        view
        returns (bool)
    {
        uint256 iterator;

        for (iterator = 0; iterator < entryPoints.length; iterator++) {
            if (entryPoints[iterator] == entryPoint) {
                return true;
            }
        }

        return false;
    }

    modifier validateEntryPoint(IEntryPoint entryPoint) {
        require(
            searchEntryPoint(entryPoint),
            "Invalid EntryPointContract, IEntryPoint is not authorised"
        );
        _;
    }

    function getEntryPoints() public view returns (IEntryPoint[] memory) {
        return entryPoints;
    }

    function setEntryPoint(IEntryPoint[] memory _entryPoints) public onlyOwner {
        entryPoints = _entryPoints;
    }

    function validatePaymasterUserOp(
        UserOperation calldata userOp,
        bytes32 requestId,
        uint256 maxCost
    )
        external
        view
        override
        validateEntryPoint(IEntryPoint(msg.sender))
        returns (bytes memory context)
    {
        return _validatePaymasterUserOp(userOp, requestId, maxCost);
    }

    function postOp(
        PostOpMode mode,
        bytes calldata context,
        uint256 actualGasCost
    ) external override validateEntryPoint(IEntryPoint(msg.sender)) {
        _postOp(mode, context, actualGasCost);
    }

    /**
     * post-operation handler.
     * (verified to be called only through the entryPoint)
     * @dev if subclass returns a non-empty context from validatePaymasterUserOp, it must also implement this method.
     * @param mode enum with the following options:
     *      opSucceeded - user operation succeeded.
     *      opReverted  - user op reverted. still has to pay for gas.
     *      postOpReverted - user op succeeded, but caused postOp (in mode=opSucceeded) to revert.
     *                       Now this is the 2nd call, after user's op was deliberately reverted.
     * @param context - the context value returned by validatePaymasterUserOp
     * @param actualGasCost - actual gas used so far (without this postOp call).
     */
    function _postOp(
        PostOpMode mode,
        bytes calldata context,
        uint256 actualGasCost
    ) internal virtual {
        (mode, context, actualGasCost); // unused params
        // subclass must override this method if validatePaymasterUserOp returns a context
        revert("must override");
    }

    function _validatePaymasterUserOp(
        UserOperation calldata userOp,
        bytes32 requestId,
        uint256 maxCost
    ) internal view virtual returns (bytes memory context) {
        (userOp, requestId, maxCost, context); // unused params
        // subclass must override this method if validatePaymasterUserOp returns a context
        revert("must override");
    }

    /**
     * add a deposit for this paymaster, used for paying for transaction fees
     */
    function deposit(IEntryPoint entryPoint)
        public
        payable
        validateEntryPoint(entryPoint)
    {
        entryPoint.depositTo{value: msg.value}(address(this));
    }

    /**
     * return current paymaster's deposit on the entryPoint.
     */
    function getDeposit(IEntryPoint entryPoint)
        public
        view
        validateEntryPoint(entryPoint)
        returns (uint256)
    {
        return entryPoint.balanceOf(address(this));
    }

    /**
     * withdraw value from the deposit
     * @param entryPoint entryPoint from which you want to withdraw
     * @param withdrawAddress target to send to
     * @param amount to withdraw
     */
    function withdrawTo(
        IEntryPoint entryPoint,
        address payable withdrawAddress,
        uint256 amount
    ) public onlyOwner validateEntryPoint(entryPoint) {
        entryPoint.withdrawTo(withdrawAddress, amount);
    }

    /**
     * add stake for this paymaster.
     * This method can also carry eth value to add to the current stake.
     * @param entryPoint entryPoint to which stake should be added
     * @param extraUnstakeDelaySec - set the stake to the entrypoint's default unstakeDelay plus this value.
     */
    function addStake(IEntryPoint entryPoint, uint32 extraUnstakeDelaySec)
        external
        payable
        validateEntryPoint(entryPoint)
    {
        entryPoint.addStake{value: msg.value}(
            entryPoint.unstakeDelaySec() + extraUnstakeDelaySec
        );
    }

    /**
     * unlock the stake, in order to withdraw it.
     * @param entryPoint entryPoint from which stake should be unlocked
     * The paymaster can't serve requests once unlocked, until it calls addStake again
     */
    function unlockStake(IEntryPoint entryPoint)
        external
        onlyOwner
        validateEntryPoint(entryPoint)
    {
        entryPoint.unlockStake();
    }

    /**
     * withdraw the entire paymaster's stake.
     * stake must be unlocked first (and then wait for the unstakeDelay to be over)
     * @param entryPoint entryPoint from which stake should be withdrawn
     * @param withdrawAddress the address to send withdrawn value.
     */
    function withdrawStake(
        IEntryPoint entryPoint,
        address payable withdrawAddress
    ) external onlyOwner validateEntryPoint(entryPoint) {
        entryPoint.withdrawStake(withdrawAddress);
    }
}

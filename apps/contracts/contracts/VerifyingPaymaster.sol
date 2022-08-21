// SPDX-License-Identifier: MIT

pragma solidity 0.8.12;

import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

import "./BasePaymaster.sol";
import "./UserOperation.sol";

contract VerifyingPaymaster is BasePaymaster {
    using ECDSA for bytes32;

    address public verifyingSigner;
    uint256 public maxCost;
    string public name;

    constructor() BasePaymaster() {}

    /**
     * @param _entryPoints Entry Point Contracts that this Paymaster trusts to forward the call.
     */
    function initialize(
        IEntryPoint[] memory _entryPoints,
        address _verifyingSigner,
        uint256 _maxCost,
        string calldata _name
    ) external initializer {
        initialize(_entryPoints, _verifyingSigner);
        verifyingSigner = _verifyingSigner;
        maxCost = _maxCost;
        name = _name;
    }

    /**
     * Function to change the maxCost you are ready to sponsor
     * @param _maxCost max cost in eth you are ready to sponsor
     */
    function changeMaxCost(uint256 _maxCost) external onlyOwner {
        maxCost = _maxCost;
    }

    /**
     * return the hash we're going to sign off-chain (and validate on-chain)
     * this method is called by the off-chain service, to sign the request.
     * it is called on-chain from the validatePaymasterUserOp, to validate the signature.
     * note that this signature covers all fields of the UserOperation, except the "paymasterData",
     * which will carry the signature itself.
     * @param userOp userOperation which we should hash
     */
    function getHash(UserOperation calldata userOp)
        public
        pure
        returns (bytes32)
    {
        //can't use userOp.hash(), since it contains also the paymasterData itself.
        return
            keccak256(
                abi.encode(
                    userOp.sender,
                    userOp.nonce,
                    keccak256(userOp.initCode),
                    keccak256(userOp.callData),
                    userOp.callGas,
                    userOp.verificationGas,
                    userOp.preVerificationGas,
                    userOp.maxFeePerGas,
                    userOp.maxPriorityFeePerGas,
                    userOp.paymaster
                )
            );
    }

    /**
     * payment validation: check if paymaster agree to pay (using its stake)
     * revert to reject this request.
     * actual payment is done after postOp is called, by deducting actual call cost form the paymaster's stake.
     * @param userOp the user operation
     * @param requestId hash of the user's request data.
     * @param _maxCost the maximum cost of this transaction (based on maximum gas and gas price from userOp)
     * @return context value to send to a postOp
     *  zero length to signify postOp is not required.
     */
    function _validatePaymasterUserOp(
        UserOperation calldata userOp,
        bytes32 requestId,
        uint256 _maxCost
    ) internal view override returns (bytes memory context) {
        (requestId);

        bytes32 hash = getHash(userOp);
        uint256 sigLength = userOp.paymasterData.length;

        require(
            _maxCost < maxCost,
            "maxCost must not be less than maxCost this paymaster can incurr"
        );

        require(
            sigLength == 64 || sigLength == 65,
            "VerifyingPaymaster: invalid signature length in paymasterData"
        );
        require(
            verifyingSigner ==
                hash.toEthSignedMessageHash().recover(userOp.paymasterData),
            "VerifyingPaymaster: wrong signature"
        );
        return "";
    }

    function _postOp(
        PostOpMode mode,
        bytes calldata context,
        uint256 actualGasCost
    ) internal override {}
}

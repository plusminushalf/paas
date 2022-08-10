// SPDX-License-Identifier: AGPL-3.0

pragma solidity 0.8.9;

import "@openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/math/SafeCast.sol";
import "hardhat/console.sol";

import "./IPaymaster.sol";
import "./PaymasterHelpers.sol";
import "./UserOperation.sol";
import "./helpers/Signatures.sol";
import "./helpers/UpgradeableACL.sol";

contract DappPaymaster is IPaymaster, UpgradeableACL {
    event InitializedPaymaster(string name, address verifyingSigner);

    using ECDSA for bytes32;
    using SafeERC20 for IERC20Metadata;
    using Signatures for UserOperation;
    using PaymasterHelpers for bytes;
    using PaymasterHelpers for PaymasterData;
    using PaymasterHelpers for UserOperation;

    // EntryPoint reference
    address public immutable entryPoint;
    address public verifyingSigner;
    address private sponsoredContract;
    string public name;

    modifier onlyOwner() {
        require(
            isOwner(msg.sender),
            "ACL: operation allowed only by the owner"
        );
        _;
    }

    /**
     * @dev Wallet's constructor
     * @param _entryPoint reference that will be hardcoded in the implementation contract
     */
    constructor(address _entryPoint) UpgradeableACL() {
        entryPoint = _entryPoint;
    }

    function entryPointInteraction(bytes calldata data)
        external
        payable
        onlyOwner
        returns (bool)
    {
        (bool success, bytes memory responseData) = entryPoint.call{
            value: msg.value
        }(data);
        console.log("resp %d", success ? 1 : 0);
        return success;
    }

    /**
     * return the hash we're going to sign off-chain (and validate on-chain)
     * this method is called by the off-chain service, to sign the request.
     * it is called on-chain from the validatePaymasterUserOp, to validate the signature.
     * note that this signature covers all fields of the UserOperation, except the "paymasterData",
     * which will carry the signature itself.
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
     * @dev Initializes the paymaster, this method can only be called only once
     * @param _owner Address that will be granted with the OWNER_ROLE (admin role)
     * @param _guardians Addresses that will be granted with the GUARDIANS_ROLE
     */
    function initialize(
        address _owner,
        address[] memory _guardians,
        address _verifyingSigner,
        string calldata _name
    ) external initializer {
        __UpgradeableACL__init(_owner, _guardians);
        verifyingSigner = _verifyingSigner;
        name = _name;

        emit InitializedPaymaster(name, verifyingSigner);
    }

    function nameOfPaymaster() external view returns (string memory) {
        return name;
    }

    /**
     * @dev Allows only calls from entry point
     */
    function isSenderAllowed(address account)
        public
        view
        override
        returns (bool)
    {
        return account == entryPoint;
    }

    function isContract(address addr) public view returns (bool) {
        uint256 size;
        assembly {
            size := extcodesize(addr)
        }
        return size > 0;
    }

    function setSponsoredContract(address _sponsoredContract)
        external
        onlyOwner
    {
        require(
            isContract(_sponsoredContract),
            "Invalid sponsoredContract address"
        );
        sponsoredContract = _sponsoredContract;
    }

    /**
     * @dev Verifies the paymaster data and pays the fee if the paymaster considers the operation valid
     * @param op operation to be validated
     * @param cost amount to be paid to the entry point in wei
     * @return context including the payment conditions: sender, token, exchange rate, and fees
     */
    function validatePaymasterUserOp(
        UserOperation calldata op,
        bytes32, /* requestId */
        uint256 cost
    ) external view override returns (bytes memory context) {
        bytes32 hash = getHash(op);

        console.log("hash");
        console.logBytes32(hash);
        uint256 sigLength = op.paymasterData.length;
        require(
            sigLength == 64 || sigLength == 65,
            "VerifyingPaymaster: invalid signature length in paymasterData"
        );
        require(
            verifyingSigner ==
                hash.toEthSignedMessageHash().recover(op.paymasterData),
            "VerifyingPaymaster: wrong signature"
        );

        //no need for other on-chain validation: entire UserOp should have been checked
        // by the external service prior to signing it.
        return "";
    }

    /**
     * @dev Executes the paymaster's payment conditions
     * @param mode tells whether the op succeeded, reverted, or if the op succeeded but cause the postOp to revert
     * @param context payment conditions signed by the paymaster in `validatePaymasterUserOp`
     * @param cost amount to be paid to the entry point in wei
     */
    function postOp(
        PostOpMode mode,
        bytes calldata context,
        uint256 cost
    ) external override authenticate {}

    /**
     * @dev This empty reserved space is put in place to allow future versions to add new
     * variables without shifting down storage in the inheritance chain.
     * See https://docs.openzeppelin.com/contracts/4.x/upgradeable#storage_gaps
     */
    uint256[50] private __gap;
}

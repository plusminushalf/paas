import { FunctionFragment, Result } from "@ethersproject/abi";
import { BytesLike, Contract, Overrides, utils } from "ethers";

export interface SingletonFactoryInterface extends utils.Interface {
  functions: {
    "deploy(bytes,bytes32)": FunctionFragment;
    "computeAddress(bytes,bytes32)": FunctionFragment;
  };
}

interface deployContract {
  (
    buteCode: BytesLike | undefined,
    salt: string,
    overides: Overrides
  ): Promise<Result>;
}

export interface SingletonFactory extends Contract {
  interface: SingletonFactoryInterface;
  deployContract: deployContract;
}

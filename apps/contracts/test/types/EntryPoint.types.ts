import { FunctionFragment } from "@ethersproject/abi";
import { BigNumber, Contract, utils } from "ethers";

export interface DepositInfo {
  deposit: BigNumber;
  staked: Boolean;
  stake: BigNumber;
  unstakeDelaySec: Number;
  withdrawTime: BigNumber;
}

export interface getDepositInfo {
  (address: string): Promise<DepositInfo>;
}

export interface EntryPoint extends Contract {
  getDepositInfo: getDepositInfo;
}

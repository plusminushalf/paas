import { Result } from "@ethersproject/abi";
import { BigNumber, Contract, PayableOverrides } from "ethers";

export interface VerifyingPaymaster extends Contract {
  getEntryPoints(): Promise<Array<string>>;
  initialize(_verifyingSigner: string, _maxCost: BigNumber): Promise<void>;
  setEntryPoint(entryPoints: string[]): Promise<Result>;
  addStake(
    entryPoint: string,
    extraUnstakeDelaySec: Number,
    overides?: PayableOverrides
  ): Promise<Result>;
  unlockStake(entryPoint: string): Promise<Result>;
  withdrawStake(
    entryPoint: string,
    withdrawAddress: string,
    overides?: PayableOverrides
  ): Promise<Result>;
  deposit(entryPoint: string, overides?: PayableOverrides): Promise<Result>;
  withdrawTo(
    entryPoint: string,
    withdrawAddress: string,
    amount: BigNumber
  ): Promise<Result>;
}

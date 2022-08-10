import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useContractReads } from "wagmi";
import "./paymasterListItem.css";
import entryPointArtifact from "../../artifacts/EntryPoint.json";
import paymasterArtifact from "../../artifacts/DappPaymaster.json";
import { ethers } from "ethers";
import classNames from "classnames";

const ENTRY_POINT_ADDRESS = process.env.REACT_APP_ENTRY_POINT_ADDRESS;
const entryPointContract = {
  addressOrName: ENTRY_POINT_ADDRESS,
  contractInterface: entryPointArtifact.abi,
};
const paymasterContract = {
  addressOrName: null,
  contractInterface: paymasterArtifact.abi,
};

const PaymasterListItem = ({ paymaster, expandedView }) => {
  let navigate = useNavigate();

  paymasterContract.addressOrName = paymaster.createdContract;

  console.log(paymasterContract);

  const { data, isLoading } = useContractReads({
    contracts: [
      {
        ...entryPointContract,
        functionName: "isStaked",
        args: [paymaster.createdContract],
      },
      {
        ...entryPointContract,
        functionName: "getDeposit",
        args: [paymaster.createdContract],
      },
      {
        ...paymasterContract,
        functionName: "nameOfPaymaster",
      },
    ],
  });

  console.log(data, isLoading);

  return (
    <div
      className={classNames("paymaster-item", {
        "paymaster-item-pointer": !expandedView,
      })}
      onClick={() =>
        !expandedView && navigate(`/paymasters/${paymaster.createdContract}`)
      }
    >
      {isLoading ? null : (
        <div>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <h2 style={{ fontWeight: 400 }}>{data[2] || "No name"}</h2>
            <h2>
              {ethers.utils.formatEther(data[1].amount.toNumber())}
              <span>ETH</span>
            </h2>
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            <div
              style={{
                marginTop: -32,
              }}
            >
              <p style={{ color: "#999292" }}>
                {paymaster.createdContract.substr(0, 16)}...
              </p>
            </div>

            <div
              style={{
                marginTop: expandedView ? -18 : -32,
              }}
            >
              {expandedView ? (
                <a
                  href="#deposit"
                  style={{ color: "" }}
                  onClick={() =>
                    navigate(`/paymasters/${paymaster.createdContract}/deposit`)
                  }
                >
                  ADD DEPOSIT
                </a>
              ) : (
                <p style={{ color: "#999292" }}>Deposit</p>
              )}
            </div>
          </div>
          <div
            style={{
              width: "100%",
              height: 1,
              background: "#e8e5e5",
              margin: "5px 0px",
            }}
          ></div>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <p># of Transactions</p>
            <p>50</p>
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginTop: -16,
            }}
          >
            <p>Gas sponsored</p>
            <p>0.45 ETH</p>
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginTop: -16,
            }}
          >
            <p>Staked</p>
            <p>{data[0] ? "true" : "false"}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymasterListItem;

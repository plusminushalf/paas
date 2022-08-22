import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useContractReads } from "wagmi";
import "./paymasterListItem.css";
import entryPointArtifact from "../../artifacts/EntryPoint.json";
import paymasterArtifact from "../../artifacts/VerifyingPaymaster.json";
import { ethers } from "ethers";
import classNames from "classnames";
import { Button } from "../Button/Button";

const ENTRY_POINT_ADDRESS = process.env.REACT_APP_ENTRY_POINT_ADDRESS;
const entryPointContract = {
  addressOrName: ENTRY_POINT_ADDRESS,
  contractInterface: entryPointArtifact.abi,
};
const paymasterContract = {
  addressOrName: null,
  contractInterface: paymasterArtifact.abi,
};

const StakedPaymasterListItem = ({
  expandedView,
  paymaster,
  isLoading,
  deposit,
  name,
}) => {
  let navigate = useNavigate();
  return (
    <div
      className={classNames("paymaster-item", {
        "paymaster-item-pointer": !expandedView,
      })}
      onClick={() => navigate(`/paymasters/${paymaster.createdContract}`)}
    >
      {isLoading ? null : (
        <div>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <div
              style={{
                flexDirection: "column",
                display: "flex",
                justifyContent: "center",
              }}
            >
              <h2 style={{ fontWeight: 400 }}>{name || "No name"}</h2>
              <div
                style={{
                  marginTop: -32,
                }}
              >
                <p style={{ color: "#999292" }}>
                  {paymaster.createdContract.substr(0, 16)}...
                </p>
              </div>
            </div>
            <div
              style={{
                flexDirection: "column",
                display: "flex",
                justifyContent: "center",
              }}
            >
              <Button
                onClick={(e) => {
                  navigate(`/paymasters/${paymaster.createdContract}/deposit`);
                  e.stopPropagation();
                }}
              >
                ADD DEPOSIT
              </Button>
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
          <div
            style={{
              marginTop: 20,
              display: "flex",
              justifyContent: "center",
              alightItems: "center",
            }}
          ></div>
          <>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <p>Deposit</p>
              <p>{ethers.utils.formatEther(deposit.amount)} ETH</p>
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginTop: -16,
              }}
            >
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
              <p>STAKED</p>
            </div>
          </>
        </div>
      )}
    </div>
  );
};

const UnStakedPaymasterListItem = ({
  isLoading,
  paymaster,
  name,
  expandedView,
}) => {
  let navigate = useNavigate();

  return (
    <div
      className={classNames("paymaster-item", {
        "paymaster-item-pointer": !expandedView,
      })}
      onClick={() => navigate(`/paymasters/${paymaster.createdContract}`)}
    >
      {isLoading ? null : (
        <div>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <div
              style={{
                flexDirection: "column",
                display: "flex",
                justifyContent: "center",
              }}
            >
              <h2 style={{ fontWeight: 400 }}>{name || "No name"}</h2>
              <div
                style={{
                  marginTop: -16,
                }}
              >
                <p style={{ color: "#999292" }}>
                  {paymaster.createdContract.substr(0, 16)}...
                </p>
              </div>
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Button
                onClick={(e) => {
                  navigate(`/paymasters/${paymaster.createdContract}/stake`);
                  e.stopPropagation();
                }}
              >
                ADD STAKE
              </Button>
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
          <p style={{ color: "red" }}>
            A paymaster must be staked for it to start working, click on add
            stake to start your paymaster
          </p>
        </div>
      )}
    </div>
  );
};

const PaymasterListItem = ({ paymaster, expandedView = false }) => {
  let navigate = useNavigate();

  paymasterContract.addressOrName = paymaster.createdContract;

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
        functionName: "name",
      },
    ],
  });

  const [staked, deposit, name] = data;

  return staked ? (
    <StakedPaymasterListItem
      isLoading={isLoading}
      deposit={deposit}
      name={name}
      paymaster={paymaster}
      expandedView={expandedView}
    />
  ) : (
    <UnStakedPaymasterListItem
      isLoading={isLoading}
      name={name}
      paymaster={paymaster}
      expandedView={expandedView}
    />
  );
};

export default PaymasterListItem;

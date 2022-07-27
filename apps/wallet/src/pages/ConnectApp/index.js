import { ConnectButton } from "@rainbow-me/rainbowkit";
import React from "react";
import Button from "../../components/Button";

const ConnectApp = () => {
  return (
    <div className="App">
      <div
        style={{
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            flexDirection: "column",
            display: "flex",
            alignItems: "baseline",
            width: "40%",
            textAlign: "left",
          }}
        >
          <h1>SPONSOR GAS FEES</h1>
          <p>Make web3 journey for users simpler.</p>
          <p>
            Create your first paymaster today and start sponsoring gas for your
            users now.
          </p>
          <div style={{ marginTop: 30 }}>
            <ConnectButton />
            <Button>Connect Wallet</Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConnectApp;

import React from "react";
import { useDisconnect } from "wagmi";
import Button from "../../components/Button";

const Dashboard = () => {
  const { disconnect } = useDisconnect();

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
          <h1>Create your first Paymaster</h1>
          <p>
            A paymaster is a contract that sponsors gas fees on your behalf.
          </p>
          <p>
            Want to know how?{" "}
            <a href="https://mirror.xyz/plusminushalf.eth/LQsNKCDz5vqggOQ1U3uLR6SuJAL8A1wvuqOySGR2ars">
              Read here
            </a>
          </p>
          <div style={{ marginTop: 30 }}>
            <Button>Create Paymaster</Button>
            <p
              onClick={disconnect}
              style={{
                fontSize: 12,
                fontWeight: 300,
                cursor: "pointer",
                textDecoration: "underline",
              }}
            >
              Disconnect wallet
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

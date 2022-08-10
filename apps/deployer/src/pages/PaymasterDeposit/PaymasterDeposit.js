import { faAngleLeft } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Contract, ethers } from "ethers";
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAccount, useSigner } from "wagmi";
import { Button } from "../../components/Button/Button";
import TransactionStatus from "../../components/TransactionStatus.js/TransactionStatus";
import EntryPointArtifact from "../../artifacts/EntryPoint.json";
import PaymasterArtifact from "../../artifacts/DappPaymaster.json";

const { default: Dashboard } = require("../../components/Dashboard/Dashboard");

const UNCLOCK_DELAY = 5 * 60;

const PaymasterDeposit = () => {
  const { isConnected } = useAccount();
  const [amount, setAmount] = useState(undefined);
  const [loading, setLoading] = useState(false);
  const [transaction, setTransaction] = useState(null);
  const { data: signer } = useSigner();

  const navigate = useNavigate();
  const { address } = useParams();

  const addStake = async () => {
    setLoading(1);
    if (isConnected) {
      const PaymasterContract = new Contract(
        address,
        PaymasterArtifact.abi,
        signer
      );

      const EntryPointContract = new Contract(
        process.env.REACT_APP_ENTRY_POINT_ADDRESS,
        EntryPointArtifact.abi,
        signer
      );

      try {
        const transaction = await PaymasterContract.entryPointInteraction(
          EntryPointContract.interface.encodeFunctionData("addStake", [
            UNCLOCK_DELAY,
          ]),
          {
            value: ethers.utils.parseEther(amount),
          }
        );
        setTransaction(transaction);
        setLoading(2);
      } catch (e) {
        setLoading(0);
      }
    } else {
      setLoading(0);
    }
  };

  const onKeyDown = (e) => {
    if (e.key === "Enter") {
      addStake();
    }
  };

  return (
    <Dashboard>
      <div style={{ width: "50%" }}>
        <div
          style={{ display: "flex", cursor: "pointer", marginBottom: 30 }}
          onClick={() => navigate(`/paymasters/${address}`)}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              marginRight: 20,
            }}
          >
            <FontAwesomeIcon size="xl" icon={faAngleLeft} />
          </div>
          <h1>Deposit ETH</h1>
        </div>
        <input
          value={amount}
          onKeyDown={onKeyDown}
          onChange={(e) => setAmount(e.target.value)}
          autoFocus
          style={{
            width: "100%",
            marginTop: 40,
            fontSize: 18,
            padding: 10,
          }}
          placeholder={"Amount in ETH"}
        />
        <Button
          disabled={!(amount > 0)}
          loading={loading}
          style={{ marginTop: 50 }}
          onClick={addStake}
        >
          {loading <= 1 ? (
            `Add deposit`
          ) : (
            <TransactionStatus
              transaction={transaction.hash}
              sendTransactionData={() => navigate(`/paymasters/${address}`)}
            />
          )}
        </Button>
      </div>
    </Dashboard>
  );
};

export default PaymasterDeposit;

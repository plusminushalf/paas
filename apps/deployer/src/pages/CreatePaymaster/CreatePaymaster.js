import { useEffect, useState } from "react";
import { newPaymasterConfig } from "../../api";
import { Button } from "../../components/Button/Button";
import {
  useAccount,
  useNetwork,
  useSigner,
  useWaitForTransaction,
} from "wagmi";
import { ContractFactory, Contract, ethers } from "ethers";
import ProxyFactory from "../../artifacts/DappPaymasterProxy.json";
import DappPaymaster from "../../artifacts/DappPaymaster.json";
import SingletonFactory from "../../artifacts/SingletonFactory.json";
import Dashboard from "../../components/Dashboard/Dashboard";

import { faAngleLeft } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useNavigate } from "react-router-dom";
import TransactionStatus from "../../components/TransactionStatus.js/TransactionStatus";

const CreateIntent = ({ stage, setStage }) => {
  const navigate = useNavigate();

  return (
    <div
      style={{
        marginTop: 100,
        flexDirection: "column",
        display: "flex",
        alignItems: "baseline",
        width: "40%",
        textAlign: "left",
      }}
    >
      <div
        style={{ display: "flex", cursor: "pointer" }}
        onClick={() => navigate("/paymasters")}
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
        <h1>Create your first Paymaster</h1>
      </div>
      <p>A paymaster is a contract that sponsors gas fees on your behalf.</p>
      <p>
        Want to know how?{" "}
        <a href="https://mirror.xyz/plusminushalf.eth/LQsNKCDz5vqggOQ1U3uLR6SuJAL8A1wvuqOySGR2ars">
          Read here
        </a>
      </p>
      <div style={{ marginTop: 30, display: "flex" }}>
        <Button onClick={() => setStage(stage + 1)}>Start now</Button>
      </div>
    </div>
  );
};

const NamePaymaster = ({ stage, setStage }) => {
  const { address, isConnected } = useAccount();
  const [name, setName] = useState("");
  const [transaction, setTransaction] = useState(null);

  const navigate = useNavigate();
  const { data: signer } = useSigner();

  const [loading, setLoading] = useState(0);

  const createPaymaster = async () => {
    setLoading(1);
    if (isConnected) {
      const DappPaymasterProxyFactory = new ContractFactory(
        ProxyFactory.abi,
        ProxyFactory.bytecode,
        signer
      );

      const DappPaymasterFactory = new ContractFactory(
        DappPaymaster.abi,
        DappPaymaster.bytecode
      );

      const DeployFactory = new Contract(
        process.env.REACT_APP_FACTORY_ADDRESS,
        SingletonFactory.abi,
        signer
      );

      const DappPaymasterInterface = DappPaymasterFactory.interface;

      const DappPaymasterProxyDeployTransacton =
        DappPaymasterProxyFactory.getDeployTransaction(
          process.env.REACT_APP_PAYMASTER_IMPLEMENTATION,
          DappPaymasterInterface.encodeFunctionData("initialize", [
            address,
            [],
            address,
            name,
          ])
        ).data;

      const PaymasterSalt = ethers.utils.formatBytes32String(
        String.fromCharCode(Date.now())
      );
      try {
        const transaction = await DeployFactory.deploy(
          DappPaymasterProxyDeployTransacton,
          PaymasterSalt
        );
        console.log(transaction);
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
      createPaymaster();
    }
  };

  return (
    <div
      style={{
        marginTop: 50,
        flexDirection: "column",
        display: "flex",
        alignItems: "baseline",
        width: "40%",
        textAlign: "left",
      }}
    >
      <div
        style={{ display: "flex", cursor: "pointer" }}
        onClick={() => setStage(stage - 1)}
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
        <h1>Name your Paymaster</h1>
      </div>
      <input
        value={name}
        onKeyDown={onKeyDown}
        onChange={(e) => setName(e.target.value)}
        autoFocus
        style={{
          width: "100%",
          marginTop: 40,
          fontSize: 18,
          padding: 10,
        }}
        placeholder={"Ex: Sponsor testnet deployments"}
      />
      <Button
        disabled={name === ""}
        loading={loading}
        style={{ marginTop: 50 }}
        onClick={createPaymaster}
      >
        {loading <= 1 ? (
          `Create Paymaster`
        ) : (
          <TransactionStatus
            transaction={transaction.hash}
            sendTransactionData={(transaction) =>
              navigate(`/paymasters/${transaction.createdContract}`)
            }
          />
        )}
      </Button>
    </div>
  );
};

const CreatePaymaster = () => {
  const [stage, setStage] = useState(0);

  return (
    <Dashboard loading={false}>
      {stage === 0 ? <CreateIntent stage={stage} setStage={setStage} /> : null}
      {stage === 1 ? <NamePaymaster stage={stage} setStage={setStage} /> : null}
    </Dashboard>
  );
};

export default CreatePaymaster;

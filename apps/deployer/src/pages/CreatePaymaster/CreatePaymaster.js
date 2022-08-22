import { useEffect, useState } from "react";
import { Button } from "../../components/Button/Button";
import { useAccount, useSigner } from "wagmi";
import { ContractFactory, Contract, ethers } from "ethers";
import PaymasterProxy from "../../deployer-artifacts/PaymasterProxy.json";
import VerifyingPaymaster from "../../deployer-artifacts/VerifyingPaymaster.json";
import SingletonFactory from "../../deployer-artifacts/SingletonFactory.json";
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
        <Button onClick={() => setStage({ ...stage, step: stage.step + 1 })}>
          Start now
        </Button>
      </div>
    </div>
  );
};

const NamePaymaster = ({ stage, setStage }) => {
  const [name, setName] = useState(stage.data?.name || "");

  const onKeyDown = (e) => {
    if (e.key === "Enter") {
      setStage({
        step: stage.step + 1,
        data: { ...stage.data, name },
      });
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
        onClick={() => setStage({ ...stage, step: stage.step - 1 })}
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
        style={{ marginTop: 50 }}
        onClick={() =>
          setStage({
            step: stage.step + 1,
            data: { ...stage.data, name },
          })
        }
      >
        Add Verifier
      </Button>
    </div>
  );
};

const AddVerifier = ({ stage, setStage }) => {
  const { isConnected } = useAccount();
  const [verifier, setVerifier] = useState(stage.data?.verifier || "");
  const [error, setError] = useState("");
  const [transaction, setTransaction] = useState(null);

  const navigate = useNavigate();
  const { data: signer } = useSigner();

  const [loading, setLoading] = useState(0);

  const createPaymaster = async () => {
    if (!ethers.utils.isAddress(verifier)) {
      console.log("error?");
      setError("Invalid address");
      return;
    }
    setError("");
    if (!isConnected) {
      console.log("not connected?");
      alert("connect wallet again");
      return;
    }
    console.log("no prob fuck?");
    setLoading(1);
    const VerifyingPaymasterProxyFactory = new ContractFactory(
      PaymasterProxy.abi,
      PaymasterProxy.bytecode,
      signer
    );

    const VerifyingPaymasterFactory = new ContractFactory(
      VerifyingPaymaster.abi,
      VerifyingPaymaster.bytecode
    );

    const DeployFactory = new Contract(
      process.env.REACT_APP_FACTORY_ADDRESS,
      SingletonFactory.abi,
      signer
    );

    const VerifyingPaymasterInterface = VerifyingPaymasterFactory.interface;

    const entryPoints = [process.env.REACT_APP_ENTRY_POINT_ADDRESS];
    const maxCost = ethers.utils.parseEther("5");

    console.log(process.env.REACT_APP_PAYMASTER_IMPLEMENTATION);

    const VerifyingPaymasterProxyDeployTransacton =
      VerifyingPaymasterProxyFactory.getDeployTransaction(
        process.env.REACT_APP_PAYMASTER_IMPLEMENTATION,
        VerifyingPaymasterInterface.encodeFunctionData("initialize", [
          entryPoints,
          verifier,
          maxCost,
          stage.data.name,
        ])
      ).data;

    const PaymasterSalt = ethers.utils.formatBytes32String(
      String.fromCharCode(Date.now())
    );
    try {
      const transaction = await DeployFactory.deployContract(
        VerifyingPaymasterProxyDeployTransacton,
        PaymasterSalt
      );
      setTransaction(transaction);
      setLoading(2);
    } catch (e) {
      console.log(e, "here");
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
        onClick={() => setStage({ ...stage, step: stage.step - 1 })}
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
        <h1>Add verifier</h1>
      </div>
      <p>
        Verifier is the address with which you sign the transaction that has to
        be sponsored. You will need to configure our SDK with the private key of
        the verifier you will add below.
      </p>
      <input
        value={verifier}
        onKeyDown={onKeyDown}
        onChange={(e) => setVerifier(e.target.value)}
        autoFocus
        style={{
          width: "100%",
          marginTop: 40,
          fontSize: 18,
          padding: 10,
        }}
        placeholder={"Ex: 0x26f3eD2818569c2c35BA456317916670abecf18B"}
      />
      {error ? (
        <div style={{ marginTop: 10, color: "red" }}>{error}</div>
      ) : null}
      <Button
        disabled={verifier === ""}
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
  const [stage, setStage] = useState({ step: 0, data: null });

  return (
    <Dashboard loading={false}>
      {stage.step === 0 ? (
        <CreateIntent stage={stage} setStage={setStage} />
      ) : null}
      {stage.step === 1 ? (
        <NamePaymaster stage={stage} setStage={setStage} />
      ) : null}
      {stage.step === 2 ? (
        <AddVerifier stage={stage} setStage={setStage} />
      ) : null}
    </Dashboard>
  );
};

export default CreatePaymaster;

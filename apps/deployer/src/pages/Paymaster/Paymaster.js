import { useNavigate, useParams } from "react-router-dom";
import { useContractReads } from "wagmi";
import Dashboard from "../../components/Dashboard/Dashboard";
import entryPointArtifact from "../../deployer-artifacts/EntryPoint.json";
import PaymasterListItem from "../../components/PaymasterListItem/PaymasterListItem";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAngleLeft } from "@fortawesome/free-solid-svg-icons";

const ENTRY_POINT_ADDRESS = process.env.REACT_APP_ENTRY_POINT_ADDRESS;
const entryPointContract = {
  addressOrName: ENTRY_POINT_ADDRESS,
  contractInterface: entryPointArtifact.abi,
};

const Paymaster = () => {
  const { address: paymasterAddress } = useParams();
  const navigate = useNavigate();

  return (
    <Dashboard>
      <div style={{ width: "50%" }}>
        <div
          style={{ display: "flex", cursor: "pointer", marginBottom: 30 }}
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
          <h1>Paymaster</h1>
        </div>
        <PaymasterListItem
          paymaster={{ createdContract: paymasterAddress }}
          expandedView={true}
        />
      </div>
    </Dashboard>
  );
};

export default Paymaster;

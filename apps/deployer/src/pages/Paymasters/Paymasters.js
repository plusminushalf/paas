import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useAccount } from "wagmi";
import { getDeployedPaymaster } from "../../api";
import CreateNewPaymaster from "../../components/CreateNewPaymaster/CreateNewPaymaster";
import Dashboard from "../../components/Dashboard/Dashboard";
import PaymasterListItem from "../../components/PaymasterListItem/PaymasterListItem";

export const Paymasters = () => {
  const { address } = useAccount();
  const [loading, setLoading] = useState(true);
  const [paymasters, setPaymasters] = useState([]);

  useEffect(() => {
    getDeployedPaymaster(address).then(
      ({ data: { exampleEntities: _paymasters } }) => {
        if (_paymasters.length > 0) {
          setPaymasters(_paymasters);
        }
        setLoading(false);
      }
    );
  }, [address]);

  return (
    <Dashboard loading={loading}>
      {paymasters.length === 0 ? <Navigate to="/create" replace /> : null}

      {paymasters.length > 0 ? (
        <div style={{ width: "50%" }}>
          <h1 style={{ marginBottom: 60 }}>Paymasters</h1>
          <CreateNewPaymaster />
          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit, minmax(min(100%/1, max(300px, 100%/1)), 1fr))",
            }}
          >
            {paymasters.map((paymaster) => (
              <PaymasterListItem key={paymaster.id} paymaster={paymaster} />
            ))}
          </div>
        </div>
      ) : null}
    </Dashboard>
  );
};

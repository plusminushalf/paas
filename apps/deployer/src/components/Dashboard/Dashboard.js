import { ConnectButton } from "@rainbow-me/rainbowkit";
import { faSpinner } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const Dashboard = ({ loading, children }) => {
  return (
    <div className="App">
      <div
        style={{
          display: "flex",
          flexDirection: "row-reverse",
          paddingTop: 30,
          marginRight: 30,
        }}
      >
        <ConnectButton />
      </div>
      <div
        style={{
          marginTop: loading ? -70 : 100,
          height: loading ? "100%" : null,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {loading ? (
          <FontAwesomeIcon
            size="xl"
            icon={faSpinner}
            spin
            style={{ marginRight: 10 }}
          />
        ) : null}
        {!loading ? children : null}
        {/* {!paymasters && !loading ? <CreatePaymaster /> : null} */}
        {/* {paymasters && !loading ? <Paymasters /> : null} */}
      </div>
    </div>
  );
};

export default Dashboard;

import { useNavigate } from "react-router-dom";

const CreateNewPaymaster = () => {
  let navigate = useNavigate();

  return (
    <div className="paymaster-item" onClick={() => navigate(`/create`)}>
      <div
        style={{ display: "flex", justifyContent: "space-between", padding: 0 }}
      >
        <h4 style={{ fontWeight: 400 }}>Create paymaster</h4>
        <h4 style={{ fontWeight: 400 }}>+ new</h4>
      </div>
    </div>
  );
};

export default CreateNewPaymaster;

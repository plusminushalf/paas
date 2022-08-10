import { Navigate } from "react-router-dom";

const Protected = ({ authenticated, children }) => {
  if (!authenticated) {
    return <Navigate to="/connect" replace />;
  }
  return children;
};

export default Protected;

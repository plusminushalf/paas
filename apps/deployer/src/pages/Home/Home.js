import React from "react";
import ConnectApp from "../ConnectApp";
import { useAccount } from "wagmi";
import ProtectedRoute from "../../components/ProtectedRoute/ProtectedRoute";
import { Route, Routes } from "react-router-dom";
import CreatePaymaster from "../CreatePaymaster/CreatePaymaster";
import { Paymasters } from "../Paymasters/Paymasters";
import Paymaster from "../Paymaster/Paymaster";
import PaymasterDeposit from "../PaymasterDeposit/PaymasterDeposit";

const Home = () => {
  const { isConnected } = useAccount();

  return (
    <Routes>
      <Route path="/" element={<ConnectApp />} />

      <Route path="/connect" element={<ConnectApp />} />

      <Route
        path="/create"
        element={
          <ProtectedRoute authenticated={isConnected}>
            <CreatePaymaster />
          </ProtectedRoute>
        }
      />

      <Route
        path="/paymasters"
        element={
          <ProtectedRoute authenticated={isConnected}>
            <Paymasters />
          </ProtectedRoute>
        }
      />

      <Route
        path="/paymasters/:address"
        element={
          <ProtectedRoute authenticated={isConnected}>
            <Paymaster />
          </ProtectedRoute>
        }
      />

      <Route
        path="/paymasters/:address/deposit"
        element={
          <ProtectedRoute authenticated={isConnected}>
            <PaymasterDeposit />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
};

export default Home;

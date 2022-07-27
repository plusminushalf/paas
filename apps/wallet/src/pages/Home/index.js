import React from "react";
import ConnectApp from "../ConnectApp";
import { useAccount } from "wagmi";
import Dashboard from "../Dashboard";

const Home = () => {
  const { isConnected } = useAccount();

  return isConnected ? <Dashboard /> : <ConnectApp />;
};

export default Home;

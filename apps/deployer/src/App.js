import React, { useMemo } from "react";

import {
  getDefaultWallets,
  RainbowKitProvider,
  lightTheme,
} from "@rainbow-me/rainbowkit";
import { chain, configureChains, createClient, WagmiConfig } from "wagmi";
import { alchemyProvider } from "wagmi/providers/alchemy";
import { publicProvider } from "wagmi/providers/public";
import { BrowserRouter } from "react-router-dom";

import Home from "./pages/Home/Home";

import "@rainbow-me/rainbowkit/styles.css";
import "./App.css";

const { chains, provider } = configureChains(
  [chain.polygonMumbai],
  [
    alchemyProvider({ alchemyId: "q9At33mdEyw2XwWQaDO6HAi_eya8A4Gj" }),
    publicProvider(),
  ]
);

const { connectors } = getDefaultWallets({
  appName: "My RainbowKit App",
  chains,
});

const wagmiClient = createClient({
  autoConnect: true,
  connectors,
  provider,
});

export default function App() {
  const theme = useMemo(() => lightTheme(), []);
  theme.fonts.body = "'Roboto Mono', monospace";

  return (
    <React.StrictMode>
      <BrowserRouter>
        <WagmiConfig client={wagmiClient}>
          <RainbowKitProvider theme={theme} chains={chains}>
            <Home />
          </RainbowKitProvider>
        </WagmiConfig>
      </BrowserRouter>
    </React.StrictMode>
  );
}

import { getWalletConnectConnector } from "@rainbow-me/rainbowkit";

export const Stackup = ({ chains }) => ({
  id: "stackup",
  name: "Stackup",
  iconUrl: "460x0w.webp",
  iconBackground: "#0c2f78",
  downloadUrls: {
    android: "https://play.google.com/store/apps/details?id=com.stackup",
    ios: "https://apps.apple.com/us/app/stackup-wallet/id1625533996",
    qrCode: "https://my-wallet/qr",
  },
  createConnector: () => {
    const connector = getWalletConnectConnector({ chains });
    return {
      connector,
      mobile: {
        getUri: async () => {
          const { uri } = (await connector.getProvider()).connector;
          console.log(uri);
          return uri;
        },
      },
      qrCode: {
        getUri: async () => (await connector.getProvider()).connector.uri,
        instructions: {
          learnMoreUrl: "https://my-wallet/learn-more",
          steps: [
            {
              description:
                "We recommend putting My Wallet on your home screen for faster access to your wallet.",
              step: "install",
              title: "Open the My Wallet app",
            },
            {
              description:
                "After you scan, a connection prompt will appear for you to connect your wallet.",
              step: "scan",
              title: "Tap the scan button",
            },
          ],
        },
      },
    };
  },
});

import { useWaitForTransaction } from "wagmi";

const TransactionStatus = ({ transaction, sendTransactionData }) => {
  const { data, isLoading } = useWaitForTransaction({
    hash: transaction,
  });

  if (!isLoading) sendTransactionData(data);

  return <>{isLoading ? `Processing Transaction` : `Transaction Processed`}</>;
};

export default TransactionStatus;

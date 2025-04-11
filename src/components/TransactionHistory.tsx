import { useEffect, useState } from 'react';
import { useAccount, usePublicClient } from 'wagmi';
import { formatEther } from 'viem';

interface Transaction {
  hash: string;
  from: string;
  to: string | null;
  value: string;
  timestamp: number;
  network: string;
}

export function TransactionHistory() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { address } = useAccount();
  const publicClient = usePublicClient();

  useEffect(() => {
    async function fetchTransactions() {
      if (!address || !publicClient) return;

      setIsLoading(true);
      try {
        // Fetch the latest block number
        const latestBlock = await publicClient.getBlockNumber();
        // Get transactions from the last 1000 blocks
        const fromBlock = latestBlock - BigInt(1000);
        
        // Get sent transactions
        const sentLogs = await publicClient.getTransactionCount({
          address: address,
        });

        // Get received transactions
        const receivedLogs = await publicClient.getBlockTransactionCount({
          blockNumber: latestBlock,
        });

        const chainId = await publicClient.getChainId();
        const networkName = getNetworkName(chainId);

        // Format transactions
        const formattedTransactions: Transaction[] = [];
        // Add implementation here when the data is fetched

        setTransactions(prev => [...prev, ...formattedTransactions]);
      } catch (error) {
        console.error('Error fetching transactions:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchTransactions();
  }, [address, publicClient]);

  function getNetworkName(chainId: number): string {
    switch (chainId) {
      case 1:
        return 'Ethereum';
      case 137:
        return 'Polygon';
      case 2632500:
        return 'COTI';
      case 11155111:
        return 'Sepolia';
      default:
        return 'Unknown';
    }
  }

  if (!address) {
    return <div className="p-4">Please connect your wallet to view transaction history.</div>;
  }

  if (isLoading) {
    return <div className="p-4">Loading transactions...</div>;
  }

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Transaction History</h2>
      <div className="space-y-4">
        {transactions.length === 0 ? (
          <p>No transactions found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Network</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hash</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">From</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">To</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Value</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {transactions.map((tx, index) => (
                  <tr key={tx.hash + index}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{tx.network}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-blue-500">
                      <a href={`https://etherscan.io/tx/${tx.hash}`} target="_blank" rel="noopener noreferrer">
                        {tx.hash.substring(0, 10)}...
                      </a>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-mono">{tx.from.substring(0, 10)}...</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-mono">{tx.to ? `${tx.to.substring(0, 10)}...` : 'N/A'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">{tx.value} ETH</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

interface TransactionStatsProps {
  totalTransactions: number;
  totalSpent: number;
  totalEarned: number;
}

export default function TransactionStats({ totalTransactions, totalSpent, totalEarned }: TransactionStatsProps) {
  return (
    <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-2xl p-8 mb-6 shadow-lg">
      <div className="grid grid-cols-3 divide-x divide-gray-700">
        <div className="text-center">
          <p className="text-gray-400 text-sm mb-2">Transactions</p>
          <p className="text-4xl font-bold text-white">{totalTransactions}</p>
        </div>
        <div className="text-center">
          <p className="text-gray-400 text-sm mb-2">Total spent</p>
          <p className="text-4xl font-bold text-white">${totalSpent.toLocaleString()}</p>
        </div>
        <div className="text-center">
          <p className="text-gray-400 text-sm mb-2">Total earned</p>
          <p className="text-4xl font-bold text-teal-400">+${totalEarned.toLocaleString()}</p>
        </div>
      </div>
    </div>
  );
}

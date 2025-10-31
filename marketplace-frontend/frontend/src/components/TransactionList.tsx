'use client';

import { MapPin, LayoutGrid, Clock, Eye } from 'lucide-react';

interface Transaction {
  id: string;
  time: string;
  location: string;
  places: number;
  units: number;
  amount: number;
  status: string;
}

interface TransactionListProps {
  onTransactionClick: () => void;
}

export default function TransactionList({ onTransactionClick }: TransactionListProps) {
  const todayTransactions: Transaction[] = [
    {
      id: '1',
      time: '11:38 AM',
      location: 'Sokoto, senegal',
      places: 1000,
      units: 10000,
      amount: -4000,
      status: 'Purchase',
    },
    {
      id: '2',
      time: '11:38 AM',
      location: 'Sokoto, senegal',
      places: 1000,
      units: 10000,
      amount: -4000,
      status: 'Purchase',
    },
    {
      id: '3',
      time: '11:38 AM',
      location: 'Sokoto, senegal',
      places: 1000,
      units: 10000,
      amount: -4000,
      status: 'Purchase',
    },
  ];

  const june24Transactions: Transaction[] = Array(8).fill({
    time: '11:38 AM',
    location: 'Sokoto, senegal',
    places: 1000,
    units: 10000,
    amount: -4000,
    status: 'Purchase',
  }).map((t, i) => ({ ...t, id: `june-${i}` }));

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-semibold text-gray-900 mb-4">Today</h3>
        <div className="space-y-2">
          {todayTransactions.map((transaction) => (
            <div
              key={transaction.id}
              className="bg-white rounded-lg p-4 flex items-center justify-between hover:shadow-md transition-shadow cursor-pointer"
              onClick={onTransactionClick}
            >
              <div className="flex items-center gap-4 flex-1">
                <div className="text-sm text-gray-500 w-20">{transaction.time}</div>

                <div className="flex items-center gap-2">
                  <MapPin size={16} className="text-gray-400" />
                  <span className="text-sm text-gray-900">{transaction.location}</span>
                </div>
              </div>

              <div className="flex items-center gap-8">
                <div className="flex items-center gap-1 text-sm text-gray-600">
                  <LayoutGrid size={14} className="text-gray-400" />
                  <span>{transaction.places}</span>
                </div>

                <div className="flex items-center gap-1 text-sm text-gray-600">
                  <Clock size={14} className="text-gray-400" />
                  <span>{transaction.units.toLocaleString()}</span>
                </div>

                <div className="text-sm font-semibold text-gray-900 w-24 text-right">
                  ${Math.abs(transaction.amount).toLocaleString()}
                </div>

                <button className="px-4 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-xs font-medium hover:bg-gray-200 transition-colors">
                  {transaction.status}
                </button>

                <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                  <Eye size={16} className="text-gray-600" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-gray-900 mb-4">24th June 2024</h3>
        <div className="space-y-2">
          {june24Transactions.map((transaction) => (
            <div
              key={transaction.id}
              className="bg-white rounded-lg p-4 flex items-center justify-between hover:shadow-md transition-shadow cursor-pointer"
              onClick={onTransactionClick}
            >
              <div className="flex items-center gap-4 flex-1">
                <div className="text-sm text-gray-500 w-20">{transaction.time}</div>

                <div className="flex items-center gap-2">
                  <MapPin size={16} className="text-gray-400" />
                  <span className="text-sm text-gray-900">{transaction.location}</span>
                </div>
              </div>

              <div className="flex items-center gap-8">
                <div className="flex items-center gap-1 text-sm text-gray-600">
                  <LayoutGrid size={14} className="text-gray-400" />
                  <span>{transaction.places}</span>
                </div>

                <div className="flex items-center gap-1 text-sm text-gray-600">
                  <Clock size={14} className="text-gray-400" />
                  <span>{transaction.units.toLocaleString()}</span>
                </div>

                <div className="text-sm font-semibold text-gray-900 w-24 text-right">
                  ${Math.abs(transaction.amount).toLocaleString()}
                </div>

                <button className="px-4 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-xs font-medium hover:bg-gray-200 transition-colors">
                  {transaction.status}
                </button>

                <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                  <Eye size={16} className="text-gray-600" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

'use client';

import { Search, Calendar, Filter } from 'lucide-react';
import TransactionStats from '../../../src/components/TransactionStats';
import TransactionList from '../../../src/components/TransactionList';

export default function TransactionsPage() {
  const handleViewProperty = () => {
    // Handle property view - could navigate to property details
    console.log('View property details');
  };

  return (
    <div className="flex flex-1 overflow-hidden">
      <div className="flex-1 overflow-auto">
        <header className="bg-white border-b border-gray-200 px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl sm:text-2xl font-semibold text-gray-900 ml-12 lg:ml-0">Transactions</h1>
            <div className="flex items-center gap-2 sm:gap-4">
              <div className="relative hidden sm:block">
                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search..."
                  className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent w-40 sm:w-64"
                />
              </div>
            </div>
          </div>
        </header>

        <main className="p-4 sm:p-6 lg:p-8">
          <div className="max-w-6xl mx-auto">
            <TransactionStats
              totalTransactions={18}
              totalSpent={15000}
              totalEarned={1500}
            />

            <div className="mb-6 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <div className="relative flex-1 max-w-md">
                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search transactions"
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
              </div>

              <div className="flex gap-3">
                <button className="flex items-center justify-center gap-2 flex-1 sm:flex-initial px-4 py-2.5 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  <Calendar size={18} className="text-gray-600" />
                  <span className="text-sm text-gray-700">Choose date</span>
                </button>

                <button className="flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors">
                  <Filter size={18} />
                </button>
              </div>
            </div>

            <TransactionList onTransactionClick={handleViewProperty} />
          </div>
        </main>
      </div>
    </div>
  );
}

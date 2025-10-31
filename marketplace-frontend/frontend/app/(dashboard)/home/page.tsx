'use client';

import { Search, Bell, Sparkles } from 'lucide-react';
import BalanceCard from '../../../src/components/BalanceCard';
import MeterSquareCard from '../../../src/components/MeterSquareCard';
import PropertyTable from '../../../src/components/PropertyTable';
import TopLocations from '../../../src/components/TopLocations';

export default function HomePage() {
  const mockTransactions = [
    { id: '1', location: 'Nigeria', amount: 10000, time: 'Just now' },
    { id: '2', location: 'UK', amount: 10000, time: 'Just now' },
    { id: '3', location: 'Kenya', amount: 10000, time: 'Just now' },
  ];

  return (
    <div className="flex-1 overflow-auto bg-gradient-to-br from-slate-50 via-white to-slate-50">
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-200/60 px-4 sm:px-6 lg:px-8 py-5 sticky top-0 z-30">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 ml-12 lg:ml-0 flex items-center gap-2">
              Home
              <Sparkles size={20} className="text-emerald-500" />
            </h1>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="relative hidden sm:block">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search properties..."
                className="pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent focus:bg-white w-40 sm:w-64 transition-all"
              />
            </div>
            <button className="relative p-2.5 hover:bg-slate-100 rounded-xl transition-all group">
              <Bell size={20} className="text-slate-600 group-hover:text-slate-900" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-emerald-500 rounded-full ring-2 ring-white"></span>
            </button>
          </div>
        </div>
      </header>

      <main className="p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="relative overflow-hidden bg-gradient-to-br from-slate-800 via-slate-900 to-slate-950 rounded-2xl p-6 sm:p-8 mb-6 sm:mb-8 shadow-xl shadow-slate-900/20">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLW9wYWNpdHk9IjAuMSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-40"></div>
            <div className="relative flex items-center justify-between">
              <div>
                <p className="text-slate-300 text-sm sm:text-base mb-1 font-medium">Welcome Back,</p>
                <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">John Martins</h2>
                <p className="text-slate-400 text-sm">Your portfolio is growing 📈</p>
              </div>
              <div className="w-20 h-20 sm:w-24 sm:h-24 flex-shrink-0 rounded-2xl bg-white/10 backdrop-blur-sm p-3 flex items-center justify-center">
                <img
                  src="https://images.pexels.com/photos/4968391/pexels-photo-4968391.jpeg?auto=compress&cs=tinysrgb&w=200"
                  alt="Illustration"
                  className="w-full h-full object-contain"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
            <div className="lg:col-span-2">
              <BalanceCard isPositive={true} />
            </div>
            <div>
              <MeterSquareCard />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
            <div className="lg:col-span-2">
              <PropertyTable />
            </div>

            <div className="space-y-4 sm:space-y-6">
              <TopLocations transactions={mockTransactions} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

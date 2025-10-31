'use client';

import { useRouter } from 'next/navigation';
import { Search, Bell } from 'lucide-react';
import IdentityVerification from '../../src/components/IdentityVerification';
import TopLocations from '../../src/components/TopLocations';
import PropertyCards from '../../src/components/PropertyCards';

export default function OnboardingPage() {
  const router = useRouter();

  const handleVerificationComplete = () => {
    router.push('/home');
  };

  const mockTransactions = [
    { id: '1', location: 'Nigeria', amount: 10000, time: 'Just now' },
    { id: '2', location: 'UK', amount: 10000, time: 'Just now' },
    { id: '3', location: 'Kenya', amount: 10000, time: 'Just now' },
  ];

  return (
    <div className="flex-1 overflow-auto">
      <header className="bg-white border-b border-gray-200 px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl sm:text-2xl font-semibold text-gray-900 ml-12 lg:ml-0">Home</h1>
          <div className="flex items-center gap-2 sm:gap-4">
            <div className="relative hidden sm:block">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search..."
                className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent w-40 sm:w-64"
              />
            </div>
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors relative">
              <Bell size={20} className="text-gray-600" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-orange-500 rounded-full"></span>
            </button>
          </div>
        </div>
      </header>

      <main className="p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-gradient-to-r from-gray-100 to-gray-50 rounded-lg p-4 sm:p-6 mb-6 sm:mb-8 flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-xs sm:text-sm mb-1">Welcome Back,</p>
              <h2 className="text-lg sm:text-2xl font-bold text-gray-900">John Martins</h2>
            </div>
            <div className="w-16 h-16 sm:w-20 sm:h-20 flex-shrink-0">
              <img
                src="https://images.pexels.com/photos/4968391/pexels-photo-4968391.jpeg?auto=compress&cs=tinysrgb&w=200"
                alt="Illustration"
                className="w-full h-full object-contain"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
            <div className="lg:col-span-2 space-y-4 sm:space-y-6">
              <IdentityVerification
                currentStep={2}
                totalSteps={3}
                onVerify={handleVerificationComplete}
              />
              <PropertyCards />
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

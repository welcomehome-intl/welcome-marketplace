'use client';

import { useRouter } from 'next/navigation';
import { ArrowRight, MapPin, TrendingUp, Shield, CheckCircle } from 'lucide-react';

export default function LandingPage() {
  const router = useRouter();

  const handleGetStarted = () => {
    router.push('/onboarding');
  };

  return (
    <div className="h-screen w-full overflow-hidden bg-white relative">
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50"></div>

      <div className="absolute top-10 md:top-20 right-10 md:right-20 w-[300px] md:w-[600px] h-[300px] md:h-[600px] bg-emerald-200/30 rounded-full blur-3xl"></div>
      <div className="absolute bottom-10 md:bottom-20 left-10 md:left-20 w-[250px] md:w-[500px] h-[250px] md:h-[500px] bg-teal-200/30 rounded-full blur-3xl"></div>

      <nav className="relative z-20 flex items-center justify-between px-4 sm:px-8 md:px-12 py-4 md:py-6 max-w-7xl mx-auto">
        <div className="flex items-center gap-2 md:gap-3">
          <div className="w-9 h-9 md:w-11 md:h-11 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/25">
            <MapPin size={20} className="md:hidden text-white" strokeWidth={2.5} />
            <MapPin size={24} className="hidden md:block text-white" strokeWidth={2.5} />
          </div>
          <span className="text-xl md:text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">LandVault</span>
        </div>
        <button
          onClick={handleGetStarted}
          className="px-4 py-2 md:px-8 md:py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl text-sm md:text-base font-semibold hover:shadow-xl hover:shadow-emerald-500/30 transition-all hover:scale-105"
        >
          Get Started
        </button>
      </nav>

      <main className="relative z-10 h-[calc(100vh-72px)] md:h-[calc(100vh-88px)] flex items-center justify-center px-4 sm:px-8 md:px-12 overflow-hidden">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 lg:gap-16 items-center w-full">
          <div className="space-y-6 md:space-y-8">
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-slate-900 leading-[1.1] tracking-tight">
              Invest in Land.
              <br />
              <span className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent">
                Build Your Future.
              </span>
            </h1>

            <p className="text-base sm:text-lg md:text-xl text-slate-600 leading-relaxed max-w-xl font-medium">
              The modern platform for land investment. Buy, manage, and grow your real estate portfolio with complete transparency and security.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 pt-2 md:pt-4">
              <button
                onClick={handleGetStarted}
                className="group px-8 py-4 md:px-10 md:py-5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white rounded-2xl font-bold text-base md:text-lg transition-all hover:shadow-2xl hover:shadow-emerald-500/40 flex items-center justify-center gap-3"
              >
                Start Investing Now
                <ArrowRight size={20} className="md:hidden group-hover:translate-x-2 transition-transform" strokeWidth={2.5} />
                <ArrowRight size={22} className="hidden md:block group-hover:translate-x-2 transition-transform" strokeWidth={2.5} />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-4 md:gap-8 pt-6 md:pt-8 border-t border-slate-200">
              <div className="space-y-1 md:space-y-2">
                <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-900">$2.4B+</div>
                <div className="text-xs md:text-sm text-slate-500 font-medium">Assets Managed</div>
              </div>
              <div className="space-y-1 md:space-y-2">
                <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-900">150K+</div>
                <div className="text-xs md:text-sm text-slate-500 font-medium">Properties Listed</div>
              </div>
              <div className="space-y-1 md:space-y-2">
                <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-900">98%</div>
                <div className="text-xs md:text-sm text-slate-500 font-medium">Satisfaction Rate</div>
              </div>
            </div>
          </div>

          <div className="relative hidden lg:block">
            <div className="absolute -inset-4 bg-gradient-to-br from-emerald-200/40 to-teal-200/40 rounded-[2rem] blur-2xl"></div>

            <div className="relative space-y-5">
              <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-xl shadow-slate-200/50 transform hover:scale-[1.02] transition-transform">
                <div className="flex items-center gap-5 mb-6">
                  <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/30">
                    <TrendingUp size={28} className="text-white" strokeWidth={2.5} />
                  </div>
                  <div>
                    <div className="text-slate-900 font-bold text-lg">Portfolio Growth</div>
                    <div className="text-emerald-600 text-base font-semibold">+24% this year</div>
                  </div>
                </div>
                <div className="h-36 flex items-end gap-3">
                  <div className="flex-1 bg-gradient-to-t from-emerald-500 to-emerald-400 rounded-xl h-[55%] shadow-sm"></div>
                  <div className="flex-1 bg-gradient-to-t from-emerald-500 to-emerald-400 rounded-xl h-[70%] shadow-sm"></div>
                  <div className="flex-1 bg-gradient-to-t from-emerald-500 to-emerald-400 rounded-xl h-[48%] shadow-sm"></div>
                  <div className="flex-1 bg-gradient-to-t from-emerald-500 to-emerald-400 rounded-xl h-[82%] shadow-sm"></div>
                  <div className="flex-1 bg-gradient-to-t from-emerald-600 to-emerald-500 rounded-xl h-[100%] shadow-lg shadow-emerald-500/30"></div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-5">
                <div className="bg-white rounded-3xl p-7 border border-slate-200 shadow-xl shadow-slate-200/50 transform hover:scale-[1.02] transition-transform">
                  <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-emerald-500/30">
                    <Shield size={24} className="text-white" strokeWidth={2.5} />
                  </div>
                  <div className="text-3xl font-bold text-slate-900 mb-2">100%</div>
                  <div className="text-sm text-slate-500 font-medium">Secure & Protected</div>
                </div>
                <div className="bg-white rounded-3xl p-7 border border-slate-200 shadow-xl shadow-slate-200/50 transform hover:scale-[1.02] transition-transform">
                  <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-teal-500/30">
                    <MapPin size={24} className="text-white" strokeWidth={2.5} />
                  </div>
                  <div className="text-3xl font-bold text-slate-900 mb-2">50+</div>
                  <div className="text-sm text-slate-500 font-medium">Global Markets</div>
                </div>
              </div>

              <div className="bg-white rounded-3xl p-7 border border-slate-200 shadow-xl shadow-slate-200/50 transform hover:scale-[1.02] transition-transform">
                <div className="flex items-center justify-between mb-6">
                  <span className="text-slate-900 font-bold text-lg">Featured Property</span>
                  <span className="px-4 py-1.5 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-full border border-emerald-200">
                    HOT DEAL
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  <img
                    src="https://images.pexels.com/photos/259588/pexels-photo-259588.jpeg?auto=compress&cs=tinysrgb&w=300"
                    alt="Property"
                    className="w-20 h-20 rounded-2xl object-cover shadow-md"
                  />
                  <div className="flex-1">
                    <div className="text-slate-900 font-bold text-base mb-1">Lagos, Nigeria</div>
                    <div className="flex items-center gap-2">
                      <CheckCircle size={14} className="text-emerald-600" />
                      <span className="text-slate-500 text-sm font-medium">Commercial Land</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-slate-900 font-bold text-xl">$45,000</div>
                    <div className="text-emerald-600 text-sm font-semibold">+12.5%</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

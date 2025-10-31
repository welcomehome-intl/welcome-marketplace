import { TrendingUp, TrendingDown } from 'lucide-react';

interface BalanceCardProps {
  isPositive?: boolean;
}

export default function BalanceCard({ isPositive = true }: BalanceCardProps) {
  const earnings = isPositive ? '+$1000' : '-$1000';
  const bgGradient = isPositive
    ? 'from-teal-900 via-teal-800 to-emerald-900'
    : 'from-red-950 via-red-900 to-rose-950';
  const textColor = isPositive ? 'text-emerald-400' : 'text-red-400';
  const bgColor = isPositive ? 'bg-emerald-500/10' : 'bg-red-500/10';
  const borderColor = isPositive ? 'border-emerald-500/20' : 'border-red-500/20';

  const WavePattern = () => (
    <svg className="absolute bottom-0 left-0 w-full h-24 opacity-30" viewBox="0 0 1200 120" preserveAspectRatio="none">
      <path
        d="M0,0 C150,60 350,60 600,30 C850,0 1050,0 1200,30 L1200,120 L0,120 Z"
        fill={isPositive ? 'currentColor' : 'currentColor'}
        className={isPositive ? 'text-emerald-500' : 'text-red-500'}
      />
      <path
        d="M0,20 C150,80 350,80 600,50 C850,20 1050,20 1200,50 L1200,120 L0,120 Z"
        fill={isPositive ? 'currentColor' : 'currentColor'}
        className={isPositive ? 'text-emerald-600' : 'text-red-600'}
        opacity="0.5"
      />
    </svg>
  );

  return (
    <div className={`relative bg-gradient-to-br ${bgGradient} rounded-2xl p-6 overflow-hidden shadow-2xl group hover:shadow-${isPositive ? 'emerald' : 'red'}-500/20 transition-all duration-300`}>
      <WavePattern />

      <div className="relative z-10">
        <p className="text-slate-300 text-xs mb-2 font-medium uppercase tracking-wider">
          My Balance
        </p>
        <h2 className="text-4xl font-bold text-white mb-3">$24,000</h2>
        <div className={`flex items-center gap-2 ${textColor} text-sm font-semibold`}>
          {isPositive ? (
            <TrendingUp size={16} />
          ) : (
            <TrendingDown size={16} />
          )}
          <span>Earnings: {earnings}</span>
        </div>
      </div>
    </div>
  );
}

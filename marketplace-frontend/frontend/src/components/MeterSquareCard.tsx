import { Square } from 'lucide-react';

export default function MeterSquareCard() {
  return (
    <div className="relative bg-gradient-to-br from-slate-800 via-slate-900 to-slate-950 rounded-2xl p-8 shadow-2xl flex flex-col items-center justify-center h-full overflow-hidden group hover:shadow-slate-900/30 transition-all duration-300">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLW9wYWNpdHk9IjAuMSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-100\"></div>

      <div className="absolute top-4 right-4">
        <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center backdrop-blur-sm">
          <Square size={20} className="text-white" />
        </div>
      </div>

      <div className="relative text-center">
        <p className="text-slate-300 text-sm mb-3 font-medium flex items-center justify-center gap-2">
          <span className="w-2 h-2 rounded-full bg-white"></span>
          Total Area
        </p>
        <h2 className="text-7xl font-bold text-white mb-2 group-hover:scale-110 transition-transform">243</h2>
        <p className="text-slate-400 text-sm font-medium">meter²</p>
      </div>
    </div>
  );
}

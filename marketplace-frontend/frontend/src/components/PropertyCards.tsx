import { ChevronRight } from 'lucide-react';

interface Property {
  id: string;
  title: string;
  description: string;
  buttonText: string;
  buttonVariant: 'primary' | 'secondary';
}

export default function PropertyCards() {
  const cards: Property[] = [
    {
      id: '1',
      title: 'Buy Property',
      description: 'Buy fractional ownership to add time to your Senegal, just trust and purchase',
      buttonText: 'Get Started',
      buttonVariant: 'primary',
    },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
      {cards.map((card) => (
        <div
          key={card.id}
          className="relative overflow-hidden bg-gradient-to-br from-white to-slate-50 rounded-2xl shadow-lg border border-slate-200/80 p-7 hover:shadow-2xl hover:shadow-slate-900/10 transition-all group hover:-translate-y-0.5"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500"></div>
          <div className="relative">
            <div className="flex items-start justify-between mb-4">
              <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/30">
                <ChevronRight size={28} className="text-white" />
              </div>
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-3">{card.title}</h3>
            <p className="text-slate-600 text-sm mb-6 leading-relaxed">{card.description}</p>
            <button
              className={`flex items-center gap-2 px-5 py-3 rounded-xl transition-all font-semibold text-sm shadow-lg group-hover:scale-105 ${
                card.buttonVariant === 'primary'
                  ? 'bg-gradient-to-r from-slate-900 to-slate-800 text-white hover:from-slate-800 hover:to-slate-700 shadow-slate-900/30'
                  : 'bg-slate-100 text-slate-900 hover:bg-slate-200 shadow-slate-900/10'
              }`}
            >
              {card.buttonText}
              <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

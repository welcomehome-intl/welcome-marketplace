import { TrendingUp } from 'lucide-react';

interface Transaction {
  id: string;
  location: string;
  amount: number;
  time: string;
}

interface TopLocationsProps {
  transactions: Transaction[];
}

export default function TopLocations({ transactions }: TopLocationsProps) {
  const locations = [
    { name: 'Nigeria', flag: '🇳🇬' },
    { name: 'UK', flag: '🇬🇧' },
    { name: 'Kenya', flag: '🇰🇪' },
    { name: 'Nigeria', flag: '🇳🇬' },
    { name: 'UK', flag: '🇬🇧' },
    { name: 'Nigeria', flag: '🇳🇬' },
    { name: 'Kenya', flag: '🇰🇪' },
    { name: 'Nigeria', flag: '🇳🇬' },
    { name: 'UK', flag: '🇬🇧' },
    { name: 'Nigeria', flag: '🇳🇬' },
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm">
      <div className="p-4 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-gray-900">Top locations this week</h3>
          <TrendingUp size={16} className="text-orange-500" />
        </div>
      </div>

      <div className="divide-y divide-gray-100">
        {locations.map((location, index) => (
          <div key={index} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                <span className="text-lg">{location.flag}</span>
              </div>
              <div>
                <p className="font-medium text-gray-900">{location.name}</p>
                <p className="text-sm text-gray-500">10,000 m² bought at Obasil</p>
              </div>
            </div>
            <span className="text-xs text-gray-400">Just now</span>
          </div>
        ))}
      </div>
    </div>
  );
}

import { MapPin, ExternalLink } from 'lucide-react';

interface PropertyDetail {
  plotId: string;
  address: string;
  coordinates: string;
  events: number;
  people: number;
  owners: number;
  paymentMethod: string;
  transactionId: string;
  date: string;
  value: number;
}

interface PropertyDetailSidebarProps {
  property: PropertyDetail;
}

export default function PropertyDetailSidebar({ property }: PropertyDetailSidebarProps) {
  return (
    <div className="w-96 bg-white border-l border-gray-200 p-6 overflow-y-auto">
      <div className="mb-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{property.plotId}</h3>
            <p className="text-sm text-gray-600">{property.address}</p>
          </div>
          <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <MapPin size={20} className="text-gray-600" />
          </button>
        </div>

        <div className="bg-gray-100 rounded-lg h-48 mb-4 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-gray-200 to-gray-300">
            <div className="absolute inset-0 opacity-20">
              <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                  <path d="M 20 0 L 0 0 0 20" fill="none" stroke="white" strokeWidth="0.5"/>
                </pattern>
                <rect width="100%" height="100%" fill="url(#grid)" />
              </svg>
            </div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-teal-500 rounded-full shadow-lg flex items-center justify-center">
              <MapPin size={20} className="text-white" />
            </div>
          </div>
          <div className="absolute bottom-2 right-2 bg-white px-3 py-1 rounded-lg text-xs font-medium text-gray-700 shadow">
            Sokoto, senegal
          </div>
        </div>

        <div className="text-xs text-gray-500 mb-4">
          {property.coordinates}
        </div>

        <div className="grid grid-cols-3 gap-4 mb-6">
          <div>
            <p className="text-xs text-gray-500 mb-1">Events</p>
            <p className="text-sm font-semibold text-gray-900">{property.events}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">People</p>
            <p className="text-sm font-semibold text-gray-900">{property.people.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">Owners</p>
            <p className="text-sm font-semibold text-gray-900">{property.owners}</p>
          </div>
        </div>
      </div>

      <div className="border-t border-gray-200 pt-6 space-y-4">
        <h4 className="text-sm font-semibold text-gray-900 mb-4">Current Purchase</h4>

        <div>
          <p className="text-xs text-gray-500 mb-1">Payment Method</p>
          <p className="text-sm text-gray-900">{property.paymentMethod}</p>
        </div>

        <div>
          <p className="text-xs text-gray-500 mb-1">Transaction Id</p>
          <p className="text-sm text-gray-900">{property.transactionId}</p>
        </div>

        <div>
          <p className="text-xs text-gray-500 mb-1">Date</p>
          <p className="text-sm text-gray-900">{property.date}</p>
        </div>

        <div>
          <p className="text-xs text-gray-500 mb-1">Value</p>
          <p className="text-lg font-semibold text-gray-900">${property.value.toLocaleString()}</p>
        </div>

        <button className="w-full bg-gray-900 text-white py-3 rounded-lg font-medium hover:bg-gray-800 transition-colors flex items-center justify-center gap-2 mt-6">
          Share your purchase with others
          <ExternalLink size={16} />
        </button>
      </div>
    </div>
  );
}

'use client';

import { X, MapPin, TrendingUp, Users, Calendar, Download, Share2 } from 'lucide-react';

interface PropertyDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  property: {
    id: string;
    name: string;
    address: string;
    location: string;
    status: string;
    area: number;
    units: number;
    price: number;
    change: string;
    imageUrl: string;
  };
}

export default function PropertyDetailModal({ isOpen, onClose, property }: PropertyDetailModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="relative h-64 overflow-hidden rounded-t-2xl">
          <img
            src={property.imageUrl}
            alt={property.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>

          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 bg-white/90 hover:bg-white rounded-full transition-all"
          >
            <X size={20} className="text-slate-900" />
          </button>

          <div className="absolute bottom-6 left-6 right-6">
            <h2 className="text-3xl font-bold text-white mb-2">{property.name}</h2>
            <div className="flex items-center gap-2 text-white/90">
              <MapPin size={16} />
              <span className="text-sm">{property.address}</span>
            </div>
          </div>
        </div>

        <div className="p-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-slate-50 rounded-xl p-4">
              <p className="text-slate-600 text-xs font-medium mb-1">Price</p>
              <p className="text-2xl font-bold text-slate-900">${property.price.toLocaleString()}</p>
            </div>
            <div className="bg-emerald-50 rounded-xl p-4">
              <p className="text-emerald-700 text-xs font-medium mb-1">Change 24H</p>
              <div className="flex items-center gap-1">
                <TrendingUp size={18} className="text-emerald-600" />
                <p className="text-2xl font-bold text-emerald-600">{property.change}</p>
              </div>
            </div>
            <div className="bg-slate-50 rounded-xl p-4">
              <p className="text-slate-600 text-xs font-medium mb-1">Area</p>
              <p className="text-2xl font-bold text-slate-900">{property.area}m²</p>
            </div>
            <div className="bg-slate-50 rounded-xl p-4">
              <p className="text-slate-600 text-xs font-medium mb-1">Units</p>
              <p className="text-2xl font-bold text-slate-900">{property.units.toLocaleString()}</p>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-bold text-slate-900 mb-4">Property Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl">
                  <MapPin size={20} className="text-slate-600" />
                  <div>
                    <p className="text-xs text-slate-600">Location</p>
                    <p className="font-semibold text-slate-900">{property.location}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl">
                  <Calendar size={20} className="text-slate-600" />
                  <div>
                    <p className="text-xs text-slate-600">Status</p>
                    <p className="font-semibold text-emerald-600">{property.status}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl">
                  <Users size={20} className="text-slate-600" />
                  <div>
                    <p className="text-xs text-slate-600">Owners</p>
                    <p className="font-semibold text-slate-900">7 people</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl">
                  <TrendingUp size={20} className="text-slate-600" />
                  <div>
                    <p className="text-xs text-slate-600">Expected Return</p>
                    <p className="font-semibold text-slate-900">12% annually</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button className="flex-1 px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-emerald-500/30 transition-all">
                Invest Now
              </button>
              <button className="px-6 py-3 bg-slate-100 text-slate-700 rounded-xl font-semibold hover:bg-slate-200 transition-all flex items-center gap-2">
                <Download size={18} />
              </button>
              <button className="px-6 py-3 bg-slate-100 text-slate-700 rounded-xl font-semibold hover:bg-slate-200 transition-all flex items-center gap-2">
                <Share2 size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

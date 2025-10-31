'use client';

import { LayoutGrid, Clock, DollarSign, TrendingUp, Download, Share2, List } from 'lucide-react';
import { useState } from 'react';
import ShareModal from './ShareModal';
import PropertyDetailModal from './PropertyDetailModal';

interface Property {
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
}

export default function PropertyTable() {
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');

  const handleShare = (property: Property, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedProperty(property);
    setShareModalOpen(true);
  };

  const handleCardClick = (property: Property) => {
    setSelectedProperty(property);
    setDetailModalOpen(true);
  };
  const properties: Property[] = [
    {
      id: '1',
      name: 'Plot 01',
      address: 'Treboul - 8254FF 21',
      location: 'Sokoto, senegal',
      status: 'In-Demand',
      area: 1000,
      units: 10000,
      price: 4000,
      change: '+4%',
      imageUrl: 'https://images.pexels.com/photos/1974596/pexels-photo-1974596.jpeg?auto=compress&cs=tinysrgb&w=100',
    },
    {
      id: '2',
      name: 'Plot 01',
      address: 'Treboul - 8254FF 21',
      location: 'Sokoto, senegal',
      status: 'In-Demand',
      area: 1000,
      units: 10000,
      price: 4000,
      change: '+4%',
      imageUrl: 'https://images.pexels.com/photos/2252836/pexels-photo-2252836.jpeg?auto=compress&cs=tinysrgb&w=100',
    },
    {
      id: '3',
      name: 'Plot 01',
      address: 'Treboul - 8254FF 21',
      location: 'Sokoto, senegal',
      status: 'In-Demand',
      area: 1000,
      units: 10000,
      price: 4000,
      change: '+4%',
      imageUrl: 'https://images.pexels.com/photos/1029599/pexels-photo-1029599.jpeg?auto=compress&cs=tinysrgb&w=100',
    },
    {
      id: '4',
      name: 'Plot 01',
      address: 'Treboul - 8254FF 21',
      location: 'Sokoto, senegal',
      status: 'In-Demand',
      area: 1000,
      units: 10000,
      price: 4000,
      change: '+4%',
      imageUrl: 'https://images.pexels.com/photos/1438832/pexels-photo-1438832.jpeg?auto=compress&cs=tinysrgb&w=100',
    },
    {
      id: '5',
      name: 'Plot 01',
      address: 'Treboul - 8254FF 21',
      location: 'Sokoto, senegal',
      status: 'In-Demand',
      area: 1000,
      units: 10000,
      price: 4000,
      change: '+4%',
      imageUrl: 'https://images.pexels.com/photos/2098405/pexels-photo-2098405.jpeg?auto=compress&cs=tinysrgb&w=100',
    },
  ];

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-slate-200/60">
      <div className="p-5 border-b border-slate-100 flex items-center justify-between">
        <h3 className="font-bold text-slate-900 text-lg">Your Properties</h3>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 rounded-lg transition-all ${
              viewMode === 'list'
                ? 'bg-emerald-100 text-emerald-600'
                : 'hover:bg-slate-100 text-slate-600'
            }`}
          >
            <List size={18} />
          </button>
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded-lg transition-all ${
              viewMode === 'grid'
                ? 'bg-emerald-100 text-emerald-600'
                : 'hover:bg-slate-100 text-slate-600'
            }`}
          >
            <LayoutGrid size={18} />
          </button>
        </div>
      </div>

      {viewMode === 'grid' ? (
        <div className="p-5 grid grid-cols-1 lg:grid-cols-2 gap-5">
          {properties.map((property) => (
            <div
              key={property.id}
              onClick={() => handleCardClick(property)}
              className="group relative bg-white border border-slate-200/80 rounded-2xl overflow-hidden hover:shadow-2xl hover:shadow-slate-900/10 transition-all cursor-pointer hover:-translate-y-0.5"
            >
              <div className="relative h-52 overflow-hidden">
                <img
                  src={property.imageUrl}
                  alt={property.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
                <div className="absolute top-4 right-4">
                  <span className="px-3 py-1.5 bg-white/95 backdrop-blur-sm text-slate-900 rounded-lg text-xs font-bold shadow-lg">
                    {property.status}
                  </span>
                </div>
                <div className="absolute bottom-4 left-4 right-4">
                  <h4 className="text-white font-bold text-xl mb-1">{property.name}</h4>
                  <p className="text-white/90 text-sm font-medium">{property.address}</p>
                </div>
              </div>

              <div className="p-5 space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <span className="text-slate-500 text-xs font-medium block mb-1">Location</span>
                    <span className="text-slate-900 font-semibold text-sm">{property.location}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 text-xs font-medium block mb-1">Area</span>
                    <span className="text-slate-900 font-semibold text-sm">{property.area} m²</span>
                  </div>
                  <div>
                    <span className="text-slate-500 text-xs font-medium block mb-1">Units</span>
                    <span className="text-slate-900 font-semibold text-sm">{property.units.toLocaleString()}</span>
                  </div>
                </div>
                <div className="border-t border-slate-100 pt-4 flex items-center justify-between">
                  <div>
                    <p className="text-slate-500 text-xs font-medium mb-1">Current Price</p>
                    <p className="text-2xl font-bold text-slate-900">${property.price.toLocaleString()}</p>
                  </div>
                  <div className="flex items-center gap-1.5 px-3 py-2 bg-emerald-50 rounded-xl border border-emerald-100">
                    <TrendingUp size={16} className="text-emerald-600" />
                    <span className="text-emerald-600 font-bold text-sm">{property.change}</span>
                  </div>
                </div>
                <div className="flex gap-3 pt-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                    }}
                    className="flex-1 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all flex items-center justify-center gap-2 font-medium text-slate-700"
                  >
                    <Download size={16} />
                    <span className="text-sm">Download</span>
                  </button>
                  <button
                    onClick={(e) => handleShare(property, e)}
                    className="flex-1 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl transition-all flex items-center justify-center gap-2 font-medium shadow-lg shadow-emerald-500/30"
                  >
                    <Share2 size={16} />
                    <span className="text-sm">Share</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gradient-to-r from-slate-50 to-slate-100/50 border-b border-slate-200">
            <tr>
              <th className="text-left py-4 px-5 text-xs font-bold text-slate-700 uppercase tracking-wider">
                Property
              </th>
              <th className="text-left py-4 px-5 text-xs font-bold text-slate-700 uppercase tracking-wider">
                Location
              </th>
              <th className="text-left py-4 px-5 text-xs font-bold text-slate-700 uppercase tracking-wider">
                Status
              </th>
              <th className="text-left py-4 px-5 text-xs font-bold text-slate-700 uppercase tracking-wider">
                Area (m²)
              </th>
              <th className="text-left py-4 px-5 text-xs font-bold text-slate-700 uppercase tracking-wider">
                Units
              </th>
              <th className="text-left py-4 px-5 text-xs font-bold text-slate-700 uppercase tracking-wider">
                Price
              </th>
              <th className="text-left py-4 px-5 text-xs font-bold text-slate-700 uppercase tracking-wider">
                24H Change
              </th>
              <th className="text-left py-4 px-5 text-xs font-bold text-slate-700 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {properties.map((property, index) => (
              <tr
                key={property.id}
                onClick={() => handleCardClick(property)}
                className="hover:bg-gradient-to-r hover:from-slate-50 hover:to-transparent transition-all group cursor-pointer"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <td className="py-5 px-5">
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <img
                        src={property.imageUrl}
                        alt={property.name}
                        className="w-16 h-16 rounded-xl object-cover ring-2 ring-slate-200 group-hover:ring-emerald-400 transition-all shadow-md"
                      />
                      <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-emerald-500 rounded-lg flex items-center justify-center shadow-lg">
                        <LayoutGrid size={12} className="text-white" />
                      </div>
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 text-base mb-0.5">{property.name}</p>
                      <p className="text-xs text-slate-500 font-medium">{property.address}</p>
                    </div>
                  </div>
                </td>
                <td className="py-5 px-5">
                  <p className="text-sm text-slate-700 font-semibold">{property.location}</p>
                </td>
                <td className="py-5 px-5">
                  <span className="inline-flex items-center gap-1.5 px-3 py-2 bg-gradient-to-r from-emerald-50 to-emerald-100/50 text-emerald-700 rounded-xl text-xs font-bold border border-emerald-200 shadow-sm">
                    <Clock size={12} />
                    {property.status}
                  </span>
                </td>
                <td className="py-5 px-5">
                  <div className="flex items-center gap-1.5 text-sm text-slate-900 font-semibold">
                    <LayoutGrid size={14} className="text-emerald-500" />
                    {property.area}
                  </div>
                </td>
                <td className="py-5 px-5">
                  <div className="flex items-center gap-1.5 text-sm text-slate-900 font-semibold">
                    <Clock size={14} className="text-slate-400" />
                    {property.units.toLocaleString()}
                  </div>
                </td>
                <td className="py-5 px-5">
                  <div className="flex items-center gap-1 text-base font-bold text-slate-900">
                    <DollarSign size={16} className="text-emerald-500" />
                    {property.price.toLocaleString()}
                  </div>
                </td>
                <td className="py-5 px-5">
                  <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-emerald-50 rounded-lg w-fit">
                    <TrendingUp size={14} className="text-emerald-600" />
                    <span className="text-sm font-bold text-emerald-600">{property.change}</span>
                  </div>
                </td>
                <td className="py-5 px-5">
                  <div className="flex items-center gap-2">
                    <button className="p-2.5 hover:bg-slate-100 rounded-xl transition-all hover:scale-105 group/btn">
                      <Download size={16} className="text-slate-500 group-hover/btn:text-slate-900" />
                    </button>
                    <button
                      onClick={(e) => handleShare(property, e)}
                      className="p-2.5 hover:bg-emerald-100 rounded-xl transition-all hover:scale-105 group/btn"
                    >
                      <Share2 size={16} className="text-slate-500 group-hover/btn:text-emerald-600" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      )}

      {selectedProperty && (
        <>
          <ShareModal
            isOpen={shareModalOpen}
            onClose={() => setShareModalOpen(false)}
            property={{
              image: selectedProperty.imageUrl,
              city: selectedProperty.location.split(',')[0],
              state: selectedProperty.location.split(',')[1]?.trim() || '',
            }}
          />
          <PropertyDetailModal
            isOpen={detailModalOpen}
            onClose={() => setDetailModalOpen(false)}
            property={selectedProperty}
          />
        </>
      )}
    </div>
  );
}

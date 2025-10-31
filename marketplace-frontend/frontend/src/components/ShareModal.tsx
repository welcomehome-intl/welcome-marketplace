'use client';

import { X, Twitter, Facebook, Instagram, Copy, Check } from 'lucide-react';
import { useState } from 'react';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  property: {
    image: string;
    city: string;
    state: string;
  };
}

export default function ShareModal({ isOpen, onClose, property }: ShareModalProps) {
  const [copied, setCopied] = useState(false);
  const [message, setMessage] = useState(
    `Just bought a piece of paradise in [${property.city}, ${property.state}]! #landownership #newbeginnings`
  );

  const shareLink = 'eyuwegwfhiowhisnfinfobbgkrjgb';

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleMessageChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Share your purchase</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={24} className="text-gray-500" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="flex flex-col sm:flex-row gap-6">
            <img
              src={property.image}
              alt="Property"
              className="w-full sm:w-80 h-48 object-cover rounded-xl"
            />

            <div className="flex-1">
              <textarea
                value={message}
                onChange={handleMessageChange}
                className="w-full h-32 p-4 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-none text-sm"
                maxLength={130}
              />
              <div className="text-right text-sm text-gray-500 mt-2">
                {message.length}/130
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <input
              type="text"
              value={shareLink}
              readOnly
              className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700"
            />
            <button
              onClick={handleCopyLink}
              className="px-6 py-3 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors font-medium flex items-center gap-2 whitespace-nowrap"
            >
              {copied ? (
                <>
                  <Check size={18} />
                  Copied!
                </>
              ) : (
                <>
                  <Copy size={18} />
                  Copy link
                </>
              )}
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <button className="flex items-center justify-center gap-3 px-6 py-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <Twitter size={20} className="text-gray-700" />
              <span className="font-medium text-gray-700">Share on twitter</span>
            </button>
            <button className="flex items-center justify-center gap-3 px-6 py-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <Facebook size={20} className="text-gray-700" />
              <span className="font-medium text-gray-700">Share on facebook</span>
            </button>
            <button className="flex items-center justify-center gap-3 px-6 py-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <Instagram size={20} className="text-gray-700" />
              <span className="font-medium text-gray-700">Share on instagram</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

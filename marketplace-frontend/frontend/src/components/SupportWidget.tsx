'use client';

import { MessageCircle, X } from 'lucide-react';
import { useState } from 'react';

export default function SupportWidget() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed bottom-6 left-28 z-50">
      {isOpen && (
        <div className="mb-4 w-80 bg-white rounded-lg shadow-xl overflow-hidden">
          <div className="bg-teal-600 p-4 flex items-center justify-between">
            <h3 className="text-white font-semibold">Need help?</h3>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white hover:bg-teal-500 rounded p-1"
            >
              <X size={18} />
            </button>
          </div>
          <div className="p-4">
            <p className="text-gray-600 text-sm mb-4">
              Our support team is here to help you with any questions or concerns.
            </p>
            <button className="w-full bg-teal-500 text-white py-2 rounded-lg hover:bg-teal-600 transition-colors">
              Talk to us
            </button>
          </div>
        </div>
      )}

      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 bg-teal-500 text-white rounded-full shadow-lg hover:bg-teal-600 transition-all flex items-center justify-center hover:scale-110"
      >
        <MessageCircle size={24} />
      </button>
      <p className="text-center text-xs text-gray-600 mt-2 font-medium">
        Need help?<br />Talk to us
      </p>
    </div>
  );
}

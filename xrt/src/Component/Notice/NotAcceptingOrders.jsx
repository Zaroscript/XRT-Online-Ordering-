import React from 'react';
import { AlertCircle } from 'lucide-react';

const NotAcceptingOrders = ({ message }) => {
  if (!message) return null;

  return (
    <div className="fixed top-4 left-0 right-0 z-[100] flex justify-center pointer-events-none">
      <div className="bg-red-600/95 backdrop-blur-sm text-white px-6 py-2 rounded-full shadow-xl flex items-center gap-2 pointer-events-auto transform transition-transform hover:scale-105">
        <AlertCircle className="w-4 h-4" />
        <span className="font-medium text-xs md:text-sm tracking-wide">
          {message}
        </span>
      </div>
    </div>
  );
};

export default NotAcceptingOrders;

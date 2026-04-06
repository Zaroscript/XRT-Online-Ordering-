import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { COLORS } from '../config/colors';
import { CheckCircle, ArrowLeft, ShoppingBag } from 'lucide-react';

const OrderSuccess = () => {
  const location = useLocation();
  const orderNumber =
    location.state?.orderNumber ||
    location.state?.order?.order_number ||
    '';

  return (
    <div
      className="min-h-screen pt-32 pb-20 px-4"
      style={{ '--primary': COLORS.primary, '--text-primary': COLORS.textPrimary }}
    >
      <div className="max-w-xl mx-auto flex flex-col items-center justify-center py-16 bg-white rounded-2xl shadow-sm border border-gray-100">
        {/* Success Icon */}
        <div className="w-24 h-24 bg-(--primary)/10 rounded-full flex items-center justify-center mb-6 animate-bounce">
          <CheckCircle size={48} className="text-(--primary)" />
        </div>

        <h1 className="text-3xl font-bold text-(--text-primary) mb-2">
          Order Success!
        </h1>
        <p className="text-gray-500 mb-8 text-center px-6">
          Thank you for your order. We've received it and are starting to
          prepare it for you.
        </p>

        <div className="bg-(--primary)/5 border border-(--primary)/10 rounded-2xl p-6 mb-8 w-full max-w-sm">
          <p className="text-sm text-gray-500 text-center mb-1">Order Number</p>
          <p className="text-2xl font-black text-(--primary) text-center tracking-wider">
            #{orderNumber || "PENDING"}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            to="/menu"
            className="px-8 py-3 bg-(--primary) text-white font-bold rounded-full hover:brightness-110 transition-all shadow-lg shadow-(--primary)/20 flex items-center gap-2"
          >
            <ShoppingBag size={18} />
            Order More
          </Link>
          <Link
            to="/"
            className="px-8 py-3 bg-gray-100 text-gray-700 font-bold rounded-full hover:bg-gray-200 transition-all flex items-center gap-2"
          >
            <ArrowLeft size={18} />
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccess;

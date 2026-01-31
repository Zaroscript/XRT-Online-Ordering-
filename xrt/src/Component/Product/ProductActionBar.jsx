import React from "react";
import { Handbag } from "lucide-react";

/**
 * Shared Bottom Bar component for Product Quantity and Add to Cart actions.
 * 
 * Props:
 * - qty: Current quantity
 * - setQty: State setter for quantity
 * - onAddToCart: Handler for Add button click
 * - price: Optional price display, if needed? (Not explicitly asked but good for context) - Skipping for now to stick to scope.
 * - className: Optional extra classes
 */
export default function ProductActionBar({ qty, setQty, onAddToCart, price, className = "" }) {
  
  // Calculate display total if price provided
  const displayTotal = price ? (parseFloat(price) * qty).toFixed(2) : null;

  return (
    <div className={`
        w-full mt-8 pt-6 border-t border-gray-100 
        md:max-w-4xl md:mx-auto md:rounded-2xl
        ${className}
    `}>
         <div className="flex flex-row gap-4 items-center">
             {/* Qty Selector */}
             <div className="flex items-center h-[56px] border border-gray-200 rounded-xl overflow-hidden shrink-0 bg-gray-50">
                 <button 
                    onClick={() => setQty(Math.max(1, qty - 1))}
                    className="w-14 h-full flex items-center justify-center text-xl font-bold text-gray-500 hover:text-[var(--primary)] hover:bg-gray-100 transition-colors"
                 >
                   -
                 </button>
                 <span className="w-10 text-center text-xl font-bold text-gray-800">{qty}</span>
                 <button 
                    onClick={() => setQty(qty + 1)}
                    className="w-14 h-full flex items-center justify-center text-xl font-bold text-gray-500 hover:text-[var(--primary)] hover:bg-gray-100 transition-colors"
                 >
                   +
                 </button>
             </div>

             {/* Add Button */}
             <button 
                onClick={onAddToCart}
                className="flex-1 h-[56px] bg-[var(--primary)] text-white rounded-xl font-bold text-lg flex items-center justify-center gap-2 shadow-lg shadow-[var(--primary)]/20 active:scale-[98%] transition-transform hover:brightness-110"
             >
                <Handbag strokeWidth={2.5} size={24} />
                <span>
                   {qty > 1 ? `ADD ${qty} ITEMS` : `ADD TO CART`}
                </span>
                {displayTotal && (
                    <>
                        <span>${displayTotal}</span>
                    </>
                )}
             </button>
         </div>
    </div>
  );
}

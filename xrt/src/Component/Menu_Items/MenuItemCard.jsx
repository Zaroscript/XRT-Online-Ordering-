import React, { useState } from "react";
import { Handbag, Eye, Utensils, X } from "lucide-react";
import ProductModal from "../ProductModal";
import * as Dialog from "@radix-ui/react-dialog";
import { useNavigate } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import { COLORS } from "../../config/colors";

export default function MenuItemCard({ product }) {
  const navigate = useNavigate();
  const [isCustomizeOpen, setIsCustomizeOpen] = useState(false);
  const { addToCart } = useCart();
  
  const handleCustomize = (e) => {
     e.stopPropagation();
     setIsCustomizeOpen(true);
  };

  const styleVars = {
    '--primary': COLORS.primary,
    '--text-primary': COLORS.textPrimary,
    '--text-secondary': COLORS.textSecondary,
    '--text-gray': COLORS.textGray,
  };

  return (
    <Dialog.Root>
      <div className="hidden md:block w-full" style={styleVars}>
        <div className="relative group">
          <img
            src={product.src}
            alt={product.name}
            className="w-full h-[320px] object-cover rounded-[18px]"
          />

          <Dialog.Trigger asChild>
            <button
              className="
                absolute inset-0
                flex flex-col items-center justify-center
                opacity-0 group-hover:opacity-100
                bg-black/40
                text-white
                transition
                rounded-[18px]
                duration-400
                group-hover:cursor-pointer
              "
            >
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-white/90 mb-2">
                <Eye className="w-5 h-5 text-green-700" />
              </div>
              <span className="text-sm font-medium bg-black px-3 py-1 rounded-full">
                Quick view
              </span>
            </button>
          </Dialog.Trigger>

          <div className="absolute -bottom-5 left-1/2 -translate-x-1/2">
            <div className="flex items-center gap-1 px-4 py-1 rounded-full bg-[var(--primary)] text-white shadow-md">
              <span className="text-[17px] font-bold">${product.basePrice.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <div 
          onClick={() => navigate(`/product/${product.id}`)}
          className="cursor-pointer hover:text-[var(--primary)] transition-colors"
        >
          <h3 className="mt-8 mb-3 text-[13px] font-[500] text-[var(--text-secondary)] text-center">
            {product.name}
          </h3>
        </div>

        <div className="flex flex-row gap-3 px-4 pb-4">
          <div 
             onClick={handleCustomize}
             className="flex-1 h-[40px] border-2 border-gray-100 rounded-full flex items-center justify-center group hover:bg-[var(--primary)] duration-300 cursor-pointer">
            <Utensils
              strokeWidth={0.8}
              size={20}
              className="text-[var(--primary)] group-hover:text-white duration-300"
            />
            <h5 className="ml-2 text-[var(--text-gray)] text-sm font-medium group-hover:text-white duration-300 truncate">
              Customize It
            </h5>
          </div>

          <div 
            onClick={() => addToCart({
              ...product,
              price: (product.basePrice * (product.sizes?.[0]?.multiplier || 1)).toFixed(2)
            })}
            className="flex-1 h-[40px] border-2 border-gray-100 rounded-full flex items-center justify-center group hover:bg-[var(--primary)] duration-300 cursor-pointer">
            <Handbag
              strokeWidth={0.8}
              size={20}
              className="text-[var(--primary)] group-hover:text-white duration-300"
            />
            <h5 className="ml-2 text-[var(--text-gray)] text-sm font-medium group-hover:text-white duration-300 truncate">
              Add to Cart
            </h5>
          </div>
        </div>
      </div>

      <div className="md:hidden w-[94%] mx-auto bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col mb-4" style={styleVars}>
        <div className="relative h-64 w-full bg-gray-50">
           <img
            src={product.src}
            alt={product.name}
            className="w-full h-full object-contain p-2"
          />
           <Dialog.Trigger asChild>
            <button className="absolute top-2 right-2 bg-white/90 p-1.5 rounded-full shadow-sm">
                <Eye className="w-3.5 h-3.5 text-green-700" />
            </button>
          </Dialog.Trigger>
        </div>
       
        <div className="p-4 flex flex-col gap-3">
          <div className="flex justify-between items-start">
             <div onClick={() => navigate(`/product/${product.id}`)} className="cursor-pointer">
                <h3 className="text-base font-bold text-gray-800 leading-tight">
                 {product.name}
                </h3>
             </div>
            <span className="text-[var(--primary)] font-bold text-base whitespace-nowrap ml-2">
              ${product.basePrice.toFixed(2)}
            </span>
          </div>

          <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">
            {product.description}
          </p>

          <div className="flex flex-col gap-2.5 mt-auto">
             <div className="flex flex-row gap-2 w-full">
               <button 
                 onClick={handleCustomize}
                 className="flex-1 py-1.5 bg-white border border-[var(--primary)] text-[var(--primary)] rounded-lg font-medium text-[11px] flex items-center justify-center gap-1.5 active:scale-95 transition-transform">
                 <Utensils size={14} />
                 Customize
               </button>
               <button 
                 onClick={() => addToCart({
                   ...product,
                   price: (product.basePrice * (product.sizes?.[0]?.multiplier || 1)).toFixed(2)
                 })}
                 className="flex-1 py-1.5 bg-[var(--primary)] text-white rounded-lg font-medium text-[11px] flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition-transform">
                 <Handbag size={14} />
                 Order
               </button>
             </div>
          </div>
        </div>
      </div>

      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50" />
        <Dialog.Content
          style={styleVars}
          className="
            fixed z-50
            top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
            bg-white
            rounded-2xl
            shadow-2xl
            w-[95%] md:w-[900px] max-w-[98vw]
            max-h-[85vh]
            p-5 md:p-8
            overflow-y-auto
            scrollbar-hide
          "
        >
          <Dialog.Close
            className="
            absolute top-2 right-2 md:top-6 md:right-6
            cursor-pointer
            bg-gray-100 md:bg-transparent
            rounded-full md:rounded-none
            w-8 h-8 md:w-auto md:h-auto
            flex items-center justify-center
            border-none
            outline-none
            group
            z-10
          "
          >
            <X size={20} className="text-gray-500 md:text-gray-400 group-hover:text-gray-600 transition-colors" />
          </Dialog.Close>

          <div className="flex flex-col md:flex-row gap-5 md:gap-8 mt-8 md:mt-0">
            <div className="w-[70%] mx-auto md:w-1/2 md:mx-0">
              <img
                src={product.src}
                alt={product.name}
                className="w-full h-[260px] md:h-auto object-contain md:object-cover rounded-xl"
              />
            </div>

            <div className="w-full md:w-1/2 flex flex-col gap-4">
              <div className="pr-8 md:pr-0">
                <Dialog.Title className="text-xl md:text-2xl font-semibold text-[var(--text-primary)] leading-tight">
                    {product.name}
                </Dialog.Title>

                <p className="text-[var(--primary)] text-xl md:text-2xl font-bold mt-1">
                    ${product.basePrice.toFixed(2)}
                </p>
              </div>

              <p className="text-sm text-gray-600 leading-relaxed">
                {product.description}
              </p>
              
              <div className="flex flex-col gap-4 mt-2">
                <div className="flex items-center gap-2">
                  <span className="text-gray-700 font-medium md:hidden">Quantity:</span>
                  <div className="flex items-center w-[120px] md:w-[100px] h-[40px] border-2 border-gray-200 rounded-[10px] overflow-hidden bg-white">
                    <button
                      onClick={() => {
                        const input = document.getElementById(`qty-${product.id}`);
                        input.value = Math.max(1, Number(input.value) - 1);
                      }}
                      className="w-10 h-full flex items-center pb-1 justify-center text-xl font-bold text-gray-600 hover:bg-gray-50"
                    >
                      -
                    </button>

                    <input
                      id={`qty-${product.id}`}
                      type="number"
                      defaultValue={1}
                      className="w-full h-full text-center outline-none border-none [appearance:textfield] caret-transparent text-lg font-medium text-gray-700"
                    />

                    
                    <button
                      onClick={() => {
                        const input = document.getElementById(`qty-${product.id}`);
                        input.value = Number(input.value) + 1;
                      }}
                      className="w-10 h-full flex pb-0.5 items-center justify-center text-xl font-bold text-gray-600 hover:bg-gray-50"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="flex flex-col md:flex-row gap-3 w-full">
                  <div 
                    onClick={handleCustomize}
                    className="w-full md:flex-1 h-[48px] md:h-[45px] border-2 border-[var(--primary)] rounded-full flex items-center justify-center group hover:bg-[var(--primary)] duration-300 cursor-pointer bg-white transition-colors">
                    <Utensils
                      strokeWidth={1.5}
                      size={20}
                      className="text-[var(--primary)] group-hover:text-white duration-300"
                    />
                    <h5 className="ml-2 text-[var(--primary)] group-hover:text-white duration-300 font-bold text-sm md:text-base">
                      Customize It
                    </h5>
                  </div>

                  <div 
                    onClick={() => {
                        const input = document.getElementById(`qty-${product.id}`);
                        const qty = Number(input.value) || 1;
                        addToCart({
                          ...product,
                          price: (product.basePrice * (product.sizes?.[0]?.multiplier || 1)).toFixed(2)
                        }, qty);
                    }}
                    className="w-full md:flex-1 h-[48px] md:h-[45px] border-2 border-[var(--primary)] rounded-full flex items-center justify-center group hover:bg-green-700 duration-300 cursor-pointer bg-[var(--primary)] transition-colors">
                    <Handbag
                      strokeWidth={1.5}
                      size={20}
                      className="text-white duration-300"
                    />
                    <h5 className="ml-2 text-white duration-300 font-bold text-sm md:text-base">
                      Add to Cart
                    </h5>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
      <ProductModal 
        isOpen={isCustomizeOpen} 
        onClose={() => setIsCustomizeOpen(false)} 
        product={product} 
      />
    </Dialog.Root>
  );
}

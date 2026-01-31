import React, { useState } from "react";
import { Handbag, Eye, Utensils } from "lucide-react";
import ProductModal from "../ProductModal";
import * as Dialog from "@radix-ui/react-dialog";
import { Link } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import { COLORS } from "../../config/colors";

export default function ViewItems({ product }) {
  const [isCustomizeOpen, setIsCustomizeOpen] = useState(false);
  const { addToCart } = useCart();
  
  const handleCustomize = () => {
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
      <div className="w-full" style={styleVars}>
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

        <Link to={`/product/${product.id}`} className="block mt-8 mb-3 text-center group cursor-pointer">
          <h3 className="text-[13px] font-[500] text-[var(--text-secondary)] group-hover:text-[var(--primary)] group-hover:underline transition-colors">
            {product.name}
          </h3>
        </Link>

        <div className="flex flex-row gap-3 px-4 pb-4 justify-center">
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
              Add To Cart
            </h5>
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
            w-[900px] max-w-[95vw]
            max-h-[90vh]
            p-8
            overflow-auto
          "
        >
          <Dialog.Close
            className="
            absolute top-4 right-4
            text-3xl
            leading-none
            cursor-pointer
            bg-transparent
            border-none
            outline-none
            p-1
            hover:text-gray-400
            transition
            duration-300
          "
          >
            &times;
          </Dialog.Close>

          <div className="flex gap-8 ">
            <div className="w-full md:w-1/2">
              <img
                src={product.src}
                alt={product.name}
                className="w-full h-auto rounded-xl"
              />
            </div>

            <div className="w-full md:w-1/2 flex flex-col gap-4">
              <Dialog.Title className="text-2xl font-semibold text-[var(--text-primary)] ">
                {product.name}
              </Dialog.Title>

              <p className="text-[var(--primary)] text-2xl font-bold">
                ${product.basePrice.toFixed(2)}
              </p>

              <p className="text-sm text-gray-600 leading-relaxed">
                {product.description}
              </p>
              <div className="flex flex-col gap-4 w-full">
                <div className="flex items-center gap-2 justify-center lg:justify-start">
                  <div className="flex items-center w-[120px] h-[40px] border-2 border-gray-200 rounded-[10px] overflow-hidden bg-white">
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


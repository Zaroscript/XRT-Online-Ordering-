import React, { useState, useEffect } from "react"; // Added useState, useEffect
import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { COLORS } from "../config/colors";
import { useProductCustomization } from "../hooks/useProductCustomization";
import ProductCustomizer from "./Product/ProductCustomizer";
import ProductActionBar from "./Product/ProductActionBar"; // Added Import
import { useCart } from "../context/CartContext"; // Added Context

export default function ProductModal({ isOpen, onClose, product }) {
  // Use shared logic
  const {
    selectedSize,
    setSelectedSize,
    selectedModifiers,
    toggleModifier,
    updateModifierLevel,
    updateModifierPlacement,
    totalPrice
  } = useProductCustomization(isOpen ? product : null); 

  const { addToCart } = useCart(); // Get context
  const [qty, setQty] = useState(1); // Local state for qty

  // Reset qty when opening logic
  useEffect(() => {
    if (isOpen) setQty(1);
  }, [isOpen]);

  if (!product) return null;

  const styleVars = {
    '--primary': COLORS.primary,
    '--text-primary': COLORS.textPrimary,
    '--text-secondary': COLORS.textSecondary,
    '--text-gray': COLORS.textGray,
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60]" />
        <Dialog.Content
          style={styleVars}
          className="
            fixed z-[60]
            top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
            bg-white
            rounded-2xl
            shadow-2xl
            w-[90%] md:w-[880px] max-w-[95vw]
            max-h-[92vh]
            flex flex-col
            outline-none
          "
        >
          {/* Close Button Header - Fixed at top relative to modal content */}
          <div className="absolute top-4 right-4 z-10">
            <Dialog.Close asChild>
              <button
                className="
                  p-1
                  rounded-full
                  bg-gray-100/80 hover:bg-gray-200
                  transition-colors
                  outline-none
                "
                aria-label="Close"
              >
                <X size={24} className="text-gray-500 hover:text-gray-700" />
              </button>
            </Dialog.Close>
          </div>

          {/* Scrollable Content Area */}
          <div className="flex-1 overflow-y-auto scrollbar-hide p-6 md:p-8 pb-32">
              <div className="flex flex-col md:flex-row gap-6 md:gap-8">
                <div className="w-full md:w-1/2">
                  <img
                    src={product.src}
                    alt={product.name}
                    className="w-full h-auto object-cover rounded-xl"
                  />
                </div>

                <div className="w-full md:w-1/2 flex flex-col gap-3 justify-center">
                  <Dialog.Title className="text-2xl font-bold text-[var(--text-primary)] leading-tight text-center md:text-left">
                    {product.name}
                  </Dialog.Title>

                  <Dialog.Description className="text-md text-gray-600 leading-relaxed text-center md:text-left">
                    {product.description}
                  </Dialog.Description>
                </div>
              </div>

              <ProductCustomizer 
                product={product}
                selectedSize={selectedSize}
                setSelectedSize={setSelectedSize}
                selectedModifiers={selectedModifiers}
                toggleModifier={toggleModifier}
                updateModifierLevel={updateModifierLevel}
                updateModifierPlacement={updateModifierPlacement}
              />

              {/* Static Bottom Bar inside Modal Scroll */}
              <ProductActionBar 
                qty={qty} 
                setQty={setQty}
                price={totalPrice}
                onAddToCart={() => {
                    const customizedProduct = {
                        ...product,
                        selectedSize,
                        selectedModifiers,
                        price: totalPrice
                    };
                    addToCart(customizedProduct, qty);
                    onClose(); 
                }}
                className="!mt-8 !pt-6 !border-t-gray-100" 
              />
          </div>
          
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { products } from "../config/constants";
import { useProductCustomization } from "../hooks/useProductCustomization";
import { ProductSizes, ProductModifiers } from "../Component/Product/ProductCustomizer";
import ProductActionBar from "../Component/Product/ProductActionBar";
import { useCart } from "../context/CartContext";
import { ArrowLeft, Handbag } from "lucide-react";
import { COLORS } from "../config/colors";

export default function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [product, setProduct] = useState(null);
  const [qty, setQty] = useState(1);

  // Load product data
  useEffect(() => {
    if (id) {
      const foundProduct = products.find((p) => p.id === parseInt(id));
      if (foundProduct) {
        setProduct(foundProduct);
      } else {
        console.warn("Product not found");
      }
    }
  }, [id, navigate]);

  // Use the shared hook
  const {
    selectedSize,
    setSelectedSize,
    selectedModifiers,
    toggleModifier,
    updateModifierLevel,
    updateModifierPlacement,
    totalPrice
  } = useProductCustomization(product);

  if (!product) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Loading...</p>
      </div>
    );
  }

  const styleVars = {
    '--primary': COLORS.primary,
    '--text-primary': COLORS.textPrimary,
    '--text-secondary': COLORS.textSecondary,
    '--text-gray': COLORS.textGray,
  };

  return (
    <div className="min-h-screen bg-white pb-12" style={styleVars}>
      {/* Header / Nav Back */}
      <div className="bg-white sticky top-0 z-40 border-b border-gray-100 px-4 py-3 flex items-center gap-3 shadow-sm md:hidden">
        <button 
            onClick={() => navigate(-1)}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
        >
            <ArrowLeft className="text-gray-700" size={24} />
        </button>
        <h1 className="text-lg font-bold text-gray-800 truncate">{product.name}</h1>
      </div>

      <div className="max-w-7xl mx-auto md:py-10 md:px-6">
        
        {/* TOP SECTION: IMAGE & INFO */}
        <div className="flex flex-col md:flex-row gap-8 md:gap-12 mb-8">
           {/* Image (Left) */}
           <div className="w-full md:w-1/2">
             <div className="relative w-full pb-[75%] md:pb-[100%]">
                <img 
                    src={product.src} 
                    alt={product.name}
                    className="absolute inset-0 w-full h-full object-contain md:object-cover bg-gray-50 md:rounded-2xl"
                />
             </div>
           </div>

           {/* Info (Right) */}
           <div className="w-full md:w-1/2 px-5 md:px-0 flex flex-col justify-center">
               <div className="hidden md:block">
                  <h1 className="text-4xl font-bold text-[var(--text-primary)] mb-4 leading-tight">{product.name}</h1>
                  <p className="text-4xl font-bold text-[var(--primary)] mb-6">${totalPrice}</p>
               </div>

               {/* Mobile Title Block */}
               <div className="md:hidden flex flex-col gap-2 mb-6">
                  <h2 className="text-3xl font-bold text-[var(--text-primary)] leading-tight">{product.name}</h2>
                  <p className="text-2xl font-bold text-[var(--primary)]">${totalPrice}</p>
               </div>

               <p className="text-gray-600 text-lg leading-relaxed">
                  {product.description}
               </p>
           </div>
        </div>

        {/* MIDDLE SECTION: SIZES */}
        <div className="px-5 md:px-0 mb-10">
          <ProductSizes 
             product={product}
             selectedSize={selectedSize}
             setSelectedSize={setSelectedSize}
           />
        </div>

        {/* DIVIDER */}
        {product.modifiers && product.modifiers.length > 0 && (
           <div className="w-full h-px bg-gray-100 mb-10 mx-5 md:mx-0" />
        )}

        {/* BOTTOM SECTION: MODIFIERS */}
        <div className="px-5 md:px-0 mb-16">
           {product.modifiers && product.modifiers.length > 0 && (
             <h3 className="text-3xl font-bold text-[var(--text-primary)] mb-8">Customize Your Order</h3>
           )}
           
           <ProductModifiers 
             product={product}
             selectedModifiers={selectedModifiers}
             toggleModifier={toggleModifier}
             updateModifierLevel={updateModifierLevel}
             updateModifierPlacement={updateModifierPlacement}
           />
        </div>

        {/* FOOTER: ADD TO CART */}
        <ProductActionBar 
           qty={qty} 
           setQty={setQty}
           price={totalPrice} // Pass dynamic price
           onAddToCart={() => {
              const customizedProduct = {
                  ...product,
                  selectedSize,
                  selectedModifiers,
                  price: totalPrice // Ensure cart gets the calculated price
              };
              addToCart(customizedProduct, qty);
           }}
        />

      </div>
    </div>
  );
}

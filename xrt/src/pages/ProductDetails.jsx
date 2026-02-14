import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useProductsQuery } from '@/api';
import { computeTotalPrice } from '../utils/priceUtils';
import { buildDefaultModifiers, getDefaultSize, getDefaultLevel, getDefaultPlacement } from '../utils/defaultModifiers';
import { useCart } from '../context/CartContext';
import ProductCustomizer from '../Component/Product/ProductCustomizer';
import { COLORS } from '../config/colors';
import { Handbag } from 'lucide-react';
import SignatureProducts from '../Component/Product/SignatureProducts';

const ProductDetails = () => {
  const { id } = useParams();
  const { addToCart } = useCart();
  const { products, loading } = useProductsQuery();
  const product = products.find((p) => String(p.id) === String(id));

  const [selectedSize, setSelectedSize] = useState(null);
  const [selectedModifiers, setSelectedModifiers] = useState({});
  const [quantity, setQuantity] = useState(1);

  // Initialize defaults when product loads (auto-select default modifiers from admin)
  useEffect(() => {
    if (product) {
      setSelectedSize(getDefaultSize(product));
      setSelectedModifiers(buildDefaultModifiers(product));
      setQuantity(1);
    }
  }, [product]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="w-10 h-10 border-4 border-gray-200 border-t-green-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <h2 className="text-2xl font-bold text-gray-500">Product not found</h2>
      </div>
    );
  }

  const toggleModifier = (section, optionLabel) => {
    setSelectedModifiers(prev => {
      const current = prev[section.title];

      if (section.type === 'single') {
        if (current === optionLabel) {
          return { ...prev, [section.title]: undefined };
        }
        return { ...prev, [section.title]: optionLabel };
      } else {
        const currentList = Array.isArray(current) ? current : [];
        if (currentList.includes(optionLabel)) {
          return { ...prev, [section.title]: currentList.filter(l => l !== optionLabel) };
        } else {
          return { ...prev, [section.title]: [...currentList, optionLabel] };
        }
      }
    });
  };

  const updateModifierLevel = (sectionTitle, optionLabel, level) => {
     setSelectedModifiers(prev => {
         const currentSectionListeners = prev[sectionTitle] || {};
         const updatedSection = { ...currentSectionListeners };
         const currentOptionVal = updatedSection[optionLabel];
         
         let newVal = { level: "Normal", placement: "Whole" };
         if (typeof currentOptionVal === 'string') {
             newVal = { level: currentOptionVal, placement: "Whole" };
         } else if (typeof currentOptionVal === 'object') {
             newVal = { ...currentOptionVal };
         }
         
         newVal.level = level;
         updatedSection[optionLabel] = newVal;
         
         return { ...prev, [sectionTitle]: updatedSection };
     });
  };

  const updateModifierPlacement = (sectionTitle, optionLabel, placement) => {
      setSelectedModifiers(prev => {
         const currentSectionListeners = prev[sectionTitle] || {};
         const updatedSection = { ...currentSectionListeners };
         const currentOptionVal = updatedSection[optionLabel];
         
         let newVal = { level: "Normal", placement: "Whole" };
         if (typeof currentOptionVal === 'string') {
             newVal = { level: currentOptionVal, placement: "Whole" };
         } else if (typeof currentOptionVal === 'object') {
             newVal = { ...currentOptionVal };
         }
         
         newVal.placement = placement;
         updatedSection[optionLabel] = newVal;
         
         return { ...prev, [sectionTitle]: updatedSection };
     });
  };

  const handleToggleModifier = (section, optionLabel) => {
      const isComplex = section.options.some((opt) => opt.hasLevel || opt.hasPlacement);
      const isSingle = section.type === 'single';

      if (isComplex) {
          setSelectedModifiers(prev => {
              const sectionState = isSingle ? {} : { ...(prev[section.title] || {}) };
              const isCurrentlySelected = isSingle
                ? (typeof prev[section.title] === 'object' && prev[section.title]?.[optionLabel])
                : sectionState[optionLabel];
              if (isSingle && isCurrentlySelected) {
                  return { ...prev, [section.title]: undefined };
              }
              if (!isSingle && sectionState[optionLabel]) {
                  delete sectionState[optionLabel];
              } else {
                  const option = section.options.find((o) => o.label === optionLabel);
                  sectionState[optionLabel] = {
                      level: getDefaultLevel(option),
                      placement: getDefaultPlacement(option),
                  };
              }
              return { ...prev, [section.title]: sectionState };
          });
      } else {
          toggleModifier(section, optionLabel);
      }
  };

  const totalPrice = computeTotalPrice(product, selectedSize, selectedModifiers, quantity);

  return (
    <div 
      className="flex justify-center p-4 md:p-8 min-h-screen bg-gray-50"
      style={{
        '--primary': COLORS.primary,
        '--text-primary': COLORS.textPrimary,
      }}
    >
      <div className="w-full max-w-7xl flex flex-col gap-8">
        <div className="relative bg-white rounded-2xl w-full overflow-hidden shadow-sm">
             
             <div className="p-6 md:p-8">
                {/* Top Section: 2 Columns */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8 items-center">
                   {/* Left: Image */}
                   <div>
                      <img 
                        src={product.src || null} 
                        alt={product.name} 
                        className="w-full h-auto rounded-xl object-cover shadow-sm border border-gray-100" 
                      />
                   </div>
                   
                   {/* Right: Info */}
                   <div>
                      <h2 className="text-3xl font-bold text-gray-800 mb-2">{product.name}</h2>
                      <p className="text-gray-500 leading-relaxed">{product.description}</p>
                   </div>
                </div>

                {/* Below: Customizer (Sizes & Modifiers) */}
                <div className="mb-8">
                   <ProductCustomizer 
                     product={product}
                     selectedSize={selectedSize}
                     setSelectedSize={setSelectedSize}
                     selectedModifiers={selectedModifiers}
                     toggleModifier={handleToggleModifier}
                     updateModifierLevel={updateModifierLevel}
                     updateModifierPlacement={updateModifierPlacement}
                   />
                </div>

                {/* Bottom: Cart Controls */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-gray-100">
                    <div className="flex items-center gap-4 w-full sm:w-auto">
                       <span className="text-gray-700 font-medium hidden sm:inline">Quantity:</span>
                       <div className="flex items-center bg-white border border-gray-200 rounded-lg h-12 w-full sm:w-auto justify-between sm:justify-start">
                          <button 
                            onClick={() => setQuantity(Math.max(1, quantity - 1))}
                            className="px-4 h-full hover:bg-gray-50 text-xl font-bold text-gray-600 rounded-l-lg transition-colors"
                          >-</button>
                          <span className="w-12 text-center font-bold text-gray-800">{quantity}</span>
                          <button 
                            onClick={() => setQuantity(quantity + 1)}
                            className="px-4 h-full hover:bg-gray-50 text-xl font-bold text-gray-600 rounded-r-lg transition-colors"
                          >+</button>
                       </div>
                    </div>

                    <button 
                      onClick={() => {
                          const unitPrice = computeTotalPrice(product, selectedSize, selectedModifiers, 1);
                          addToCart({...product, modifiers: selectedModifiers, size: selectedSize, price: unitPrice}, quantity);
                          // Optional: navigate back or show toast
                      }}
                      className="w-full sm:w-auto px-32 h-14 bg-[var(--primary)] text-white font-bold rounded-xl flex items-center justify-center gap-3 hover:opacity-90 transition-all shadow-lg shadow-green-200/50 hover:shadow-xl hover:-translate-y-0.5"
                      style={{ backgroundColor: COLORS.primary }}
                    >
                      <Handbag size={22} />
                      <span>Add to Order</span>
                      <span>${totalPrice}</span>
                    </button>
                </div>
             </div>
        </div>
        
        <SignatureProducts />
      </div>
    </div>
  );
};

export default ProductDetails;

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Handbag } from 'lucide-react';
import { useCart } from '../context/CartContext';
import ProductCustomizer from './Product/ProductCustomizer';
import { COLORS } from '../config/colors';
import { computeTotalPrice } from '../utils/priceUtils';
import {
  buildDefaultModifiers,
  getDefaultSize,
  getDefaultLevel,
  getDefaultPlacement,
} from '../utils/defaultModifiers';

const ProductModal = ({ isOpen, onClose, product }) => {
  const { addToCart } = useCart();
  const [selectedSize, setSelectedSize] = useState(null);
  const [selectedModifiers, setSelectedModifiers] = useState({});
  const [quantity, setQuantity] = useState(1);

  // Product from API/list already has modifiers + sizes from api/products.js (with overrides merged)
  const activeProduct = product;

  useEffect(() => {
    if (!activeProduct || !isOpen) return;
    const defSize = getDefaultSize(activeProduct);
    const defModifiers = buildDefaultModifiers(activeProduct);
    const tid = setTimeout(() => {
      setSelectedSize(defSize);
      setSelectedModifiers(defModifiers);
      setQuantity(1);
    }, 0);
    return () => clearTimeout(tid);
  }, [activeProduct, isOpen]);


  const toggleModifier = (section, optionLabel) => {
    setSelectedModifiers(prev => {
      const current = prev[section.title];
      
      if (section.type === 'single') {
        // Toggle off if clicking the already-selected option; otherwise select the new option
        if (current === optionLabel) {
          return { ...prev, [section.title]: undefined };
        }
        return { ...prev, [section.title]: optionLabel };
      } else {
        // Multiple
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
         // Ensure it is an object if we are entering complex mode
         const updatedSection = { ...currentSectionListeners };
         
         const currentOptionVal = updatedSection[optionLabel];
         
         // If string (just level or simple), convert to object
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

  // Simplified handler for ProductCustomizer which seems to expect specific signatures
  // Based on reading ProductCustomizer.jsx:
  /*
     const val = selectedModifiers[section.title]?.[opt.label];
     isSelected = !!val; 
     // ...
     if (typeof val === "string") ... else if (typeof val === "object") ...
  */
  // So for complex modifiers (sections with hasLevel/hasPlacement), the state for that section
  // is NOT an array of strings, but an object where keys are option labels.
  // BUT for simple "multiple" sections, it expects an array?
  // 
  // Line 124: isSelected = selectedModifiers[section.title]?.includes(opt.label);
  // So we need to detect type to update state correctly.

  const handleToggleModifier = (section, optionLabel) => {
    const isComplex = section.options.some((opt) => opt.hasLevel || opt.hasPlacement);
    const isSingle = section.type === "single";
    if (isComplex) {
      setSelectedModifiers((prev) => {
        const currentSection = prev[section.title];
        const sectionState = isSingle ? {} : { ...(currentSection || {}) };
        const isCurrentlySelected = isSingle
          ? (typeof currentSection === "object" && currentSection?.[optionLabel])
          : sectionState[optionLabel];
        // For single: if clicking the already-selected option, deselect
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


  if (!isOpen || !product) return null;

// ... (inside component)

  const totalPrice = computeTotalPrice(product, selectedSize, selectedModifiers, quantity);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
             {/* Close Button */}
             <button 
                onClick={onClose} 
                className="absolute top-4 right-4 z-10 p-2 bg-white/80 hover:bg-gray-100 rounded-full transition-colors shadow-sm"
             >
                <X size={24} className="text-gray-500" />
             </button>

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
                     product={activeProduct}
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
                          const unitPrice = computeTotalPrice(activeProduct, selectedSize, selectedModifiers, 1);
                          addToCart({
                              ...activeProduct, 
                              modifiers: selectedModifiers, 
                              size: selectedSize, 
                              price: unitPrice,
                              isCustomized: Object.keys(selectedModifiers).length > 0
                          }, quantity);
                          onClose();
                      }}
                      className="w-full sm:flex-1 h-14 bg-[var(--primary)] text-white font-bold rounded-xl flex items-center justify-center gap-3 hover:opacity-90 transition-all shadow-lg shadow-green-200/50 hover:shadow-xl hover:-translate-y-0.5"
                      style={{ backgroundColor: COLORS.primary }}
                    >
                      <Handbag size={22} />
                      <span>Add to Order</span>
                      <span>${totalPrice}</span>
                    </button>
                </div>
             </div>

          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default ProductModal;

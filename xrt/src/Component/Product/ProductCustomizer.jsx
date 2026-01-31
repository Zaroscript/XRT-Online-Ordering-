import React from "react";
import { Check, Circle, CircleDot } from "lucide-react";

/**
 * Helper strictly for local use
 */
const sectionIsComplex = (section) => section.options.some((opt) => opt.hasLevel || opt.hasPlacement);

/**
 * Component for rendering Sizes selection
 */
export function ProductSizes({ product, selectedSize, setSelectedSize }) {
  if (!product || !product.sizes || product.sizes.length === 0) return null;

  return (
    <div className="mt-8 pt-6 border-t border-gray-100">
      <h4 className="font-semibold text-2xl text-[var(--text-primary)] mb-5 text-left">
        Choose Size
      </h4>
      <div className="flex flex-row gap-4 overflow-x-auto pb-2 scrollbar-hide">
        {product.sizes.map((sizeObj, index) => {
           // Normalize: sizeObj might be a string (legacy) or object
           const label = typeof sizeObj === "string" ? sizeObj : sizeObj.label;
           
           // Calculate dynamic price
           let displayPrice = null;
           if (typeof sizeObj === "object" && sizeObj.multiplier && product.basePrice) {
                const numericPrice = product.basePrice * sizeObj.multiplier;
                displayPrice = Number.isInteger(numericPrice) ? numericPrice : numericPrice.toFixed(2);
           } else if (typeof sizeObj === "object" && sizeObj.price) {
                displayPrice = sizeObj.price;
           }
           
           // Robust comparison: check against selectedSize which might be object or string, matching by label or value
           const isSelected = selectedSize && (
              (selectedSize.label && selectedSize.label === label) || 
              (selectedSize === label) || 
              (typeof selectedSize === 'string' && selectedSize === label) // redundant but safe
           );

          return (
            <button
              key={index}
              onClick={() => setSelectedSize(sizeObj)}
              className={`
                min-w-[100px] py-3 px-5 rounded-xl flex flex-col items-center justify-center gap-1 transition-all duration-200 border
                ${
                  isSelected
                    ? "border-[var(--primary)] bg-[var(--primary)]/5 text-[var(--primary)] shadow-sm"
                    : "border-gray-200 bg-white text-gray-600 hover:border-[var(--primary)]/50 hover:bg-gray-50"
                }
              `}
            >
              <span className="text-base font-bold">{label}</span>
              {displayPrice !== null && (
                 <span className={`text-xs ${isSelected ? "font-bold" : "font-medium text-gray-400"}`}>
                   ${displayPrice}
                 </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/**
 * Component for rendering Modifiers selection
 */
export function ProductModifiers({ 
  product, 
  selectedSize, // Added selectedSize prop
  selectedModifiers, 
  toggleModifier, 
  updateModifierLevel, 
  updateModifierPlacement 
}) {
  if (!product || !product.modifiers || product.modifiers.length === 0) return null;

  const LEVEL_MULTIPLIERS = {
    "Light": 0.5,
    "Normal": 1.0,
    "Extra": 1.5
  };

  const sizeMultiplier = (selectedSize && selectedSize.multiplier) ? parseFloat(selectedSize.multiplier) : 1;

  return (
    <>
      {product.modifiers.map((section, idx) => {
         const isComplex = sectionIsComplex(section);
         
         return (
          <div key={idx} className="mt-8 pt-5 border-t border-gray-100">
            <h4 className="font-semibold text-xl text-[var(--text-primary)] mb-4 text-left">
              {section.title}
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {section.options.map((opt, optIdx) => {
                const isSingle = section.type === "single";
                // Check if selected
                let isSelected = false;
                let currentLevel = null;
                let currentPlacement = null;

                if (isSingle) {
                  isSelected = selectedModifiers[section.title] === opt.label;
                } else if (isComplex) {
                   // Object storage
                   const val = selectedModifiers[section.title]?.[opt.label];
                   isSelected = !!val;
                   
                   if (isSelected) {
                     if (typeof val === "string") {
                       currentLevel = val;
                     } else if (typeof val === "object") {
                       currentLevel = val.level;
                       currentPlacement = val.placement;
                     }
                   }
                } else {
                  // Array storage
                  isSelected = selectedModifiers[section.title]?.includes(opt.label);
                }

                // Calculate Dynamic Price
                let displayPrice = 0;
                if (isSelected) {
                    const baseExtra = opt.baseExtra !== undefined ? opt.baseExtra : (opt.price || 0);
                    let levelMult = 1;
                    if (opt.hasLevel && currentLevel) {
                         levelMult = LEVEL_MULTIPLIERS[currentLevel] || 1;
                    }
                    displayPrice = baseExtra * levelMult * sizeMultiplier;
                }

                return (
                  <div key={optIdx} className="flex flex-col gap-2">
                    <label
                      className={`
                        flex items-center p-4 rounded-xl border cursor-pointer transition-all duration-200 hover:bg-gray-50
                        ${isSelected ? "border-[var(--primary)] bg-[var(--primary)]/5" : "border-gray-200"}
                      `}
                    >
                      <div className={`
                          w-6 h-6 flex items-center justify-center mr-4 transition-colors shrink-0
                          ${isSingle 
                            ? (isSelected ? "text-[var(--primary)]" : "text-gray-300") 
                            : (isSelected ? "bg-[var(--primary)] border-[var(--primary)] rounded text-white" : "bg-white border border-gray-300 rounded")
                          }
                        `}
                      >
                         <input
                            type={isSingle ? "radio" : "checkbox"}
                            className="hidden"
                            checked={!!isSelected}
                            onChange={() => toggleModifier(section, opt.label)}
                          />
                          
                          {isSingle ? (
                            isSelected ? <CircleDot size={24} /> : <Circle size={24} />
                          ) : (
                             isSelected && <Check size={16} className="text-white" />
                          )}
                      </div>
                      <span className={`text-base flex-1 ${isSelected ? "font-medium text-[var(--text-primary)]" : "text-gray-600"}`}>
                        {opt.label}
                      </span>
                      {displayPrice > 0 && (
                          <span className="text-sm font-bold text-[var(--primary)] mr-2">
                             +${displayPrice.toFixed(2)}
                          </span>
                      )}
                    </label>

                    {/* CONTROLS CONTAINER */}
                    {isSelected && (opt.hasLevel || opt.hasPlacement) && (
                      <div className="flex flex-col gap-1 ml-1">
                        
                        {/* LEVEL SELECTOR */}
                        {opt.hasLevel && currentLevel && (
                          <div className="flex flex-row bg-gray-100 p-1 rounded-md">
                            {["Light", "Normal", "Extra"].map((lvl) => (
                              <button
                                key={lvl}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  updateModifierLevel(section.title, opt.label, lvl);
                                }}
                                className={`
                                  flex-1 text-[10px] sm:text-xs font-medium py-1 rounded transition-all
                                  ${currentLevel === lvl 
                                      ? "bg-white text-[var(--primary)] shadow-sm" 
                                      : "text-gray-500 hover:text-gray-700 hover:bg-gray-200"}
                                `}
                              >
                                {lvl}
                              </button>
                            ))}
                          </div>
                        )}

                        {/* PLACEMENT SELECTOR */}
                        {opt.hasPlacement && currentPlacement && (
                          <div className="flex flex-row bg-gray-50 p-1 rounded-md mt-1 items-center justify-center gap-4">
                            {[
                              { label: "Left", val: "Left" },
                              { label: "Whole", val: "Whole" },
                              { label: "Right", val: "Right" }
                            ].map((place) => {
                              const isActive = currentPlacement === place.val;
                              return (
                                <button
                                  key={place.val}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    updateModifierPlacement(section.title, opt.label, place.val);
                                  }}
                                  className={`
                                    p-1 rounded-full transition-all duration-200
                                    ${isActive 
                                       ? "text-[var(--primary)] bg-white shadow-sm scale-110" 
                                       : "text-gray-400 hover:text-gray-600 hover:bg-gray-200"}
                                  `}
                                  title={place.label}
                                >
                                  {/* Custom Pizza Icon SVG */}
                                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    {/* Outer Ring */}
                                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" />
                                    
                                    {/* Fill based on type */}
                                    {place.val === "Whole" && (
                                      <circle cx="12" cy="12" r="7" fill="currentColor" />
                                    )}
                                    {place.val === "Left" && (
                                      <path d="M12 5 A7 7 0 0 0 12 19 Z" fill="currentColor" />
                                    )}
                                    {place.val === "Right" && (
                                      <path d="M12 5 A7 7 0 0 1 12 19 Z" fill="currentColor" />
                                    )}
                                  </svg>
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </>
  );
}

/**
 * Default export wrapping both for backward compatibility (used in ProductModal)
 */
export default function ProductCustomizer(props) {
  return (
    <>
      <ProductSizes {...props} />
      <ProductModifiers {...props} />
    </>
  );
}

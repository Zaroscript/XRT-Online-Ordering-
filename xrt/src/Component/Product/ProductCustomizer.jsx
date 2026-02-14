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
           
           let displayPrice = null;
           if (typeof sizeObj === "object" && sizeObj.price != null) {
             displayPrice = Number(sizeObj.price);
             displayPrice = Number.isInteger(displayPrice) ? displayPrice : Number(displayPrice.toFixed(2));
           } else if (typeof sizeObj === "object" && sizeObj.multiplier && product.basePrice) {
             const numericPrice = product.basePrice * sizeObj.multiplier;
             displayPrice = Number.isInteger(numericPrice) ? numericPrice : numericPrice.toFixed(2);
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

  const sizeMultiplier =
    selectedSize && selectedSize.multiplier ? parseFloat(selectedSize.multiplier) : 1;
  const sizeCode = selectedSize?.code ?? selectedSize?.label ?? null;

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
                  // Radio: value can be string (simple) or object keyed by option (complex with level/placement)
                  const sectionVal = selectedModifiers[section.title];
                  if (typeof sectionVal === "string") {
                    isSelected = sectionVal === opt.label;
                  } else if (sectionVal && typeof sectionVal === "object" && !Array.isArray(sectionVal)) {
                    const val = sectionVal[opt.label];
                    isSelected = !!val;
                    if (isSelected) {
                      currentLevel = typeof val === "object" && val != null ? val.level : val;
                      currentPlacement = typeof val === "object" && val != null ? val.placement : null;
                    }
                  } else {
                    isSelected = false;
                  }
                } else if (isComplex) {
                   // Object storage (multiple + complex)
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

                const getModifierPrice = (option, size) => {
                  if (option.prices_by_size?.length && size) {
                    const code = size.code ?? size.label;
                    const sizeMatch = option.prices_by_size.find(
                      (pbs) =>
                        (pbs.size_id && pbs.size_id === size.size_id) ||
                        (pbs.sizeCode && pbs.sizeCode === code) ||
                        (pbs.sizeCode && pbs.sizeCode === size.label)
                    );
                    if (sizeMatch != null) return sizeMatch.priceDelta;
                  }
                  // When item is not sizeable (no size), use modifier base price directly
                  const base = option.baseExtra ?? option.price ?? 0;
                  return size ? base * sizeMultiplier : base;
                };

                const quantityLevels = opt.quantity_levels && opt.quantity_levels.length > 0
                  ? [...opt.quantity_levels].sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0))
                  : [];
                const defaultLevel = quantityLevels.find((l) => l.is_default) || quantityLevels[0];
                const atDefaultLevel =
                  !quantityLevels.length ||
                  !currentLevel ||
                  (defaultLevel && (defaultLevel.name ?? String(defaultLevel.quantity)) === currentLevel);
                // Quantity level price for the currently selected size (updates when user changes size)
                const getLevelPrice = (level) => {
                  if (level?.prices_by_size?.length && selectedSize) {
                    const code = selectedSize.code ?? selectedSize.label;
                    const sizeId = selectedSize.size_id;
                    const match = level.prices_by_size.find(
                      (p) =>
                        (p.sizeCode && (p.sizeCode === code || p.sizeCode === selectedSize.label)) ||
                        (p.size_id && sizeId && p.size_id === sizeId)
                    );
                    if (match != null) return match.priceDelta;
                  }
                  if (level?.price != null) return level.price;
                  return null;
                };

                let displayPrice = 0;
                if (isSelected) {
                  // Default modifier at default quantity level is free
                  if (opt.is_default && atDefaultLevel) {
                    displayPrice = 0;
                  } else {
                    const basePrice = getModifierPrice(opt, selectedSize);
                    if (opt.hasLevel && currentLevel && quantityLevels.length > 0) {
                      const level = quantityLevels.find(
                        (l) => (l.name || String(l.quantity)) === currentLevel
                      );
                      const levelPrice = level ? getLevelPrice(level) : null;
                      displayPrice = levelPrice != null ? levelPrice : basePrice;
                    } else {
                      displayPrice = basePrice;
                    }
                  }
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
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              toggleModifier(section, opt.label);
                            }}
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
                        {/* LEVEL SELECTOR: use backend quantity_levels (e.g. Light, Normal, Extra) */}
                        {opt.hasLevel && currentLevel && quantityLevels.length > 0 && (
                          <div className="flex flex-row bg-gray-100 p-1 rounded-md">
                            {quantityLevels.map((lvl) => {
                              const lvlName = lvl.name ?? String(lvl.quantity);
                              return (
                                <button
                                  key={lvlName}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    updateModifierLevel(section.title, opt.label, lvlName);
                                  }}
                                  className={`
                                    flex-1 text-[10px] sm:text-xs font-medium py-1 rounded transition-all
                                    ${currentLevel === lvlName
                                      ? "bg-white text-[var(--primary)] shadow-sm"
                                      : "text-gray-500 hover:text-gray-700 hover:bg-gray-200"}
                                  `}
                                >
                                  {lvlName}
                                </button>
                              );
                            })}
                          </div>
                        )}

                        {/* PLACEMENT SELECTOR - only show active sides from modifier config */}
                        {opt.hasPlacement && currentPlacement && (() => {
                          const allPlaces = [
                            { label: "Left", val: "Left" },
                            { label: "Whole", val: "Whole" },
                            { label: "Right", val: "Right" },
                          ];
                          const activeSides = opt.allowed_sides?.length > 0
                            ? allPlaces.filter((p) =>
                                opt.allowed_sides.some((s) => s.toUpperCase() === p.val.toUpperCase())
                              )
                            : allPlaces;
                          return activeSides.length > 0 && (
                          <div className="flex flex-row bg-gray-50 p-1 rounded-md mt-1 items-center justify-center gap-4">
                            {activeSides.map((place) => {
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
                        );
                        })()}
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

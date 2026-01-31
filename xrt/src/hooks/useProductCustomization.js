import { useState, useEffect, useMemo } from "react";

/**
 * Hook to manage product customization state (size, modifiers).
 */
export function useProductCustomization(product) {
  const [selectedSize, setSelectedSize] = useState(null);
  const [selectedModifiers, setSelectedModifiers] = useState({});

  // Initialize defaults
  useEffect(() => {
    if (product) {
      // 1. Set Default Size
      if (product.sizes?.length > 0) {
        setSelectedSize(product.sizes[0]);
      }
      
      // 2. Set Default Modifiers
      const defaults = {};
      if (product.modifiers) {
        product.modifiers.forEach(section => {
          if (section.default) {
             // For complex or single, direct mapping might vary, assuming simple label match for defaults for now
             // If complex logic needed for defaults (e.g. default object with placement), we'd parse it here.
             // Given the current constants structure, 'default' is a string or array of strings.
             
             if (section.type === "single") {
                defaults[section.title] = section.default;
             } else {
                 // Multiple
                 const defArray = Array.isArray(section.default) ? section.default : [section.default];
                 
                 // If section is complex, we need to init as Objects
                 // But for now, let's assume defaults are simple "Presence" (true) or simple strings.
                 // If complex logic is required for defaults, we'd need to map to the structure { label: { level: 'Normal', ... } }
                 const isComplex = section.options.some(opt => opt.hasLevel || opt.hasPlacement);
                 
                 if (isComplex) {
                    const complexObj = {};
                    defArray.forEach(label => {
                        const opt = section.options.find(o => o.label === label);
                        if (opt) {
                             let val = true;
                             if (opt.hasLevel && opt.hasPlacement) val = { level: "Normal", placement: "Whole" };
                             else if (opt.hasLevel) val = "Normal";
                             else if (opt.hasPlacement) val = { placement: "Whole" };
                             complexObj[label] = val;
                        }
                    });
                    defaults[section.title] = complexObj;
                 } else {
                    defaults[section.title] = defArray;
                 }
             }
          }
        });
      }
      setSelectedModifiers(defaults);
    }
  }, [product]);

  /* 
   * Helper to check if a section uses "Complex" logic (Levels OR Placement).
   */
  const sectionIsComplex = (section) => section.options.some((opt) => opt.hasLevel || opt.hasPlacement);

  const toggleModifier = (section, optionLabel) => {
    const { title, type } = section;
    const isComplex = sectionIsComplex(section);

    setSelectedModifiers((prev) => {
      // Single choice logic
      if (type === "single") {
        return {
           ...prev,
           [title]: optionLabel
        };
      }

      // Multiple choice logic
      if (isComplex) {
        // State is an OBJECT
        const currentObj = prev[title] || {};
        if (currentObj[optionLabel]) {
          // Remove
          const newObj = { ...currentObj };
          delete newObj[optionLabel];
          return {
            ...prev,
            [title]: newObj
          };
        } else {
          // Add default values
          const optionConfig = section.options.find(o => o.label === optionLabel);
          
          let initialValue = true; // default fallback
          
          if (optionConfig?.hasPlacement && optionConfig?.hasLevel) {
            initialValue = { level: "Normal", placement: "Whole" };
          } else if (optionConfig?.hasPlacement) {
            initialValue = { placement: "Whole" };
          } else if (optionConfig?.hasLevel) {
            initialValue = "Normal";
          }

          return {
            ...prev,
            [title]: {
              ...currentObj,
              [optionLabel]: initialValue
            }
          };
        }
      } else {
        // State is an ARRAY
        const currentList = prev[title] || [];
        if (currentList.includes(optionLabel)) {
          // Remove
          return {
            ...prev,
            [title]: currentList.filter((item) => item !== optionLabel),
          };
        } else {
          // Add
          return {
            ...prev,
            [title]: [...currentList, optionLabel],
          };
        }
      }
    });
  };

  const updateModifierLevel = (sectionTitle, optionLabel, newLevel) => {
    setSelectedModifiers((prev) => {
       const currentVal = prev[sectionTitle]?.[optionLabel];
       let newVal = currentVal;

       if (typeof currentVal === "string") {
         newVal = newLevel;
       } else if (typeof currentVal === "object") {
         newVal = { ...currentVal, level: newLevel };
       }
       
       return {
         ...prev,
         [sectionTitle]: {
           ...prev[sectionTitle],
           [optionLabel]: newVal
         }
       };
    });
  };

  const updateModifierPlacement = (sectionTitle, optionLabel, newPlacement) => {
    setSelectedModifiers((prev) => {
       const currentVal = prev[sectionTitle]?.[optionLabel];
       // It must be an object if it has placement
       const newVal = { ...currentVal, placement: newPlacement };
       
       return {
         ...prev,
         [sectionTitle]: {
           ...prev[sectionTitle],
           [optionLabel]: newVal
         }
       };
    });
  };

  // CALCULATE TOTAL PRICE
  const totalPrice = useMemo(() => {
      let total = 0;

      // 1. Base Price & Size Multiplier
      let base = 0;
      if (product) {
          base = product.basePrice || 0;
          // Fallback to parsed string price if basePrice missing
          if (!base && product.price) {
              const p = typeof product.price === 'string' ? parseFloat(product.price.replace(/[^\d.]/g, '')) : product.price;
              base = p || 0;
          }
      }

      let multiplier = 1;
      if (selectedSize) {
          if (typeof selectedSize === 'object' && selectedSize.multiplier) {
              multiplier = parseFloat(selectedSize.multiplier);
          }
      }

      total += (base * multiplier);

      // Define Level Multipliers
      const LEVEL_MULTIPLIERS = {
        "Light": 1.0,
        "Normal": 1.0,
        "Extra": 1.5
      };

      // 2. Modifiers Price
      if (product && product.modifiers) {
          product.modifiers.forEach(section => {
              const selectedInSection = selectedModifiers[section.title];
              if (!selectedInSection) return;

              // Helper to calculate cost for one option
              const calculateOptionCost = (label, valueObjOrString) => {
                  const opt = section.options.find(o => o.label === label);
                  if (!opt) return 0;
                  
                  // Use baseExtra, fallback to price (legacy)
                  const baseExtra = opt.baseExtra !== undefined ? opt.baseExtra : (opt.price || 0);
                  if (baseExtra === 0) return 0;

                  // Determine Level Multiplier
                  let levelMult = 1;
                  if (typeof valueObjOrString === 'object' && valueObjOrString.level) {
                      levelMult = LEVEL_MULTIPLIERS[valueObjOrString.level] || 1;
                  } else if (typeof valueObjOrString === 'string') {
                      // If the value itself is the level (e.g. from a radio with levels, though currently levels are sub-properties)
                      // In current logic, single choice just returns label. 
                      // If single choice had levels, we'd need to parse.
                      // But effectively for single choice (like Cheese), it might not have "Level".
                      // If it did, logic would need adaptation. 
                      // For now, only complex objects have levels.
                      levelMult = 1; 
                  }
                  
                  // Final calc: BaseExtra * LevelMult * SizeMult
                  // User rule: sizeMultiplier applies to BASE PRICE and MODIFIERS
                  return baseExtra * levelMult * multiplier;
              };

              if (section.type === "single") {
                  // Single: selectedInSection is a string (label)
                  // Single options currently don't store level objects, just the label.
                  // If we want levels for single options, we'd need to change storage. 
                  // Assuming single options don't have per-option levels for now based on data structure provided.
                  total += calculateOptionCost(selectedInSection, selectedInSection);
              } else {
                   // Multiple
                   if (Array.isArray(selectedInSection)) {
                       // Simple Array
                       selectedInSection.forEach(label => {
                           total += calculateOptionCost(label, label);
                       });
                   } else if (typeof selectedInSection === 'object') {
                       // Complex: Keys are labels, Values are { level, placement } or string/bool
                       Object.entries(selectedInSection).forEach(([label, val]) => {
                           if (val) { // val could be null/false if removed? (though our logic removes key)
                               total += calculateOptionCost(label, val);
                           }
                       });
                   }
              }
          });
      }

      return total.toFixed(2);
  }, [product, selectedSize, selectedModifiers]);

  return {
    selectedSize,
    setSelectedSize,
    selectedModifiers,
    toggleModifier,
    updateModifierLevel,
    updateModifierPlacement,
    sectionIsComplex,
    totalPrice // Exported
  };
}

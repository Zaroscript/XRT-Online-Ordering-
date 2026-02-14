/**
 * Computes the total price from server data: base/size price + modifiers (with size and quantity_levels).
 */
export const computeTotalPrice = (
  product,
  selectedSize,
  selectedModifiers = {},
  quantity = 1,
) => {
  if (!product) return "0.00";

  const sizeMultiplier =
    selectedSize && typeof selectedSize === "object" && selectedSize.multiplier
      ? parseFloat(selectedSize.multiplier)
      : 1;
  const sizeCode = selectedSize?.code ?? selectedSize?.label ?? null;

  let pricePerUnit = 0;
  if (selectedSize && typeof selectedSize === "object" && selectedSize.price != null) {
    pricePerUnit = Number(selectedSize.price);
  } else {
    pricePerUnit = (product.basePrice || 0) * sizeMultiplier;
  }

  const getModifierPriceForSize = (optionDef) => {
    if (optionDef.prices_by_size?.length && sizeCode) {
      const match = optionDef.prices_by_size.find(
        (pbs) =>
          pbs.sizeCode === sizeCode ||
          pbs.sizeCode === selectedSize?.label ||
          (pbs.size_id && pbs.size_id === selectedSize?.size_id),
      );
      if (match != null) return match.priceDelta;
    }
    // When item is not sizeable (no selectedSize), use modifier base price directly
    const base = optionDef.baseExtra ?? optionDef.price ?? 0;
    if (!selectedSize) return base;
    return base * sizeMultiplier;
  };

  const getLevelPrice = (optionDef, levelName) => {
    const levels = optionDef.quantity_levels;
    if (!levels?.length) return null;
    const level = levels.find((l) => (l.name ?? String(l.quantity)) === levelName);
    if (!level) return null;
    if (level.prices_by_size?.length && selectedSize) {
      const code = selectedSize?.code ?? selectedSize?.label ?? sizeCode;
      const sizeId = selectedSize?.size_id;
      const match = level.prices_by_size.find(
        (p) =>
          (p.sizeCode && (p.sizeCode === code || p.sizeCode === selectedSize?.label)) ||
          (p.size_id && sizeId && p.size_id === sizeId)
      );
      if (match != null) return match.priceDelta;
    }
    // When item is not sizeable (no selectedSize), use level's base price directly
    if (level.price != null) return level.price;
    return null;
  };

  const isDefaultLevel = (optionDef, levelName) => {
    const levels = optionDef?.quantity_levels;
    if (!levels?.length || !levelName) return false;
    const level = levels.find((l) => (l.name ?? String(l.quantity)) === levelName);
    return level?.is_default === true;
  };

  Object.keys(selectedModifiers).forEach((sectionTitle) => {
    const selection = selectedModifiers[sectionTitle];
    const sectionDef = product.modifiers?.find((s) => s.title === sectionTitle);
    if (!sectionDef) return;

    const processOption = (optLabel, optValue) => {
      const optionDef = sectionDef.options?.find((o) => o.label === optLabel);
      if (!optionDef) return;

      const levelName = optValue?.level ?? (typeof optValue === "string" ? optValue : null);
      const atDefaultLevel =
        !optionDef.quantity_levels?.length ||
        !levelName ||
        isDefaultLevel(optionDef, levelName);
      const atDefaultOption = !!optionDef.is_default;

      if (atDefaultOption && atDefaultLevel) {
        return;
      }

      let modifierPrice = getModifierPriceForSize(optionDef);
      if (levelName && optionDef.quantity_levels?.length) {
        const levelPrice = getLevelPrice(optionDef, levelName);
        if (levelPrice != null) modifierPrice = levelPrice;
      }

      pricePerUnit += modifierPrice;
    };

    if (Array.isArray(selection)) {
      selection.forEach((label) => processOption(label, null));
    } else if (typeof selection === "object" && selection !== null) {
      if (sectionDef.type === "single" && typeof selection === "string") {
        processOption(selection, null);
      } else {
        Object.keys(selection).forEach((optLabel) => {
          processOption(optLabel, selection[optLabel]);
        });
      }
    } else if (typeof selection === "string") {
      processOption(selection, null);
    }
  });

  const total = pricePerUnit * quantity;
  return total.toFixed(2);
};

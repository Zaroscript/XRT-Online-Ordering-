/**
 * Computes the total price from server data: base/size price + modifiers (with size and quantity_levels).
 */

/** Per-unit base (selected size price or basePrice × multiplier). */
export function computeBaseUnitPrice(product, selectedSize) {
  if (!product) return 0;

  const sizeMultiplier =
    selectedSize && typeof selectedSize === "object" && selectedSize.multiplier
      ? parseFloat(selectedSize.multiplier)
      : 1;

  if (
    selectedSize &&
    typeof selectedSize === "object" &&
    selectedSize.price != null
  ) {
    return Number(selectedSize.price);
  }
  return (product.basePrice || 0) * sizeMultiplier;
}

function createPricingHelpers(product, selectedSize) {
  const sizeMultiplier =
    selectedSize && typeof selectedSize === "object" && selectedSize.multiplier
      ? parseFloat(selectedSize.multiplier)
      : 1;
  const sizeCode = selectedSize?.code ?? selectedSize?.label ?? null;

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
    const base = optionDef.baseExtra ?? optionDef.price ?? 0;
    if (!selectedSize) return base;
    return base * sizeMultiplier;
  };

  const getLevelPrice = (optionDef, levelName) => {
    const levels = optionDef.quantity_levels;
    if (!levels?.length) return null;
    const level = levels.find(
      (l) => (l.name ?? String(l.quantity)) === levelName,
    );
    if (!level) return null;
    if (level.prices_by_size?.length && selectedSize) {
      const code = selectedSize?.code ?? selectedSize?.label ?? sizeCode;
      const sizeId = selectedSize?.size_id;
      const match = level.prices_by_size.find(
        (p) =>
          (p.sizeCode &&
            (p.sizeCode === code || p.sizeCode === selectedSize?.label)) ||
          (p.size_id && sizeId && p.size_id === sizeId),
      );
      if (match != null) return match.priceDelta;
    }
    if (level.price != null) return level.price;
    return null;
  };

  const isDefaultLevel = (optionDef, levelName) => {
    const levels = optionDef?.quantity_levels;
    if (!levels?.length || !levelName) return false;
    const level = levels.find(
      (l) => (l.name ?? String(l.quantity)) === levelName,
    );
    return level?.is_default === true;
  };

  return { getModifierPriceForSize, getLevelPrice, isDefaultLevel };
}

/**
 * Builds order modifier rows + total premium using the same rules as {@link computeTotalPrice}
 * (sizes, prices_by_size, quantity levels). Ensures promotions and server line math match the storefront.
 *
 * @returns {{ modifiers: Array<{ modifier_id?: string, name_snapshot: string, unit_price_delta: number, quantity_label_snapshot?: string, selected_side?: string }>, totalPremium: number }}
 */
export function buildOrderModifiersFromSelection(
  product,
  selectedSize,
  selectedModifiers = {},
) {
  const modifiers = [];
  let totalPremium = 0;

  if (!product?.modifiers?.length || !selectedModifiers) {
    return { modifiers, totalPremium };
  }

  const { getModifierPriceForSize, getLevelPrice, isDefaultLevel } =
    createPricingHelpers(product, selectedSize);

  Object.keys(selectedModifiers).forEach((sectionTitle) => {
    const selection = selectedModifiers[sectionTitle];
    const sectionDef = product.modifiers.find((s) => s.title === sectionTitle);
    if (!sectionDef) return;

    const processOption = (optLabel, optValue) => {
      const optionDef = sectionDef.options?.find((o) => o.label === optLabel);
      if (!optionDef) return;

      const levelName =
        optValue?.level ?? (typeof optValue === "string" ? optValue : null);
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

      totalPremium += modifierPrice;

      const placement =
        typeof optValue === "object" && optValue != null
          ? optValue.placement ?? optValue.side
          : undefined;

      modifiers.push({
        modifier_id:
          optionDef.id != null ? String(optionDef.id) : undefined,
        name_snapshot: optionDef.label ?? optLabel,
        unit_price_delta: modifierPrice,
        quantity_label_snapshot: levelName || undefined,
        selected_side: placement,
      });
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

  return { modifiers, totalPremium };
}

export const computeTotalPrice = (
  product,
  selectedSize,
  selectedModifiers = {},
  quantity = 1,
) => {
  if (!product) return "0.00";

  const base = computeBaseUnitPrice(product, selectedSize);
  const { totalPremium } = buildOrderModifiersFromSelection(
    product,
    selectedSize,
    selectedModifiers,
  );

  const total = (base + totalPremium) * quantity;
  return total.toFixed(2);
};

/**
 * Formats a numeric price based on site settings (currency code, fractions).
 */
export const formatPrice = (amount, settings) => {
  const currency = settings?.currency || "GBP";
  const fractions = settings?.currencyOptions?.fractions ?? 2;

  try {
    return new Intl.NumberFormat("en-GB", {
      style: "currency",
      currency: currency,
      minimumFractionDigits: fractions,
      maximumFractionDigits: fractions,
    }).format(Number(amount) || 0);
  } catch (e) {
    console.error("Error formatting price:", e);
    const symbol =
      currency === "GBP" ? "£" : currency === "USD" ? "$" : currency;
    return `${symbol}${(Number(amount) || 0).toFixed(fractions)}`;
  }
};

/**
 * Parses a price string to a number (e.g., "£15.00" -> 15).
 */
export const getPriceValue = (priceStr) => {
  if (typeof priceStr === "number") return priceStr;
  if (!priceStr) return 0;
  return parseFloat(String(priceStr).replace(/[^0-9.]/g, "")) || 0;
};

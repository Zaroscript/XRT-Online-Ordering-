/**
 * Builds default modifier selections from product modifier sections.
 * Uses is_default on options (from item-level modifier_overrides).
 */
export function getDefaultLevel(option) {
  const levels = option?.quantity_levels;
  if (!levels?.length) return "Normal";
  const def = levels.find((l) => l.is_default) || levels[0];
  return def?.name ?? String(def?.quantity ?? "Normal");
}

/** Default placement for sides - use first allowed side, or "Whole" if allowed/empty. */
export function getDefaultPlacement(option) {
  const allowed = option?.allowed_sides || [];
  if (allowed.length === 0) return "Whole";
  const order = ["WHOLE", "LEFT", "RIGHT"];
  const match = order.find((s) =>
    allowed.some((a) => a.toUpperCase() === s)
  );
  return match ? (match === "WHOLE" ? "Whole" : match === "LEFT" ? "Left" : "Right") : "Whole";
}

/**
 * Builds the selectedModifiers state object for default selections.
 * Auto-selects options marked is_default (from admin item default modifiers).
 */
export function buildDefaultModifiers(product) {
  const defaults = {};
  const isComplex = (s) => s.options?.some((o) => o.hasLevel || o.hasPlacement);

  (product?.modifiers || []).forEach((section) => {
    const defOpts = section.options?.filter((o) => o.is_default) ?? [];
    if (defOpts.length === 0) {
      defaults[section.title] = section.type === "multiple" ? [] : undefined;
      return;
    }
    const opts = defOpts;

    if (section.type === "single") {
      const opt = opts[0];
      if (isComplex(section)) {
        defaults[section.title] = {
          [opt.label]: {
            level: getDefaultLevel(opt),
            placement: getDefaultPlacement(opt),
          },
        };
      } else {
        defaults[section.title] = opt.label;
      }
    } else {
      if (isComplex(section)) {
        defaults[section.title] = opts.reduce((acc, o) => {
          acc[o.label] = {
            level: getDefaultLevel(o),
            placement: getDefaultPlacement(o),
          };
          return acc;
        }, {});
      } else {
        defaults[section.title] = opts.map((o) => o.label);
      }
    }
  });

  return defaults;
}

/**
 * Gets the default size from product sizes (is_default or first).
 */
export function getDefaultSize(product) {
  if (!product?.sizes?.length) return null;
  return (
    product.sizes.find((s) => s.is_default) ||
    product.sizes[0]
  );
}

import { apiClient } from "./client";
import { API_ENDPOINTS } from "./endpoints";
import { resolveImageUrl } from "@/utils/resolveImageUrl";

/** Build sizes for list + customizer: label, code (for sizeCode match), price, is_default. */
function mapSizes(item) {
  return (item.sizes || []).map((s) => ({
    size_id: s.size_id,
    label: s.name ?? s.label ?? "Size",
    name: s.name,
    code: s.code ?? s.label,
    price: s.price,
    is_default: !!s.is_default,
    is_active: s.is_active !== false,
    multiplier: item.base_price > 0 && s.price != null ? s.price / item.base_price : 1,
  }));
}

function adaptProducts(data) {
  if (!data?.success || !Array.isArray(data.data)) return [];
  return (data.data || []).map((item) => {
    const sizes = mapSizes(item);
    const modifierGroups = (item.modifier_groups || [])
      .slice()
      .sort((a, b) => {
        const grpA = a?.modifier_group;
        const grpB = b?.modifier_group;
        const sortA = grpA?.sort_order != null ? Number(grpA.sort_order) : Number(a?.display_order ?? 0);
        const sortB = grpB?.sort_order != null ? Number(grpB.sort_order) : Number(b?.display_order ?? 0);
        return sortA - sortB;
      });
    // First non-empty wins (inheritance: override → modifier → group)
    const firstNonEmpty = (...arrs) => {
      for (const a of arrs) {
        if (Array.isArray(a) && a.length > 0) return a;
      }
      return [];
    };

    const modifiers = modifierGroups.map((groupObj) => {
      const group = groupObj.modifier_group || {};
      const groupModifiers = (groupObj.modifiers || [])
        .slice()
        .sort((a, b) => Number(a?.display_order ?? 0) - Number(b?.display_order ?? 0));
      // Use backend display_type: RADIO → single, CHECKBOX → multiple
      const displayType = (group.display_type || "").toUpperCase();
      const isSingle =
        displayType === "RADIO" ||
        (group.min_select === 1 && group.max_select === 1);
      const options = groupModifiers.map((mod) => {
        const override = (groupObj.modifier_overrides || []).find(
          (o) => (o.modifier_id || o.modifier_id?._id) === (mod.id || mod._id)
        );
        const pricesBySize = firstNonEmpty(
          override?.prices_by_size,
          mod.prices_by_size,
          group.prices_by_size
        );
        const qtyLevels = firstNonEmpty(
          override?.quantity_levels,
          mod.quantity_levels,
          group.quantity_levels
        ).slice().sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0));
        const priceInfo = pricesBySize.length > 0 ? pricesBySize[0] : { priceDelta: 0 };
        const defaultLevel = qtyLevels.find((l) => l.is_default) || qtyLevels[0];
        const baseFromLevel = defaultLevel?.price ?? defaultLevel?.prices_by_size?.[0]?.priceDelta;
        // When modifier has no quantity_levels, use base price (mod.price or group.price); otherwise use size/level pricing
        const hasQtyLevels = qtyLevels.length > 0;
        const baseExtra = hasQtyLevels
          ? (priceInfo.priceDelta ?? baseFromLevel ?? 0)
          : (mod.price ?? group.price ?? priceInfo.priceDelta ?? 0);
        const allowedSides = mod.sides_config?.enabled
          ? (mod.sides_config?.allowed_sides || []).filter(Boolean)
          : [];
        return {
          id: mod.id || mod._id,
          label: mod.name,
          baseExtra,
          price: mod.price ?? group.price,
          prices_by_size: pricesBySize,
          quantity_levels: qtyLevels,
          hasLevel: hasQtyLevels,
          hasPlacement: !!(mod.sides_config?.enabled),
          allowed_sides: allowedSides,
          is_default: !!(override?.is_default ?? mod.is_default),
        };
      });
      return {
        title: group.name || group.display_name || "Options",
        type: isSingle ? "single" : "multiple",
        display_type: displayType || (isSingle ? "RADIO" : "CHECKBOX"),
        min_select: group.min_select ?? 0,
        max_select: group.max_select ?? 1,
        options,
      };
    });

    const imageRaw = item.image;
    const imageStr =
      typeof imageRaw === "string"
        ? imageRaw?.trim()
        : imageRaw && typeof imageRaw === "object"
          ? (imageRaw.original || imageRaw.thumbnail || "").trim()
          : "";
    const imageUrl = imageStr
      ? resolveImageUrl(imageStr) || imageStr
      : "https://placehold.co/600x600?text=No+Image";

    return {
      id: item.id || item._id,
      src: imageUrl,
      name: item.name,
      category: item.category ? item.category.name : "Uncategorized",
      basePrice: item.base_price,
      is_sizeable: item.is_sizeable !== false,
      sizes: sizes.length > 0 ? sizes : undefined,
      modifiers,
      modifier_groups: modifierGroups,
      is_signature: item.is_signature,
      description: item.description || "No description available.",
      sort_order: item.sort_order ?? 999,
    };
  });
}

export function getProducts() {
  return apiClient.get(API_ENDPOINTS.PRODUCTS).then((res) => {
    const adapted = adaptProducts(res.data);
    adapted.sort((a, b) => (a.sort_order ?? 999) - (b.sort_order ?? 999));
    return adapted;
  });
}

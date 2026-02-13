import { apiClient } from "./client";
import { API_ENDPOINTS } from "./endpoints";
import { resolveImageUrl } from "@/utils/resolveImageUrl";

function adaptProducts(data) {
  if (!data?.success || !Array.isArray(data.data)) return [];
  return (data.data || []).map((item) => {
    const modifiers = (item.modifier_groups || []).map((groupObj) => {
      const group = groupObj.modifier_group || {};
      const groupModifiers = groupObj.modifiers || [];
      const isSingle = group.min_select === 1 && group.max_select === 1;
      const defaultValue = isSingle ? null : [];
      const options = groupModifiers.map((mod) => {
        const priceInfo =
          mod.prices_by_size?.length > 0 ? mod.prices_by_size[0] : { priceDelta: 0 };
        return {
          label: mod.name,
          baseExtra: priceInfo.priceDelta || 0,
          hasLevel: false,
          hasPlacement: false,
        };
      });
      return {
        title: group.name || group.display_name,
        type: isSingle ? "single" : "multiple",
        default: defaultValue,
        options,
      };
    });

    const sizes = (item.sizes || []).map((s) => ({
      label: s.name,
      multiplier: item.base_price > 0 ? s.price / item.base_price : 1,
    }));

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
      sizes: sizes.length > 0 ? sizes : undefined,
      modifiers,
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

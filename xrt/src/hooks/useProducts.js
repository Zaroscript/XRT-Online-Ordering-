import { useState, useEffect } from "react";
import { apiClient } from "../api/client";
import { API_ENDPOINTS } from "../api/endpoints";
import { resolveImageUrl } from "../utils/resolveImageUrl";

export default function useProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const { data } = await apiClient.get(API_ENDPOINTS.PRODUCTS);

        if (data.success) {
          // Adapt backend data to frontend structure
          const adaptedProducts = (data.data || []).map((item) => {
            // Map Modifiers
            const modifiers = (item.modifier_groups || []).map((groupObj) => {
              const group = groupObj.modifier_group || {};
              const groupModifiers = groupObj.modifiers || [];

              // Determine type
              const isSingle = group.min_select === 1 && group.max_select === 1;

              // Find default
              // logic: check overrides first, then modifiers?
              // For now, simple logic: first defaulted modifier
              let defaultValue = isSingle ? null : [];

              // Map options
              const options = groupModifiers.map((mod) => {
                // Find price delta for "M" or first available
                // Ideally we match the product's default size, but we don't know it easily here without more logic
                // Simple assumption: take the first priceDelta or 0
                const priceInfo =
                  mod.prices_by_size && mod.prices_by_size.length > 0
                    ? mod.prices_by_size[0]
                    : { priceDelta: 0 };

                return {
                  label: mod.name,
                  baseExtra: priceInfo.priceDelta || 0,
                  // Preserve other props if needed
                  hasLevel: false, // Default for now
                  hasPlacement: false, // Default for now
                };
              });

              return {
                title: group.name || group.display_name,
                type: isSingle ? "single" : "multiple",
                default: defaultValue, // To be refined if needed
                options,
              };
            });

            // Map Sizes
            // Frontend: [{ label: "Small", multiplier: 1 }, ...]
            // Backend: item.sizes [{ name: "Small", price: 10 }, ...]
            // Multiplier = size_price / base_price
            const sizes = (item.sizes || []).map((s) => ({
              label: s.name,
              multiplier: item.base_price > 0 ? s.price / item.base_price : 1,
            }));

            // Normalize image: API may return string (e.g. "/uploads/...") or object { original, thumbnail }
            const imageRaw = item.image;
            const imageStr =
              typeof imageRaw === "string"
                ? imageRaw.trim()
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
              modifiers: modifiers,
              is_signature: item.is_signature,
              description: item.description || "No description available.",
              sort_order: item.sort_order ?? 999,
            };
          });

          // Sort by sort_order (ascending) so the website list matches admin order
          adaptedProducts.sort((a, b) => (a.sort_order ?? 999) - (b.sort_order ?? 999));
          setProducts(adaptedProducts);
        } else {
          setProducts([]);
        }
      } catch (err) {
        console.error("Failed to fetch products:", err);
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  return { products, loading, error };
}

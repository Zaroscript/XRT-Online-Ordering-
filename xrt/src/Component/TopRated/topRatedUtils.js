/**
 * Minimum customer-facing price from base + size rows (matches storefront logic).
 */
export function getMinProductPrice(product) {
  const base = Number(product?.basePrice) || 0;
  if (!product?.sizes?.length) return base;
  const prices = product.sizes.map((s) => {
    if (s.price != null && !Number.isNaN(Number(s.price))) return Number(s.price);
    const mult = Number(s.multiplier) || 1;
    return base * mult;
  });
  return Math.min(...prices);
}

/** Shape expected by TopRated `Items` (server-driven). */
export function mapProductToTopRatedItem(product) {
  const min = getMinProductPrice(product);
  const base = Number(product.basePrice) || 0;
  const label =
    product.sizes?.length > 1 || (product.sizes?.length === 1 && Math.abs(min - base) > 0.001)
      ? `From $${min.toFixed(2)}`
      : `$${min.toFixed(2)}`;

  return {
    id: product.id,
    src: product.src,
    name: product.name,
    offer: label,
    displayAmount: min,
    strikePrice: null,
  };
}

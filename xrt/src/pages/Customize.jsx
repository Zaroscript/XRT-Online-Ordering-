import React, { useMemo } from "react";
import { useProductsQuery } from "@/api";
import ViewItems from "../Component/Menu_Items/ViewItems";
import { COLORS } from "../config/colors";

/**
 * Dedicated entry for customizing signature menu items. Lists only items
 * flagged `is_signature` in admin — data comes from GET /public/products only.
 */
export default function Customize() {
  const { products = [], loading } = useProductsQuery();

  const signatureItems = useMemo(
    () =>
      (products || [])
        .filter((p) => p.is_signature)
        .sort((a, b) => (a.sort_order ?? 999) - (b.sort_order ?? 999)),
    [products],
  );

  const styleVars = {
    "--primary": COLORS.primary,
    "--text-primary": COLORS.textPrimary,
    "--text-secondary": COLORS.textSecondary,
    "--text-gray": COLORS.textGray,
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center bg-gray-50">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-green-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 md:px-8" style={styleVars}>
      <div className="mx-auto max-w-7xl">
        <header className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 md:text-3xl">
            Customize your order
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-gray-600 md:text-base">
            Pick a signature item to choose sizes and modifiers, then add it to your cart.
          </p>
        </header>

        {signatureItems.length === 0 ? (
          <p className="rounded-xl border border-dashed border-gray-200 bg-white px-6 py-12 text-center text-gray-500">
            No signature items are available yet. Check back soon or browse the full menu.
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
            {signatureItems.map((product) => (
              <div
                key={product.id}
                className="mx-auto w-full max-w-[200px] [&>div>div:first-child>img]:!h-[180px] [&>div>div:last-child]:!flex-row [&>div>div:last-child]:!gap-2 [&>div>div:last-child>div]:!flex-1 [&>div>div:last-child>div]:!h-auto [&>div>div:last-child>div]:!py-2 [&>div>div:last-child>div_h5]:!text-[10px] [&>div>div:last-child>div_svg]:!w-3.5"
              >
                <ViewItems product={product} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

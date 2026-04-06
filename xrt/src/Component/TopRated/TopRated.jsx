import React, { useMemo } from "react";
import { coupons } from "./../../config/constants";
import Items from "./Items";
import { ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { COLORS } from "../../config/colors";
import { useProductsQuery } from "@/api";
import { mapProductToTopRatedItem } from "./topRatedUtils";

const MAX_SIGNATURE_ITEMS = 9;

/**
 * Homepage "Top Rated" strip: filled from items marked `is_signature` in admin (server).
 * Pass `products` + `productsLoading` from Home to reuse the same fetch; omit both to fetch here.
 */
export default function TopRated({ products: productsProp, productsLoading: parentLoading }) {
  const navigate = useNavigate();
  const fromParent = productsProp !== undefined;
  const { products: productsFromQuery, loading: queryLoading } = useProductsQuery({
    enabled: !fromParent,
  });

  const loading = fromParent ? !!parentLoading : queryLoading;
  const products = fromParent ? productsProp : productsFromQuery ?? [];

  const signatureItems = useMemo(() => {
    return products
      .filter((p) => p.is_signature)
      .slice(0, MAX_SIGNATURE_ITEMS)
      .map(mapProductToTopRatedItem);
  }, [products]);

  const styleVars = {
    '--text-primary': COLORS.textPrimary,
    '--offer-yellow': COLORS.offerYellow,
  };

  if (!loading && signatureItems.length === 0) {
    return null;
  }

  return (
    <>
      <div className="flex flex-col lg:flex-row py-[30px] px-4 md:px-[70px]" style={styleVars}>
        <div
          className="flex justify-start items-center h-[457px] w-full lg:w-[300px] flex-col group/card relative rounded-[10px] mb-8 lg:mb-0 bg-cover bg-center shrink-0"
          style={{ backgroundImage: `url(${coupons.src})` }}
        >
          <div className="bg-black opacity-0 group-hover/card:opacity-40 absolute inset-0 duration-400 rounded-[10px]"></div>
          <button className="flex items-center gap-2 text-white font-bold hover:brightness-110 transition-all z-10 mt-auto mb-4">
            SEE ALL <ArrowRight size={20} />
          </button>
          <div className="text-[20px] font-semibold text-white mb-[30px] z-10 text-center">
            Enjoy Up to <span className="text-(--offer-yellow)"> {coupons.offer}</span>{" "}
            <button
              onClick={() => navigate('/checkout')}
              className="w-full h-11 bg-(--primary) text-white font-bold rounded-xl hover:brightness-110 transition-all shadow-lg shadow-(--primary)/20 flex items-center justify-center gap-2"
            >
              Order Now
            </button>
          </div>
        </div>

        <div className="ml-0 lg:ml-[30px] w-full lg:w-[75%]">
          <h2 className="text-3xl font-bold text-(--text-primary) mb-3">Top rated</h2>
          <p className="text-sm text-gray-600 mb-1">Signature &amp; highlighted items from our menu</p>
          <div className="relative  h-[2px] bg-gray-200">
            <div className="absolute left-0 top-0 h-full w-16 bg-(--primary)" />
          </div>
          {loading && signatureItems.length === 0 ? (
            <div className="grid grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4 mt-8 animate-pulse">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="flex gap-3">
                  <div className="w-16 h-16 shrink-0 overflow-hidden rounded-xl border border-gray-100 shadow-sm relative group/img" />
                  <div className="flex-1 space-y-2 pt-2">
                    <span className="text-(--text-secondary) font-semibold text-xs tracking-tight">Offer</span>
                    <div className="h-4 bg-gray-200 rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4 mt-8">
              {signatureItems.map((item) => (
                <Items key={item.id || item.name} item={item} />
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

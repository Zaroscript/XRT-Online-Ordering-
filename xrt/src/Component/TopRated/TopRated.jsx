import React, { useMemo } from "react";
import { coupons } from "./../../config/constants";
import Items from "./Items";
import { COLORS } from "../../config/colors";
import { useProductsQuery } from "@/api";
import { mapProductToTopRatedItem } from "./topRatedUtils";

const MAX_SIGNATURE_ITEMS = 9;

/**
 * Homepage "Top Rated" strip: filled from items marked `is_signature` in admin (server).
 * Pass `products` + `productsLoading` from Home to reuse the same fetch; omit both to fetch here.
 */
export default function TopRated({ products: productsProp, productsLoading: parentLoading }) {
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
          className="flex justify-start items-center h-[457px] w-full lg:w-[300px] flex-col group/card relative rounded-[10px] mb-8 lg:mb-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${coupons.src})` }}
        >
          <div className="bg-black opacity-0 group-hover/card:opacity-40 absolute inset-0 duration-400 rounded-[10px]"></div>
          <span className="text-[30px] font-[700]  text-white mt-[140px]">
            {coupons.ProductName}
          </span>
          <span className="text-[20px] font-[600]  text-white mt-[30px]">
            Enjoy Up to <span className="text-[var(--offer-yellow)]"> {coupons.offer}</span>{" "}
            OFF
          </span>
          <p className="inline-block mt-[30px] text-white text-[14px] font-[600] group/btn relative cursor-pointer">
            Order Now
            <i className="fa-solid fa-arrow-right ml-1 group-hover/btn:translate-x-3  duration-300"></i>
            <span className="block w-0 border-b-2 border-white  transition-all duration-300 group-hover/btn:w-[110%] absolute left-0"></span>
          </p>
        </div>

        <div className="ml-0 lg:ml-[30px] w-full lg:w-[75%]">
          <h2 className="text-3xl font-[700] text-[var(--text-primary)] mb-3">Top rated</h2>
          <p className="text-sm text-gray-600 mb-1">Signature &amp; highlighted items from our menu</p>
          <div className="relative  h-[2px] bg-gray-200">
            <div className="absolute left-0 top-0 h-full w-16 bg-green-600" />
          </div>
          {loading && signatureItems.length === 0 ? (
            <div className="grid grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4 mt-8 animate-pulse">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="flex gap-3">
                  <div className="w-[100px] h-[100px] rounded-[10px] bg-gray-200" />
                  <div className="flex-1 space-y-2 pt-2">
                    <div className="h-4 bg-gray-200 rounded w-3/4" />
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

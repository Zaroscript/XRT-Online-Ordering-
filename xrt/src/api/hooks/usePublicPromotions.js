import { useQuery } from "@tanstack/react-query";
import { getPublicPromotions } from "../promotions";

export function usePublicPromotionsQuery() {
  return useQuery({
    queryKey: ["public-promotions"],
    queryFn: getPublicPromotions,
    staleTime: 0,
    refetchInterval: 10_000,
    refetchIntervalInBackground: true,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  });
}

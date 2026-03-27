import { useMutation } from "@tanstack/react-query";
import { verifyCoupon } from "../coupons";

export const useVerifyCouponMutation = () => {
  return useMutation({
    mutationFn: (code) => verifyCoupon(code),
  });
};

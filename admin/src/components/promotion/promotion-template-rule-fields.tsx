import Input from '@/components/ui/input';
import Label from '@/components/ui/label';
import SwitchInput from '@/components/ui/switch-input';
import type { PromotionTemplateId } from '@/types';
import type { Control, UseFormRegister } from 'react-hook-form';
import type { PromotionFormValues } from './promotion-form-values';
import { Controller } from 'react-hook-form';
import MenuItemSelect from './menu-item-select';
import { useCouponsQuery } from '@/data/coupon';
import Select from '@/components/ui/select/select';

export type PromotionTemplateRuleFieldsProps = {
  template: PromotionTemplateId;
  register: UseFormRegister<PromotionFormValues>;
  control: Control<PromotionFormValues>;
};

export default function PromotionTemplateRuleFields({
  template,
  register,
  control,
}: PromotionTemplateRuleFieldsProps) {
  const { coupons, loading: couponLoading } = useCouponsQuery({ limit: 1000 });

  return (
    <>
      {(template === 'percent_cart' ||
        template === 'percent_selected_items' ||
        template === 'percent_combo') && (
        <>
          <Input
            label="Discount %"
            type="number"
            {...register('percentage', { valueAsNumber: true })}
            variant="outline"
            className="mb-5"
          />
          {(template === 'percent_selected_items' || template === 'percent_combo') && (
            <Controller
              name="menu_item_ids_csv"
              control={control}
              render={({ field, fieldState: { error } }) => (
                <MenuItemSelect
                  label="Eligible Items"
                  value={field.value}
                  onChange={field.onChange}
                  error={error?.message}
                />
              )}
            />
          )}
        </>
      )}

      {template === 'fixed_cart' && (
        <Input
          label="Discount amount (same currency as store)"
          type="number"
          step="0.01"
          {...register('amount', { valueAsNumber: true })}
          variant="outline"
          className="mb-5"
        />
      )}

      {template === 'free_delivery' && (
        <div className="flex items-center gap-3 mb-5">
          <SwitchInput name="restrict_delivery_only" control={control as any} />
          <Label className="mb-0">Only when order type is delivery</Label>
        </div>
      )}

      {template === 'free_item' && (
        <>
          <Controller
            name="menu_item_ids_csv"
            control={control}
            render={({ field, fieldState: { error } }) => (
              <MenuItemSelect
                label="Free Items (Select which items are offered for free)"
                value={field.value}
                onChange={field.onChange}
                error={error?.message}
              />
            )}
          />
          <Input
            label="How many free units"
            type="number"
            {...register('free_quantity', { valueAsNumber: true })}
            variant="outline"
            className="mb-5"
          />
        </>
      )}

      {template === 'bogo' && (
        <>
          {/* ── MODE 1: Same-item BOGO ─────────────────────────── */}
          <div className="mb-1">
            <p className="text-sm font-semibold text-heading">Same-item BOGO</p>
            <p className="text-xs text-muted mb-3">
              Buy an item, get the <strong>same item</strong> free or discounted (e.g., Buy a Pizza, get a Pizza).
            </p>
          </div>
          <Controller
            name="menu_item_ids_csv"
            control={control}
            render={({ field, fieldState: { error } }) => (
              <MenuItemSelect
                label="Eligible items"
                value={field.value}
                onChange={field.onChange}
                error={error?.message}
                className="mb-5"
              />
            )}
          />

          {/* ── MODE 2: Cross-group BOGO ───────────────────────── */}
          <div className="border-t border-dashed border-gray-200 pt-4 mb-1">
            <p className="text-sm font-semibold text-heading">Different-item BOGO</p>
            <p className="text-xs text-muted mb-3">
              Buy from <strong>Group A</strong>, get an item from <strong>Group B</strong> (e.g., Buy a Burger, get a Drink). Leave empty if using the "Same-item BOGO" above.
            </p>
          </div>
          <Controller
            name="group_a_csv"
            control={control}
            render={({ field, fieldState: { error } }) => (
              <MenuItemSelect
                label="Group A (Customer buys these)"
                value={field.value}
                onChange={field.onChange}
                error={error?.message}
                className="mb-4"
              />
            )}
          />
          <Controller
            name="group_b_csv"
            control={control}
            render={({ field, fieldState: { error } }) => (
              <MenuItemSelect
                label="Group B (Customer gets these)"
                value={field.value}
                onChange={field.onChange}
                error={error?.message}
                className="mb-4"
              />
            )}
          />

          {/* ── Discount % ────────────────────────────────────────── */}
          <Input
            label="Discount on the second item (%)"
            note="Enter 100 for a completely free item, or 50 for half-price."
            type="number"
            min={1}
            max={100}
            {...register('discount_cheapest_percent', { valueAsNumber: true })}
            variant="outline"
            className="mb-5"
          />
        </>
      )}

      {template === 'buy_n_get_one_free' && (
        <>
          {/* ── How many to buy ───────────────────────────────── */}
          <Input
            label="How many items must they buy?"
            note="If you set 2, they buy 2 items and get 1 free."
            type="number"
            min={1}
            {...register('n', { valueAsNumber: true })}
            variant="outline"
            className="mb-5"
          />

          {/* ── Items that trigger the deal ───────────────────── */}
          <div className="mb-1">
            <p className="text-sm font-semibold text-heading">What do they need to buy?</p>
            <p className="text-xs text-muted mb-3">
              Select the items the customer must purchase to get the deal.
            </p>
          </div>
          <Controller
            name="menu_item_ids_csv"
            control={control}
            render={({ field, fieldState: { error } }) => (
              <MenuItemSelect
                label="Required items"
                value={field.value}
                onChange={field.onChange}
                error={error?.message}
                className="mb-5"
              />
            )}
          />

          {/* ── The free reward item ──────────────────────────── */}
          <div className="border-t border-dashed border-gray-200 pt-4 mb-1">
            <p className="text-sm font-semibold text-heading">What do they get for free?</p>
            <p className="text-xs text-muted mb-3">
              Select the item they receive as a reward. It can be the same item or a different one.
            </p>
          </div>
          <Controller
            name="group_b_csv"
            control={control}
            render={({ field, fieldState: { error } }) => (
              <MenuItemSelect
                label="Free reward item"
                value={field.value}
                onChange={field.onChange}
                error={error?.message}
                className="mb-5"
              />
            )}
          />
        </>
      )}

      {template === 'meal_bundle' && (
        <>
          <Input
            label="Bundle price"
            type="number"
            step="0.01"
            {...register('bundle_price', { valueAsNumber: true })}
            variant="outline"
            className="mb-5"
          />
          <Controller
            name="menu_item_ids_csv"
            control={control}
            render={({ field, fieldState: { error } }) => (
              <MenuItemSelect
                label="Bundle components (items/categories)"
                value={field.value}
                onChange={field.onChange}
                error={error?.message}
              />
            )}
          />
        </>
      )}

      {template === 'linked_coupon' && (
        <div className="mb-5 space-y-2">
          <Label className="mb-2">Existing coupon code</Label>
          <Controller
            name="coupon_code"
            control={control}
            render={({ field }) => (
              <Select
                {...field}
                isLoading={couponLoading}
                options={coupons}
                getOptionLabel={(option: any) => option.code}
                getOptionValue={(option: any) => option.code}
                value={coupons?.find((c) => c.code === field.value) || null}
                onChange={(option: any) => field.onChange(option ? option.code : '')}
                placeholder="Select an existing coupon..."
                isClearable
              />
            )}
          />
          <p className="text-xs text-muted">Must match a code under Promotions → Coupon codes. Customers apply this via the storefront promotion card only — the code is not exposed in public APIs.</p>
        </div>
      )}
    </>
  );
}

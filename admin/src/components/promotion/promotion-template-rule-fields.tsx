import Input from '@/components/ui/input';
import Label from '@/components/ui/label';
import SwitchInput from '@/components/ui/switch-input';
import type { PromotionTemplateId } from '@/types';
import type { Control, UseFormRegister } from 'react-hook-form';
import type { PromotionFormValues } from './promotion-form-values';
import { Controller } from 'react-hook-form';
import MenuItemSelect from './menu-item-select';

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
          <Controller
            name="menu_item_ids_csv"
            control={control}
            render={({ field, fieldState: { error } }) => (
              <MenuItemSelect
                label="Same-item BOGO (Select eligible items)"
                value={field.value}
                onChange={field.onChange}
                error={error?.message}
              />
            )}
          />
          <p className="mb-2 text-sm text-muted mt-2">Or cross-group (buy A get B):</p>
          <Controller
            name="group_a_csv"
            control={control}
            render={({ field, fieldState: { error } }) => (
              <MenuItemSelect
                label="Group A items (Buy these)"
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
                label="Group B items (Get these)"
                value={field.value}
                onChange={field.onChange}
                error={error?.message}
                className="mb-4"
              />
            )}
          />
          <Input
            label="% discount on discounted BOGO units (usually 100)"
            type="number"
            {...register('discount_cheapest_percent', { valueAsNumber: true })}
            variant="outline"
            className="mb-5"
          />
        </>
      )}

      {template === 'buy_n_get_one_free' && (
        <>
          <Input
            label="N (buy N get 1 free uses N+1 cycle)"
            type="number"
            {...register('n', { valueAsNumber: true })}
            variant="outline"
            className="mb-5"
          />
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
          <Input
            label="Existing coupon code"
            {...register('coupon_code')}
            variant="outline"
            placeholder="SUMMER20"
            note="Must match a code under Promotions → Coupon codes. Customers apply this via the storefront promotion card only — the code is not exposed in public APIs."
          />
        </div>
      )}
    </>
  );
}

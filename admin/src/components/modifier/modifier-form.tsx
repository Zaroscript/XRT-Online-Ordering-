import Input from '@/components/ui/input';
import { Switch } from '@headlessui/react';
import {
  useForm,
  useWatch,
  useFieldArray,
  FormProvider,
  Controller,
} from 'react-hook-form';
import Button from '@/components/ui/button';
import Card from '@/components/common/card';
import Description from '@/components/ui/description';
import { useRouter } from 'next/router';
import { yupResolver } from '@hookform/resolvers/yup';
import { Modifier, QuantityLevel, PricesBySize } from '@/types';
import { Routes } from '@/config/routes';
import { useTranslation } from 'next-i18next';
import SwitchInput from '@/components/ui/switch-input';
import {
  useCreateModifierMutation,
  useUpdateModifierMutation,
} from '@/data/modifier';
import { useModifierGroupQuery } from '@/data/modifier-group';
import StickyFooterPanel from '@/components/ui/sticky-footer-panel';
import { EditIcon } from '@/components/icons/edit';
import Label from '@/components/ui/label';
import * as yup from 'yup';
import { Tabs, TabList, Tab, TabPanel } from '@/components/ui/tabs';
import { useItemSizesQuery } from '@/data/item-size';
import QuantityLevelField from '@/components/modifier-group/quantity-level-field';
import { TrashIcon } from '@/components/icons/trash';

type FormValues = {
  name: string;
  display_order: number;
  is_active?: boolean;
  sides_config?: {
    enabled?: boolean;
    allowed_sides?: string[];
  };
  quantity_levels?: QuantityLevel[];
  prices_by_size?: PricesBySize[];
  inherit_pricing?: boolean;
};

const modifierValidationSchema = yup.object().shape({
  name: yup.string().required('form:error-name-required'),
  display_order: yup
    .number()
    .transform((value) =>
      isNaN(value) || value === null || value === '' ? 0 : value,
    )
    .required('form:error-display-order-required')
    .min(0, 'form:error-display-order-min'),
  is_active: yup.boolean().optional(),
  sides_config: yup
    .object()
    .shape({
      enabled: yup.boolean().optional(),
      allowed_sides: yup.array().of(yup.string().required()).optional(),
    })
    .optional(),
  inherit_pricing: yup.boolean().optional(),
  quantity_levels: yup.array().when('inherit_pricing', {
    is: (val: boolean) => val === false,
    then: (schema) =>
      schema.of(
        yup.object().shape({
          quantity: yup
            .number()
            .required('form:error-quantity-required')
            .min(1, 'form:error-quantity-min'),
          name: yup.string().optional(),
          price: yup
            .number()
            .transform((value) => (isNaN(value) ? undefined : value))
            .optional()
            .min(0, 'form:error-price-must-positive'),
          is_default: yup.boolean(),
          display_order: yup
            .number()
            .transform((value) => (isNaN(value) ? undefined : value))
            .optional()
            .min(0, 'form:error-display-order-min'),
          is_active: yup.boolean(),
        }),
      ),
    otherwise: (schema) => schema.optional(),
  }),
  prices_by_size: yup.array().of(
    yup.object().shape({
      sizeCode: yup
        .string()
        .oneOf(['S', 'M', 'L', 'XL', 'XXL'])
        .required('form:error-size-code-required'),
      priceDelta: yup.number().required('form:error-price-delta-required'),
    }),
  ),
});

const defaultValues: FormValues = {
  name: '',
  display_order: 0,
  is_active: true,
  sides_config: {
    enabled: false,
    allowed_sides: [],
  },
  inherit_pricing: true,
};

type IProps = {
  initialValues?: Modifier | undefined;
  modifierGroupId: string;
  onSuccess?: () => void;
};
export default function CreateOrUpdateModifierForm({
  initialValues,
  modifierGroupId,
  onSuccess,
}: IProps) {
  const router = useRouter();
  const { t } = useTranslation();
  const { mutate: createModifier, isPending: creating } =
    useCreateModifierMutation();
  const { mutate: updateModifier, isPending: updating } =
    useUpdateModifierMutation();

  // Fetch Modifier Group Data for Inheritance
  const { group: modifierGroup } = useModifierGroupQuery({
    id: modifierGroupId,
    language: router.locale!,
  });

  const methods = useForm<FormValues>({
    resolver: yupResolver(modifierValidationSchema) as any,
    defaultValues: initialValues
      ? {
          name: initialValues.name,
          display_order: initialValues.display_order,
          is_active: initialValues.is_active,
          sides_config: initialValues.sides_config
            ? {
                enabled: initialValues.sides_config.enabled ?? false,
                allowed_sides: initialValues.sides_config.allowed_sides || [],
              }
            : {
                enabled: false,
                allowed_sides: [],
              },
          quantity_levels:
            initialValues.quantity_levels?.map((ql) => ({
              ...ql,
              name: ql.name ?? undefined,
              display_order: ql.display_order ?? 0,
              price: (ql as any).pivot?.price ?? (ql as any).price ?? 0,
              prices_by_size: ql.prices_by_size || [],
            })) || [],
          prices_by_size: initialValues.prices_by_size || [],
          inherit_pricing:
            !initialValues.quantity_levels ||
            initialValues.quantity_levels.length === 0,
        }
      : defaultValues,
  });

  const {
    register,
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = methods;

  const businessId = (modifierGroup as any)?.business_id;
  const { sizes: itemSizes } = useItemSizesQuery(businessId);

  const {
    fields: quantityLevelFields,
    append: appendQuantityLevel,
    remove: removeQuantityLevel,
  } = useFieldArray({
    control,
    name: 'quantity_levels',
  });
  // Re-declaring to ensure scope availability if needed, but it's already above.
  // Actually, let's just replace the usage.

  const allowedSides = watch('sides_config.allowed_sides') || [];
  const sidesEnabled = watch('sides_config.enabled') ?? false;
  const inheritPricing = watch('inherit_pricing') ?? true;

  const toggleSide = (side: string) => {
    const currentSides = allowedSides || [];
    const newSides = currentSides.includes(side)
      ? currentSides.filter((s) => s !== side)
      : [...currentSides, side];
    setValue('sides_config.allowed_sides', newSides);
  };

  const onSubmit = async (values: FormValues): Promise<void> => {
    let quantityLevels = values.quantity_levels || [];
    let pricesBySize = values.prices_by_size || [];

    // If inheriting pricing, explicitly clear overrides so backend knows to inherit
    if (values.inherit_pricing) {
      quantityLevels = [];
      pricesBySize = [];
    } else if (!values.inherit_pricing && modifierGroup) {
      // If NOT inheriting (Override), ensuring we are sending valid data is handled by form validation
      // But we might want to ensure we don't accidentally send empty arrays if user just toggled and didn't touch anything,
      // although pre-fill logic should handle that.
    }

    const input: any = {
      modifier_group_id: modifierGroupId,
      name: values.name,
      display_order: values.display_order || 0,
      is_active: values.is_active !== undefined ? values.is_active : true,
      quantity_levels: quantityLevels,
      prices_by_size: pricesBySize,
    };

    // Include sides_config only if enabled
    if (values.sides_config?.enabled) {
      input.sides_config = {
        enabled: true,
        allowed_sides: values.sides_config.allowed_sides || [],
      };
    } else {
      // If disabled, don't send sides_config or send it as disabled
      input.sides_config = {
        enabled: false,
        allowed_sides: [],
      };
    }

    if (!initialValues) {
      createModifier(input, {
        onSuccess: () => {
          if (onSuccess) {
            onSuccess();
          } else {
            router.push(Routes.modifierGroup.details(modifierGroupId));
          }
        },
      });
    } else {
      updateModifier(
        {
          id: initialValues.id,
          ...input,
        },
        {
          onSuccess: () => {
            if (onSuccess) {
              onSuccess();
            } else {
              router.push(Routes.modifierGroup.details(modifierGroupId));
            }
          },
        },
      );
    }
  };

  const isLoading = creating || updating;

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Tabs defaultTab="basic">
          <TabList>
            <Tab id="basic">{t('form:tab-basic-info')}</Tab>
            <Tab id="pricing">{t('form:tab-pricing-config')}</Tab>
          </TabList>

          <TabPanel id="basic">
            <div className="flex flex-wrap pb-8 my-5 border-b border-dashed border-border-base sm:my-8">
              <Description
                title={t('form:form-title-information')}
                details={t('form:modifier-info-helper-text')}
                className="w-full px-0 pb-5 sm:w-4/12 sm:py-8 sm:pe-4 md:w-1/3 md:pe-5"
              />
              <Card className="w-full sm:w-8/12 md:w-2/3">
                <div className="mb-5 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>{t('form:modifier-override-note')}</strong>{' '}
                    {t('form:modifier-override-note-text')}
                  </p>
                </div>

                <Input
                  label={t('form:input-label-name')}
                  {...register('name')}
                  error={t(errors.name?.message!)}
                  variant="outline"
                  className="mb-5"
                  required
                />

                <div className="mb-5">
                  <Input
                    label={t('form:input-label-display-order')}
                    {...register('display_order', {
                      valueAsNumber: true,
                    })}
                    type="number"
                    min="0"
                    error={t(errors.display_order?.message!)}
                    variant="outline"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {t('form:display-order-helper')}
                  </p>
                </div>

                <div className="mb-5">
                  <SwitchInput
                    name="is_active"
                    control={control}
                    label={t('form:input-label-active')}
                  />
                </div>

                <div className="mb-5 p-4 border border-border-200 rounded-lg bg-gray-50">
                  <div className="mb-3">
                    <SwitchInput
                      name="sides_config.enabled"
                      control={control}
                      label={t('form:input-label-enable-sides')}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      {t('form:sides-config-helper')}
                    </p>
                  </div>
                  {sidesEnabled && (
                    <div className="mt-4 space-y-3">
                      <Label className="mb-3 block text-sm font-medium">
                        {t('form:input-label-allowed-sides')}
                      </Label>
                      {['LEFT', 'RIGHT', 'WHOLE'].map((side) => (
                        <div
                          key={side}
                          className="flex items-center justify-between"
                        >
                          <Label className="text-sm text-body">
                            {t(`form:input-label-side-${side.toLowerCase()}`)}
                          </Label>
                          <input
                            type="checkbox"
                            checked={allowedSides.includes(side)}
                            onChange={() => toggleSide(side)}
                            className="h-4 w-4 rounded border-gray-300 text-accent focus:ring-accent"
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </Card>
            </div>
          </TabPanel>

          <TabPanel id="pricing">
            <div className="flex flex-wrap pb-8 my-5 border-b border-dashed border-border-base sm:my-8">
              <Description
                title={t('form:form-title-pricing')}
                details={t('form:modifier-pricing-helper-text')}
                className="w-full px-0 pb-5 sm:w-4/12 sm:py-8 sm:pe-4 md:w-1/3 md:pe-5"
              />
              <Card className="w-full sm:w-8/12 md:w-2/3">
                <div className="mb-5 p-4 bg-gray-50 border border-gray-200 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-base font-semibold mb-1">
                        {t('form:input-label-inherit-pricing')}
                      </Label>
                      <p className="text-xs text-body text-gray-500">
                        {t('form:inherit-pricing-helper')}
                      </p>
                    </div>
                    <Controller
                      name="inherit_pricing"
                      control={control}
                      render={({ field: { value, onChange } }) => (
                        <Switch
                          checked={value ?? true}
                          onChange={(checked: boolean) => {
                            onChange(checked);
                            if (!checked && modifierGroup) {
                              // Switching to Override: Pre-fill with group data
                              const groupQtyLevels =
                                modifierGroup.quantity_levels || [];
                              const groupPricesBySize =
                                modifierGroup.prices_by_size || [];

                              // Clear current fields first (optional, but cleaner)
                              setValue('quantity_levels', []);

                              // We need to set the value. Since we are using useFieldArray,
                              // simply setting the value in the form might not update the fields if we don't use the append/replace methods.
                              // However, react-hook-form setValue works if we re-mount or if we update the array fields.
                              // Best way with useFieldArray is to replace the fields.
                              // But we can just use setValue for the whole array and RHF should handle it if we trigger a re-render.

                              setValue(
                                'quantity_levels',
                                groupQtyLevels.map((ql: any) => ({
                                  ...ql,
                                  is_default: ql.is_default ?? false,
                                  is_active: ql.is_active ?? true,
                                  prices_by_size: ql.prices_by_size || [],
                                })),
                              );
                              setValue('prices_by_size', groupPricesBySize);
                            }
                          }}
                          className={`${
                            value ? 'bg-accent' : 'bg-gray-300'
                          } relative inline-flex h-6 w-11 items-center rounded-full focus:outline-none`}
                        >
                          <span className="sr-only">
                            {t('form:input-label-inherit-pricing')}
                          </span>
                          <span
                            className={`${
                              value ? 'translate-x-6' : 'translate-x-1'
                            } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
                          />
                        </Switch>
                      )}
                    />
                  </div>
                </div>

                {inheritPricing ? (
                  <div className="space-y-4">
                    <div className="p-4 bg-blue-50 border border-blue-100 rounded-lg flex items-start gap-3">
                      <div className="text-blue-500 mt-0.5">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                          className="w-5 h-5"
                        >
                          <path
                            fillRule="evenodd"
                            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                      <div className="text-sm text-blue-700">
                        <p className="font-semibold mb-1">
                          {t('form:pricing-inherited-text')}
                        </p>
                        <p>{t('form:modifier-inherited-view-help')}</p>
                      </div>
                    </div>

                    {/* Read-Only View of Group Pricing */}
                    {modifierGroup?.quantity_levels &&
                    modifierGroup.quantity_levels.length > 0 ? (
                      <div className="border border-gray-200 rounded-lg overflow-hidden">
                        <div className="bg-gray-50 px-4 py-2 border-b border-gray-200">
                          <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                            {t('form:group-pricing-configuration')}
                          </h4>
                        </div>
                        <div className="divide-y divide-gray-100">
                          {modifierGroup.quantity_levels.map(
                            (ql: any, idx: number) => (
                              <div key={idx} className="p-4 bg-white/50">
                                <div className="flex items-center justify-between mb-2">
                                  <span className="font-medium text-sm">
                                    {ql.quantity}x {ql.name || ''}
                                  </span>
                                  <div className="flex items-center gap-2">
                                    {ql.price !== undefined &&
                                      ql.price !== 0 && (
                                        <span className="text-[11px] px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full font-medium border border-blue-200">
                                          {t('form:base-price') || 'Base'}: $
                                          {ql.price.toFixed(2)}
                                        </span>
                                      )}
                                    {ql.is_default && (
                                      <span className="text-[11px] px-2 py-0.5 bg-green-100 text-green-700 rounded-full font-medium border border-green-200">
                                        {t('form:text-default') || 'Default'}
                                      </span>
                                    )}
                                  </div>
                                </div>

                                {ql.prices_by_size &&
                                ql.prices_by_size.length > 0 ? (
                                  <div className="mt-2 grid grid-cols-2 gap-2">
                                    {ql.prices_by_size.map(
                                      (pbs: any, pIdx: number) => {
                                        // Helper to find size name if possible, otherwise use code
                                        const sizeName =
                                          itemSizes?.find(
                                            (s: any) =>
                                              s.id === pbs.size_id ||
                                              s.code === pbs.sizeCode,
                                          )?.name || pbs.sizeCode;
                                        return (
                                          <div
                                            key={pIdx}
                                            className="text-xs bg-gray-50 px-2 py-1 rounded border border-gray-100 text-gray-600 flex justify-between"
                                          >
                                            <span>{sizeName}:</span>
                                            <span className="font-mono">
                                              {pbs.priceDelta > 0 ? '+' : ''}
                                              {pbs.priceDelta?.toFixed(2)}
                                            </span>
                                          </div>
                                        );
                                      },
                                    )}
                                  </div>
                                ) : (
                                  <p className="text-xs text-gray-400 italic">
                                    No size pricing configured
                                  </p>
                                )}
                              </div>
                            ),
                          )}
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500 italic p-4 text-center bg-gray-50 rounded border border-gray-100">
                        {t('form:no-group-pricing-configured')}
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="mb-5 animate-fadeIn">
                    <div className="flex items-center justify-between mb-4">
                      <Label className="text-lg font-semibold">
                        {t('form:input-label-quantity-levels')}
                      </Label>
                      <Button
                        type="button"
                        onClick={() =>
                          appendQuantityLevel({
                            quantity: 1,
                            name: '',
                            price: 0,
                            is_default: false,
                            display_order: quantityLevelFields.length,
                            is_active: true,
                            prices_by_size: [],
                          })
                        }
                        size="small"
                      >
                        {t('form:button-label-add-quantity-level')}
                      </Button>
                    </div>

                    {quantityLevelFields.length === 0 ? (
                      <p className="text-sm text-gray-500 italic p-4 bg-gray-50 rounded">
                        {t('form:no-quantity-levels')}
                      </p>
                    ) : (
                      <>
                        {/* Desktop Header Row */}
                        <div className="hidden lg:grid lg:grid-cols-12 gap-4 px-4 py-3 bg-gray-100/50 border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase tracking-wider rounded-t-lg">
                          <div className="lg:col-span-1">
                            {t('form:input-label-quantity') || 'Quantity'}
                          </div>
                          <div className="lg:col-span-4">
                            {t('form:input-label-name') || 'Name'}
                          </div>
                          <div className="lg:col-span-1">
                            {t('form:input-label-display-order') || 'Order'}
                          </div>
                          <div className="lg:col-span-2 text-center">
                            {t('form:input-label-price') || 'Price'}
                          </div>
                          <div className="lg:col-span-3 text-center">
                            {t('form:input-label-settings') || 'Settings'}
                          </div>
                          <div className="lg:col-span-1 text-end">
                            {t('form:input-label-actions') || 'Actions'}
                          </div>
                        </div>

                        <div className="space-y-4 lg:space-y-0 lg:border lg:border-gray-200 lg:border-t-0 lg:rounded-b-lg lg:divide-y lg:divide-gray-100 mb-6">
                          {quantityLevelFields.map((field, index) => (
                            <QuantityLevelField
                              key={field.id}
                              index={index}
                              remove={() => removeQuantityLevel(index)}
                              control={control}
                              errors={errors}
                              globalSizes={itemSizes}
                            />
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                )}
              </Card>
            </div>
          </TabPanel>
        </Tabs>

        <StickyFooterPanel className="z-0">
          <div className="flex items-center justify-end">
            <Button
              variant="outline"
              type="button"
              onClick={() => {
                if (onSuccess) {
                  onSuccess();
                } else {
                  router.push(Routes.modifierGroup.details(modifierGroupId));
                }
              }}
              className="text-sm me-4 md:ms-0"
            >
              {t('form:button-label-cancel')}
            </Button>
            <Button
              loading={isLoading}
              disabled={isLoading}
              className="text-sm"
            >
              {initialValues ? (
                <>
                  <EditIcon className="w-5 h-5 shrink-0 ltr:mr-2 rtl:pl-2" />
                  <span className="sm:hidden">
                    {t('form:button-label-update')}
                  </span>
                  <span className="hidden sm:block">
                    {t('form:button-label-update-modifier')}
                  </span>
                </>
              ) : (
                t('form:button-label-add-modifier')
              )}
            </Button>
          </div>
        </StickyFooterPanel>
      </form>
    </FormProvider>
  );
}

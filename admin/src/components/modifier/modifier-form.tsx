import Input from '@/components/ui/input';
import {
  useForm,
  useWatch,
  useFieldArray,
  FormProvider,
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

  const { sizes: itemSizes } = useItemSizesQuery();

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

    // If inheriting pricing, use data from Modifier Group
    if (values.inherit_pricing && modifierGroup) {
      if (modifierGroup.quantity_levels) {
        quantityLevels = modifierGroup.quantity_levels.map((ql) => ({
          ...ql,
          // Ensure optional fields are handled correctly
          name: ql.name ?? undefined,
          price: ql.price ?? 0,
          is_default: ql.is_default ?? false,
          display_order: ql.display_order ?? 0,
          is_active: ql.is_active ?? true,
          prices_by_size: ql.prices_by_size || [],
        }));
      }

      if (modifierGroup.prices_by_size) {
        pricesBySize = modifierGroup.prices_by_size;
      }
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
                  <div className="mb-2">
                    <SwitchInput
                      name="inherit_pricing"
                      control={control}
                      label={t('form:input-label-inherit-pricing')}
                    />
                    <p className="text-xs text-body mt-1">
                      {t('form:inherit-pricing-helper')}
                    </p>
                  </div>
                </div>

                {inheritPricing ? (
                  <div className="p-4 bg-blue-50 border border-blue-100 rounded-lg text-blue-700 text-sm">
                    {t('form:pricing-inherited-text')}
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
                      <div className="space-y-4">
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

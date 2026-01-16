import Input from '@/components/ui/input';
import {
  useForm,
  useFieldArray,
  Controller,
  FormProvider,
} from 'react-hook-form';
import Button from '@/components/ui/button';
import Label from '@/components/ui/label';
import Card from '@/components/common/card';
import Description from '@/components/ui/description';
import { useRouter } from 'next/router';
import ValidationError from '@/components/ui/form-validation-error';
import { ModifierGroup, QuantityLevel, PricesBySize } from '@/types';
import { Routes } from '@/config/routes';
import { useTranslation } from 'next-i18next';
import SelectInput from '@/components/ui/select-input';
import { yupResolver } from '@hookform/resolvers/yup';
import { modifierGroupValidationSchema } from './modifier-group-validation-schema';
import {
  useCreateModifierGroupMutation,
  useUpdateModifierGroupMutation,
} from '@/data/modifier-group';
import { useItemSizesQuery } from '@/data/item-size';
import SwitchInput from '@/components/ui/switch-input';
import { TrashIcon } from '@/components/icons/trash';
import {
  Tabs,
  TabList,
  Tab,
  TabPanel,
  MobileTabSelect,
} from '@/components/ui/tabs';
import StickyFooterPanel from '@/components/ui/sticky-footer-panel';
import cn from 'classnames';

import QuantityLevelField from './quantity-level-field';

type FormValues = {
  name: string;
  display_type: 'RADIO' | 'CHECKBOX';
  min_select: number;
  max_select: number;
  applies_per_quantity?: boolean;
  quantity_levels?: QuantityLevel[];
  is_active?: boolean;
  sort_order: number;
};

const defaultValues: FormValues = {
  name: '',
  display_type: 'RADIO' as const,
  min_select: 0,
  max_select: 1,
  applies_per_quantity: false,
  quantity_levels: [],
  is_active: true,
  sort_order: 0,
};

type IProps = {
  initialValues?: ModifierGroup | undefined;
};

export default function CreateOrUpdateModifierGroupForm({
  initialValues,
}: IProps) {
  const router = useRouter();
  const { t } = useTranslation(['common', 'form']);

  const methods = useForm<FormValues>({
    defaultValues: initialValues
      ? {
          name: initialValues.name,
          display_type: initialValues.display_type,
          min_select: initialValues.min_select,
          max_select: initialValues.max_select,
          applies_per_quantity: initialValues.applies_per_quantity,
          quantity_levels:
            initialValues.quantity_levels?.map((ql) => ({
              ...ql,
              name: ql.name ?? undefined,
              display_order: ql.display_order ?? 0,
              price: (ql as any).pivot?.price ?? (ql as any).price ?? 0,
              prices_by_size: ql.prices_by_size || [],
            })) || [],
          is_active: initialValues.is_active,
          sort_order: initialValues.sort_order,
        }
      : defaultValues,
    resolver: yupResolver(modifierGroupValidationSchema),
  });

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    watch,
  } = methods;

  const {
    fields: quantityLevelFields,
    append: appendQuantityLevel,
    remove: removeQuantityLevel,
  } = useFieldArray({
    control,
    name: 'quantity_levels',
  });

  const displayTypeOptions = [
    { value: 'RADIO', label: `${t('common:text-radio')} (Single Selection)` },
    {
      value: 'CHECKBOX',
      label: `${t('common:text-checkbox')} (Multiple Selection)`,
    },
  ];

  const sizeCodeOptions = [
    { value: 'S', label: 'S (Small)' },
    { value: 'M', label: 'M (Medium)' },
    { value: 'L', label: 'L (Large)' },
    { value: 'XL', label: 'XL (Extra Large)' },
    { value: 'XXL', label: 'XXL (Double Extra Large)' },
  ];

  const { mutate: createGroup, isPending: creating } =
    useCreateModifierGroupMutation();
  const { mutate: updateGroup, isPending: updating } =
    useUpdateModifierGroupMutation();

  const minSelect = watch('min_select');
  const isRequired = minSelect > 0;
  const isPending = creating || updating;

  // Mock business ID for now - should come from context/auth
  const businessId = 'biz_001';
  const { sizes: globalSizes } = useItemSizesQuery(businessId);

  const onSubmit = async (values: FormValues) => {
    const input = {
      name: values.name,
      display_type: (values.display_type as any)?.value || values.display_type,
      min_select: Number(values.min_select),
      max_select: Number(values.max_select),
      applies_per_quantity: values.applies_per_quantity || false,
      quantity_levels: values.quantity_levels || [],
      is_active: values.is_active !== false,
      sort_order: Number(values.sort_order),
      business_id: businessId,
    };

    if (!initialValues) {
      createGroup(input);
    } else {
      updateGroup({
        ...input,
        id: initialValues.id!,
      });
    }
  };

  return (
    <FormProvider {...methods}>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-0 pb-20 sm:pb-0 w-full max-w-full overflow-x-hidden"
      >
        {/* Sticky Action Header - Desktop Only */}
        <div
          className={cn(
            'hidden sm:flex sticky top-0 z-20 bg-white/95 backdrop-blur-sm',
            'border-b border-border-200 shadow-sm',
            '-mx-5 md:-mx-8 px-8 md:px-8 py-3 sm:py-4 mb-4 sm:mb-6',
            'flex-row items-center justify-between gap-3 sm:gap-4',
            'w-[calc(100%+2.5rem)] md:w-[calc(100%+4rem)]',
          )}
        >
          <div className="flex-1 min-w-0 px-4">
            <h2 className="text-base sm:text-lg font-semibold text-heading">
              {initialValues
                ? t('form:form-title-edit-modifier-group') ||
                  'Edit Modifier Group'
                : t('form:form-title-create-modifier-group') ||
                  'Create Modifier Group'}
            </h2>
            <p className="text-xs sm:text-sm text-body mt-1">
              {t('form:modifier-group-form-subtitle') ||
                'Configure the modifier group settings'}
            </p>
          </div>
          <div className="flex p-4 items-center gap-2 sm:gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push(Routes.modifierGroup.list)}
              className="text-sm sm:text-base"
              disabled={isPending}
            >
              {t('form:button-label-cancel')}
            </Button>
            <Button
              type="submit"
              loading={isPending}
              disabled={isPending}
              className="text-sm sm:text-base"
            >
              {initialValues
                ? t('form:button-label-update')
                : t('form:button-label-save')}
            </Button>
          </div>
        </div>

        {/* Mobile Header - Non-sticky */}
        <div className="sm:hidden mb-4 py-4 border-b border-border-200">
          <h2 className="text-base font-semibold text-heading mb-1">
            {initialValues
              ? t('form:form-title-edit-modifier-group') ||
                'Edit Modifier Group'
              : t('form:form-title-create-modifier-group') ||
                'Create Modifier Group'}
          </h2>
          <p className="text-xs  text-body">
            {t('form:modifier-group-form-subtitle') ||
              'Configure the modifier group settings'}
          </p>
        </div>

        {/* Tabbed Form Content */}
        <Tabs
          defaultTab="general"
          className="animate-fade-in w-full max-w-full overflow-x-hidden"
        >
          {/* Mobile dropdown for tabs */}
          <div className="sm:hidden mb-4 w-full">
            <MobileTabSelect
              tabs={[
                { id: 'general', label: t('form:tab-general') || 'General' },
                {
                  id: 'selection',
                  label: t('form:tab-selection-rules') || 'Selection Rules',
                },
                {
                  id: 'quantity-levels',
                  label: t('form:tab-quantity-levels') || 'Quantity Levels',
                  badge: quantityLevelFields.length,
                },
              ]}
            />
          </div>

          {/* Desktop tab list */}
          <TabList className="hidden sm:flex -mx-5 md:-mx-8 px-8 md:px-8 w-[calc(100%+2.5rem)] md:w-[calc(100%+4rem)]">
            <Tab id="general" icon={<GeneralIcon />}>
              {t('form:tab-general') || 'General'}
            </Tab>
            <Tab id="selection" icon={<SelectionIcon />}>
              {t('form:tab-selection-rules') || 'Selection Rules'}
            </Tab>
            <Tab
              id="quantity-levels"
              badge={quantityLevelFields.length}
              icon={<QuantityIcon />}
            >
              {t('form:tab-quantity-levels') || 'Quantity Levels'}
            </Tab>
          </TabList>

          {/* General Tab */}
          <TabPanel id="general">
            <Card className="animate-slide-up">
              <div className="space-y-4 sm:space-y-5">
                <Input
                  label={t('form:input-label-name')}
                  {...register('name')}
                  error={t(errors.name?.message!)}
                  variant="outline"
                  placeholder={
                    t('form:input-placeholder-modifier-group-name') ||
                    'e.g., Toppings, Sizes, Extras'
                  }
                  className="w-full"
                />

                <Input
                  label={t('form:input-label-sort-order') || 'Sort Order'}
                  {...register('sort_order', { valueAsNumber: true })}
                  type="number"
                  variant="outline"
                  error={t(errors.sort_order?.message!)}
                  note={
                    t('form:sort-order-note') || 'Lower numbers appear first'
                  }
                  className="w-full"
                />

                <div className="flex items-center gap-4 sm:gap-6 pt-2">
                  <SwitchInput
                    name="is_active"
                    control={control as any}
                    label={t('form:input-label-is-active') || 'Active'}
                  />
                </div>
              </div>
            </Card>
          </TabPanel>

          {/* Selection Rules Tab */}
          <TabPanel id="selection">
            <Card className="animate-slide-up">
              <div className="space-y-4 sm:space-y-5">
                <div>
                  <Label className="text-sm sm:text-base">
                    {t('form:input-label-display-type') || 'Display Type'}
                  </Label>
                  <p className="text-xs text-gray-500 mb-2 mt-1">
                    {t('form:display-type-helper') ||
                      'How customers select modifiers from this group'}
                  </p>
                  <SelectInput
                    name="display_type"
                    control={control as any}
                    options={displayTypeOptions}
                    getOptionLabel={(option: any) => option.label}
                    getOptionValue={(option: any) => option.value}
                  />
                  <ValidationError message={t(errors.display_type?.message!)} />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Input
                      label={
                        t('form:input-label-min-select') || 'Minimum Selections'
                      }
                      {...register('min_select', { valueAsNumber: true })}
                      type="number"
                      min={0}
                      variant="outline"
                      error={t(errors.min_select?.message!)}
                      className="w-full"
                    />
                    {isRequired && (
                      <p className="text-xs text-accent mt-1 flex items-center gap-1">
                        <CheckIcon />
                        {t('form:modifier-group-required-note') ||
                          'Group is required'}
                      </p>
                    )}
                    {!isRequired && (
                      <p className="text-xs text-gray-500 mt-1">
                        {t('form:modifier-group-optional-note') ||
                          'Set to 0 for optional'}
                      </p>
                    )}
                  </div>
                  <div>
                    <Input
                      label={
                        t('form:input-label-max-select') || 'Maximum Selections'
                      }
                      {...register('max_select', { valueAsNumber: true })}
                      type="number"
                      min={1}
                      variant="outline"
                      error={t(errors.max_select?.message!)}
                      className="w-full"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      {t('form:max-select-note') ||
                        'Max items customer can select'}
                    </p>
                  </div>
                </div>

                <div className="pt-3 sm:pt-4 border-t border-border-100">
                  <div className="flex items-start gap-3 sm:gap-4">
                    <SwitchInput
                      name="applies_per_quantity"
                      control={control as any}
                      label={
                        t('form:input-label-applies-per-quantity') ||
                        'Applies Per Quantity'
                      }
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-2 ml-0 sm:ml-11">
                    {t('form:applies-per-quantity-helper') ||
                      'If enabled, modifier pricing applies per item quantity (e.g., $0.50 extra cheese × 2 pizzas = $1.00)'}
                  </p>
                </div>
              </div>
            </Card>
          </TabPanel>

          {/* Quantity Levels Tab */}
          <TabPanel
            id="quantity-levels"
            className="w-full max-w-full overflow-x-hidden"
          >
            <Card className="animate-slide-up overflow-hidden w-full max-w-full">
              <div className="mb-4 sm:mb-6">
                <h3 className="text-sm sm:text-base font-medium text-heading mb-2">
                  {t('form:input-label-quantity-levels') || 'Quantity Levels'}
                </h3>
                <p className="text-xs sm:text-sm text-gray-600">
                  {t('form:quantity-levels-group-helper-text') ||
                    'Define default quantity levels for ALL modifiers in this group. These levels (e.g., Light, Normal, Extra) will be available for all modifiers.'}
                </p>
              </div>

              {quantityLevelFields.length === 0 ? (
                <div className="text-center py-10 sm:py-12 border-2 border-dashed border-border-200 rounded-lg px-4 bg-gray-50/50">
                  <div className="bg-white p-4 rounded-full shadow-sm w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                    <QuantityIcon className="w-8 h-8 text-accent" />
                  </div>
                  <h4 className="text-base sm:text-lg font-medium text-heading mb-2">
                    {t('form:no-quantity-levels') ||
                      'No Quantity Levels Defined'}
                  </h4>
                  <p className="text-sm text-gray-500 mb-6 max-w-sm mx-auto">
                    {t('form:no-quantity-levels-helper') ||
                      'Create levels like "Light", "Normal", "Extra" to allow customers to customize their order.'}
                  </p>
                  <Button
                    type="button"
                    onClick={() =>
                      appendQuantityLevel({
                        quantity: 1,
                        name: '',
                        display_order: quantityLevelFields.length,
                        is_default: false,
                        is_active: true,
                        prices_by_size: [],
                      })
                    }
                    className="text-sm sm:text-base px-6 h-11"
                  >
                    {t('form:button-label-add-quantity-level') ||
                      'Add Quantity Level'}
                  </Button>
                </div>
              ) : (
                <>
                  {/* Desktop Header Row */}
                  <div className="hidden lg:grid lg:grid-cols-12 gap-4 px-4 py-3 bg-gray-100/50 border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase tracking-wider rounded-t-lg">
                    <div className="lg:col-span-2">
                      {t('form:input-label-quantity') || 'Quantity'}
                    </div>
                    <div className="lg:col-span-4">
                      {t('form:input-label-name') || 'Name'}
                    </div>
                    <div className="lg:col-span-2">
                      {t('form:input-label-display-order') || 'Order'}
                    </div>
                    <div className="lg:col-span-3">
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
                        globalSizes={globalSizes}
                      />
                    ))}
                  </div>

                  <Button
                    type="button"
                    onClick={() =>
                      appendQuantityLevel({
                        quantity: quantityLevelFields.length + 1,
                        name: '',
                        display_order: quantityLevelFields.length,
                        is_default: false,
                        is_active: true,
                        prices_by_size: [],
                      })
                    }
                    variant="outline"
                    className="w-full sm:w-auto text-sm sm:text-base"
                  >
                    {t('form:button-label-add-quantity-level') ||
                      'Add Quantity Level'}
                  </Button>
                </>
              )}
            </Card>
          </TabPanel>
        </Tabs>

        {/* Mobile Sticky Footer */}
        <div className="block sm:hidden">
          <StickyFooterPanel className="z-10">
            <div className="flex items-center gap-2 w-full">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push(Routes.modifierGroup.list)}
                className="flex-1 text-sm"
                disabled={isPending}
              >
                {t('form:button-label-cancel')}
              </Button>
              <Button
                type="submit"
                loading={isPending}
                disabled={isPending}
                className="flex-1 text-sm"
              >
                {initialValues
                  ? t('form:button-label-update')
                  : t('form:button-label-save')}
              </Button>
            </div>
          </StickyFooterPanel>
        </div>
      </form>
    </FormProvider>
  );
}

// Simple inline icons for tabs
function GeneralIcon({ className }: { className?: string }) {
  return (
    <svg
      className={cn('w-5 h-5', className)}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
      />
    </svg>
  );
}

function SelectionIcon({ className }: { className?: string }) {
  return (
    <svg
      className={cn('w-5 h-5', className)}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
      />
    </svg>
  );
}

function QuantityIcon({ className }: { className?: string }) {
  return (
    <svg
      className={cn('w-5 h-5', className)}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14"
      />
    </svg>
  );
}

function PricingIcon({ className }: { className?: string }) {
  return (
    <svg
      className={cn('w-5 h-5', className)}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg
      className={cn('w-4 h-4', className)}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M5 13l4 4L19 7"
      />
    </svg>
  );
}

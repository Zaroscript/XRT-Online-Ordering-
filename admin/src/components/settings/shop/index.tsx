import Card from '@/components/common/card';
import GooglePlacesAutocomplete from '@/components/form/google-places-autocomplete';
import { SaveIcon } from '@/components/icons/save';
import * as socialIcons from '@/components/icons/social';
import { shopValidationSchema } from '@/components/settings/shop/shop-validation-schema';
import Alert from '@/components/ui/alert';
import Button from '@/components/ui/button';
import Description from '@/components/ui/description';
import Input from '@/components/ui/input';
import Label from '@/components/ui/label';
import PhoneNumberInput from '@/components/ui/phone-input';
import StickyFooterPanel from '@/components/ui/sticky-footer-panel';
import SwitchInput from '@/components/ui/switch-input';
import TextArea from '@/components/ui/text-area';
import TooltipLabel from '@/components/ui/tooltip-label';
import { useUpdateSettingsMutation } from '@/data/settings';
import { socialIcon } from '@/settings/site.settings';
import { ContactDetailsInput, Settings } from '@/types';
import { getIcon } from '@/utils/get-icon';
import { yupResolver } from '@hookform/resolvers/yup';
import omit from 'lodash/omit';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { Controller, useFieldArray, useForm } from 'react-hook-form';
import SelectInput from '@/components/ui/select-input';
import { CURRENCY } from '@/data/currencies';
import { CURRENCY_FORMATS } from '@/data/currency-formats';

const DAYS = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
];

type ShopFormValues = {
  // Business Information
  siteTitle: string;
  siteSubtitle?: string;
  minimumOrderAmount?: number;
  timezone?: any;
  currency?: string;
  currencyOptions?: {
    formation?: string;
    fractions?: number;
  };
  // Shop Settings
  isProductReview?: boolean;
  enableCoupons?: boolean;
  enableEmailForDigitalProduct?: boolean;
  useGoogleMap?: boolean;
  enableReviewPopup?: boolean;
  maxShopDistance?: number;
  contactDetails: ContactDetailsInput & { contact: string };
  google?: {
    isEnable?: boolean;
    tagManagerId?: string;
  };
  facebook?: {
    isEnable?: boolean;
    appId?: string;
    pageId?: string;
  };
  reviewSystem?: any;
  orders?: {
    accept_orders?: boolean;
    allowScheduleOrder?: boolean;
    maxDays?: number;
    deliveredOrderTime?: number;
    auto_accept_orders?: boolean;
    auto_accept_order_types?: any;
    auto_accept_ready_time_pickup?: number;
    auto_accept_ready_time_delivery?: number;
  };
  delivery?: {
    enabled?: boolean;
    radius: number;
    fee: number;
    min_order: number;
    zones?: {
      radius: number;
      fee: number;
      min_order?: number;
    }[];
  };
  fees?: {
    service_fee?: number;
    tip_options?: number[];
  };
  taxes?: {
    sales_tax: number;
  };
  operating_hours?: {
    auto_close?: boolean;
    schedule?: {
      day: string;
      open_time: string;
      close_time: string;
      is_closed?: boolean;
    }[];
  };
  // Branding
  primary_color?: string;
  secondary_color?: string;
};

export const updatedIcons = socialIcon.map((item: any) => {
  item.label = (
    <div className="flex items-center text-body space-s-4">
      <span className="flex items-center justify-center w-4 h-4">
        {getIcon({
          iconList: socialIcons,
          iconName: item.value,
          className: 'w-4 h-4',
        })}
      </span>
      <span>{item.label}</span>
    </div>
  );
  return item;
});

type IProps = {
  settings?: Settings | null;
};

export default function SettingsForm({ settings }: IProps) {
  const { t } = useTranslation();
  const router = useRouter();
  const { locale } = router;
  const [isCopied, setIsCopied] = useState(false);
  const { mutate: updateSettingsMutation, isPending: loading } =
    useUpdateSettingsMutation();
  const { language, options } = settings ?? {};
  const {
    register,
    handleSubmit,
    control,
    watch,
    reset,
    getValues,
    formState: { errors },
  } = useForm<ShopFormValues>({
    shouldUnregister: true,
    // @ts-ignore
    resolver: yupResolver(shopValidationSchema),
    defaultValues: {
      ...options,
      // Business Information defaults
      siteTitle: options?.siteTitle ?? '',
      siteSubtitle: options?.siteSubtitle ?? '',
      minimumOrderAmount: options?.minimumOrderAmount ?? 0,
      timezone: options?.timezone ?? 'America/New_York',
      currency: options?.currency ?? 'USD',
      currencyOptions: {
        formation: options?.currencyOptions?.formation ?? 'en-US',
        fractions: options?.currencyOptions?.fractions ?? 2,
      },
      contactDetails: {
        ...options?.contactDetails,
        contact: options?.contactDetails?.contact ?? '',
        socials: options?.contactDetails?.socials
          ? options?.contactDetails?.socials.map((social: any) => ({
              icon: updatedIcons?.find((icon) => icon?.value === social?.icon),
              url: social?.url,
            }))
          : [],
      },
      reviewSystem: options?.reviewSystem
        ? options?.reviewSystem
        : 'review_single_time',
      orders: {
        accept_orders: options?.orders?.accept_orders ?? true,
        allowScheduleOrder: options?.orders?.allowScheduleOrder ?? false,
        maxDays: options?.orders?.maxDays ?? 0,
        deliveredOrderTime: options?.orders?.deliveredOrderTime ?? 0,
        auto_accept_orders: options?.orders?.auto_accept_orders ?? false,
        auto_accept_order_types: options?.orders?.auto_accept_order_types?.filter(Boolean).map(
          (type: string) => ({
            label: type.charAt(0).toUpperCase() + type.slice(1),
            value: type,
          }),
        ) ?? [],
        auto_accept_ready_time_pickup: options?.orders?.auto_accept_ready_time_pickup ?? 0,
        auto_accept_ready_time_delivery: options?.orders?.auto_accept_ready_time_delivery ?? 0,
      },
      delivery: {
        enabled: options?.delivery?.enabled ?? false,
        radius: options?.delivery?.radius ?? options?.maxShopDistance ?? 0,
        fee: options?.delivery?.fee ?? 0,
        min_order: options?.delivery?.min_order ?? 0,
        zones: options?.delivery?.zones ?? [],
      },
      fees: {
        service_fee: options?.fees?.service_fee ?? 0,
        tip_options: options?.fees?.tip_options ?? [10, 15, 20],
      },
      taxes: {
        sales_tax: options?.taxes?.sales_tax ?? 0,
      },
      operating_hours: {
        auto_close: options?.operating_hours?.auto_close ?? false,
        schedule: options?.operating_hours?.schedule?.length
          ? options.operating_hours.schedule
          : DAYS.map((day) => ({
              day,
              open_time: '09:00',
              close_time: '18:00',
              is_closed: false,
            })),
      },
      primary_color: options?.primary_color ?? '#5C9963',
      secondary_color: options?.secondary_color ?? '#2F3E30',
    },
  });

  const { fields: scheduleFields } = useFieldArray({
    control,
    name: 'operating_hours.schedule',
  });

  const {
    fields: zoneFields,
    append: appendZone,
    remove: removeZone,
  } = useFieldArray({
    control,
    name: 'delivery.zones',
  });

  const useGoogleMap = watch('useGoogleMap');
  const allowScheduleOrder = watch('orders.allowScheduleOrder');
  async function onSubmit(values: ShopFormValues) {
    // Address/contact come from landing settings; only socials are edited here
    const contactDetails = {
      ...options?.contactDetails,
      socials: values?.contactDetails?.socials
        ? values?.contactDetails?.socials.map((social: any) => ({
            icon: social?.icon?.value ?? social?.icon,
            url: social?.url,
          }))
        : (options?.contactDetails?.socials ?? []),
    };

    const payload = {
      language: locale,
      // @ts-ignore
      options: {
        ...options,
        ...values,
        timezone: values?.timezone?.value ?? values?.timezone,
        currency:
          (values?.currency as { code?: string } | undefined)?.code ??
          values?.currency,
        currencyOptions: {
          ...values?.currencyOptions,
          formation:
            (
              values?.currencyOptions?.formation as
                | { code?: string }
                | undefined
            )?.code ?? values?.currencyOptions?.formation,
        },
        contactDetails,
        maxShopDistance: (() => {
          const zones = values?.delivery?.zones ?? [];
          if (zones.length === 0) return 0;
          return Math.max(...zones.map((z: any) => Number(z.radius) || 0), 0);
        })(),
        useGoogleMap: false,
        delivery: {
          enabled: values?.delivery?.enabled ?? false,
          radius: 0,
          fee: 0,
          min_order: 0,
          zones:
            values?.delivery?.zones?.map((z: any) => ({
              radius: Number(z.radius),
              fee: Number(z.fee),
              min_order: Number(z.min_order ?? 0),
            })) ?? [],
        },
        fees: {
          ...values?.fees,
          service_fee: Number(values?.fees?.service_fee ?? 0),
          tip_options:
            typeof values?.fees?.tip_options === 'string'
              ? (values?.fees?.tip_options as string)
                  .split(',')
                  .map((t) => Number(t.trim()))
              : (values?.fees?.tip_options?.map((t: number) => Number(t)) ??
                []),
        },
        taxes: {
          ...values?.taxes,
          sales_tax: Number(values?.taxes?.sales_tax ?? 0),
        },
        operating_hours: {
          ...values?.operating_hours,
        },
        enableCoupons: values?.enableCoupons,
        isProductReview: values?.isProductReview,
        enableEmailForDigitalProduct: values?.enableEmailForDigitalProduct,
        reviewSystem: values?.reviewSystem?.value ?? values?.reviewSystem,
        orders: {
          ...options?.orders,
          allowScheduleOrder: values?.orders?.allowScheduleOrder,
          maxDays: Number(values?.orders?.maxDays ?? 0),
          deliveredOrderTime: Number(values?.orders?.deliveredOrderTime ?? 0),
          auto_accept_orders: values?.orders?.auto_accept_orders,
          auto_accept_order_types: values?.orders?.auto_accept_order_types?.map(
            (v: any) => v.value,
          ),
          auto_accept_ready_time_pickup: Number(values?.orders?.auto_accept_ready_time_pickup ?? 0),
          auto_accept_ready_time_delivery: Number(values?.orders?.auto_accept_ready_time_delivery ?? 0),
        },
        footer_text: options?.footer_text,
        copyrightText: options?.copyrightText,
        siteLink: options?.siteLink,
        minimumOrderAmount: Number(values?.minimumOrderAmount ?? 0),
        primary_color: values?.primary_color,
        secondary_color: values?.secondary_color,
      },
    };
    updateSettingsMutation(payload, {
      onSuccess: (data) => {
        // Reset form with the saved data to ensure isDirty is cleared
        // and defaultValues match the new state
        const savedOptions = data?.options || data;
        reset(
          {
            ...savedOptions,
            // Ensure contactDetails.socials is mapped back correctly for the form
            contactDetails: {
              ...savedOptions?.contactDetails,
              socials: savedOptions?.contactDetails?.socials
                ? savedOptions?.contactDetails?.socials.map((social: any) => ({
                    icon: updatedIcons?.find(
                      (icon) => icon?.value === social?.icon,
                    ),
                    url: social?.url,
                  }))
                : [],
            },
            // Ensure operating_hours is mapped correctly
            operating_hours: {
              ...savedOptions?.operating_hours,
              schedule: savedOptions?.operating_hours?.schedule?.length
                ? savedOptions.operating_hours.schedule
                : [],
            },
          },
          { keepValues: false },
        );
      },
    });
  }
  return (
    <form onSubmit={handleSubmit(onSubmit as any)}>
      {/* Business Settings Section */}
      <div className="flex flex-wrap pb-8 my-5 border-b border-gray-300 border-dashed sm:mt-8 sm:mb-3">
        <Description
          title={t('form:form-title-business-info')}
          details={t('form:form-description-business-info')}
          className="w-full px-0 pb-5 sm:w-4/12 sm:py-8 sm:pe-4 md:w-1/3 md:pe-5"
        />

        <Card className="w-full sm:w-8/12 md:w-2/3">
          <Input
            label={t('form:form-input-label-business-name')}
            {...register('siteTitle')}
            variant="outline"
            className="mb-5"
            toolTipText={t('form:form-input-tip-business-name')}
          />
          <TextArea
            label={t('form:form-input-label-business-description')}
            {...register('siteSubtitle')}
            variant="outline"
            className="mb-5"
            toolTipText={t('form:form-input-tip-business-description')}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-5">
            <SelectInput
              name="timezone"
              control={control}
              getOptionLabel={(option: any) => option.name}
              getOptionValue={(option: any) => option.value}
              options={[
                {
                  name: 'Eastern Time (US & Canada)',
                  value: 'America/New_York',
                },
                {
                  name: 'Central Time (US & Canada)',
                  value: 'America/Chicago',
                },
                {
                  name: 'Mountain Time (US & Canada)',
                  value: 'America/Denver',
                },
                {
                  name: 'Pacific Time (US & Canada)',
                  value: 'America/Los_Angeles',
                },
                { name: 'Alaska', value: 'America/Anchorage' },
                { name: 'Hawaii', value: 'Pacific/Honolulu' },
                { name: 'London', value: 'Europe/London' },
                { name: 'Paris', value: 'Europe/Paris' },
                { name: 'Berlin', value: 'Europe/Berlin' },
                { name: 'Tokyo', value: 'Asia/Tokyo' },
                { name: 'Dubai', value: 'Asia/Dubai' },
                { name: 'Sydney', value: 'Australia/Sydney' },
              ]}
              label={t('form:form-input-label-timezone')}
              toolTipText={t('form:form-input-tip-timezone')}
            />
            <SelectInput
              name="currency"
              control={control}
              getOptionLabel={(option: any) =>
                `${option.name} (${option.symbol})`
              }
              getOptionValue={(option: any) => option.code}
              options={CURRENCY}
              label={t('form:form-input-label-currency')}
              toolTipText={t('form:form-input-tip-currency')}
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <SelectInput
              name="currencyOptions.formation"
              control={control}
              getOptionLabel={(option: any) =>
                `${option.name} (${option.code})`
              }
              getOptionValue={(option: any) => option.code}
              options={CURRENCY_FORMATS}
              label={t('form:form-input-label-currency-format')}
            />
            <Input
              label={t('form:form-input-label-decimal-places')}
              {...register('currencyOptions.fractions')}
              type="number"
              variant="outline"
            />
          </div>

          <Input
            label={t('form:form-input-label-minimum-order-amount')}
            {...register('minimumOrderAmount')}
            type="number"
            error={t(errors.minimumOrderAmount?.message!)}
            variant="outline"
            className="mb-5 mt-5"
          />
        </Card>
      </div>

      {/* Branding Section */}
      {/* <div className="flex flex-wrap pb-8 my-5 border-b border-gray-300 border-dashed sm:mt-8 sm:mb-3">
        <Description
          title={t('form:form-title-branding')}
          details={t('form:form-description-branding')}
          className="w-full px-0 pb-5 sm:w-4/12 sm:py-8 sm:pe-4 md:w-1/3 md:pe-5"
        />

        <Card className="w-full sm:w-8/12 md:w-2/3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-5">
            <Input
              label={t('form:input-label-primary-color')}
              {...register('primary_color')}
              variant="outline"
              type="color"
              className="h-14"
            />
            <Input
              label={t('form:input-label-secondary-color')}
              {...register('secondary_color')}
              variant="outline"
              type="color"
              className="h-14"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-5 border-t border-gray-100 pt-5">
            <Input
              label={t('form:input-label-header-bg-color')}
              {...register('header_bg_color')}
              variant="outline"
              type="color"
              className="h-14"
            />
            <Input
              label={t('form:input-label-header-text-color')}
              {...register('header_text_color')}
              variant="outline"
              type="color"
              className="h-14"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-5 border-t border-gray-100 pt-5">
            <Input
              label={t('form:input-label-footer-bg-color')}
              {...register('footer_bg_color')}
              variant="outline"
              type="color"
              className="h-14"
            />
            <Input
              label={t('form:input-label-footer-text-color')}
              {...register('footer_text_color')}
              variant="outline"
              type="color"
              className="h-14"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 border-t border-gray-100 pt-5">
            <Input
              label={t('form:input-label-shadow-color')}
              {...register('shadow_color')}
              variant="outline"
              type="color"
              className="h-14"
            />
            <Input
              label={t('form:input-label-gradient-start')}
              {...register('gradient_start')}
              variant="outline"
              type="color"
              className="h-14"
            />
            <Input
              label={t('form:input-label-gradient-end')}
              {...register('gradient_end')}
              variant="outline"
              type="color"
              className="h-14"
            />
          </div>
        </Card>
      </div> */}

      <div className="flex flex-wrap pb-8 my-5 border-b border-gray-300 border-dashed sm:mt-8 sm:mb-3">
        <Description
          title={t('form:form-title-fees-taxes')}
          details={t('form:form-description-fees-taxes')}
          className="w-full px-0 pb-5 sm:w-4/12 sm:py-8 sm:pe-4 md:w-1/3 md:pe-5"
        />

        <Card className="w-full sm:w-8/12 md:w-2/3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-5">
            <Input
              label={t('form:form-input-label-service-fee')}
              toolTipText={t('form:form-input-tip-service-fee')}
              {...register('fees.service_fee')}
              type="number"
              variant="outline"
              error={t(errors.fees?.service_fee?.message!)}
            />
            <Input
              label={t('form:form-input-label-tip-options')}
              toolTipText={t('form:form-input-tip-tip-options')}
              {...register('fees.tip_options')}
              variant="outline"
              placeholder="10, 15, 20"
            />
          </div>
          <Input
            label={t('form:form-input-label-sales-tax')}
            toolTipText={t('form:form-input-tip-sales-tax')}
            {...register('taxes.sales_tax')}
            type="number"
            variant="outline"
            className="mb-5"
            error={t(errors.taxes?.sales_tax?.message!)}
          />
        </Card>
      </div>

      <div className="flex flex-wrap pb-8 my-5 border-b border-gray-300 border-dashed sm:mt-8 sm:mb-3">
        <Description
          title={t('form:form-title-delivery-details')}
          details={t('form:form-description-delivery-details')}
          className="w-full px-0 pb-5 sm:w-4/12 sm:py-8 sm:pe-4 md:w-1/3 md:pe-5"
        />

        <Card className="w-full sm:w-8/12 md:w-2/3">
          <div className="mt-6 mb-5">
            <SwitchInput
              name="delivery.enabled"
              control={control}
              label={t('form:form-input-label-enable-delivery')}
              toolTipText={t('form:form-input-tip-enable-delivery')}
            />
          </div>

          <div className="mt-8">
            <Label className="mb-5 underline decoration-dashed uppercase text-sm font-bold text-gray-400">
              {t('form:form-title-delivery-zones')}
            </Label>

            <div className="space-y-4">
              {zoneFields.map((item, index) => (
                <div
                  key={item.id}
                  className="grid grid-cols-1 sm:grid-cols-4 gap-4 items-end bg-gray-50 p-4 rounded-xl border border-gray-100"
                >
                  <Input
                    label={t('form:form-label-radius')}
                    {...register(`delivery.zones.${index}.radius` as const)}
                    type="number"
                    variant="outline"
                    error={t(errors.delivery?.zones?.[index]?.radius?.message!)}
                  />
                  <Input
                    label={t('form:form-label-fee')}
                    {...register(`delivery.zones.${index}.fee` as const)}
                    type="number"
                    variant="outline"
                    error={t(errors.delivery?.zones?.[index]?.fee?.message!)}
                  />
                  <Input
                    label={t('form:form-label-min-order')}
                    {...register(`delivery.zones.${index}.min_order` as const)}
                    type="number"
                    variant="outline"
                    error={t(
                      errors.delivery?.zones?.[index]?.min_order?.message!,
                    )}
                  />
                  <Button
                    type="button"
                    onClick={() => removeZone(index)}
                    variant="outline"
                    className="text-red-500 hover:text-red-700 hover:bg-red-50 border-red-200"
                  >
                    {t('common:button-label-remove')}
                  </Button>
                </div>
              ))}
            </div>

            <Button
              type="button"
              onClick={() => appendZone({ radius: 0, fee: 0, min_order: 0 })}
              className="mt-4 bg-gray-100 text-gray-700 hover:bg-gray-200"
              variant="outline"
            >
              + {t('form:button-label-add-delivery-zone')}
            </Button>
          </div>
        </Card>
      </div>

      <div className="flex flex-wrap pb-8 my-5 border-b border-gray-300 border-dashed sm:mt-8 sm:mb-3">
        <Description
          title={t('form:form-title-order-settings')}
          details={t('form:form-description-order-settings')}
          className="w-full px-0 pb-5 sm:w-4/12 sm:py-8 sm:pe-4 md:w-1/3 md:pe-5"
        />

        <Card className="w-full sm:w-8/12 md:w-2/3">
          <div className="mt-6 mb-5">
            <SwitchInput
              name="orders.allowScheduleOrder"
              control={control}
              label={t('form:form-input-label-allow-schedule-order')}
              toolTipText={t('form:form-input-tip-allow-schedule-order')}
            />
          </div>
          {allowScheduleOrder && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <Input
                label={t('form:form-input-label-max-days')}
                toolTipText={t('form:form-input-tip-max-days')}
                {...register('orders.maxDays')}
                type="number"
                variant="outline"
                className="my-5"
                error={t(errors.orders?.maxDays?.message!)}
              />
              <Input
                label={t('form:form-input-label-notification-time')}
                toolTipText={t('form:form-input-tip-notification-time')}
                {...register('orders.deliveredOrderTime')}
                type="number"
                variant="outline"
                className="my-5"
                error={t(errors.orders?.deliveredOrderTime?.message!)}
              />
            </div>
          )}

          <div className="mt-8 border-t border-gray-100 pt-8">
            <Label className="mb-5 underline decoration-dashed uppercase text-sm font-bold text-gray-400">
              {t('form:form-title-auto-order-management')}
            </Label>

            <div className="mt-6 mb-5">
              <SwitchInput
                name="orders.auto_accept_orders"
                control={control}
                label={t('form:form-input-label-auto-accept-orders')}
                toolTipText={t('form:form-input-tip-auto-accept-orders')}
              />
            </div>

            {watch('orders.auto_accept_orders') && (
              <div className="space-y-5 mb-8">
                <SelectInput
                  name="orders.auto_accept_order_types"
                  control={control}
                  getOptionLabel={(option: any) => option.label}
                  getOptionValue={(option: any) => option.value}
                  options={[
                    { label: t('form:text-pickup'), value: 'pickup' },
                    { label: t('form:text-delivery'), value: 'delivery' },
                  ]}
                  isMulti
                  label={t('form:form-input-label-auto-accept-types')}
                  toolTipText={t('form:form-input-tip-auto-accept-types')}
                />
                <Input
                  label={t('form:input-label-pickup-ready-time')}
                  toolTipText={t('form:input-helper-pickup-ready-time')}
                  {...register('orders.auto_accept_ready_time_pickup')}
                  type="number"
                  variant="outline"
                  error={t(errors.orders?.auto_accept_ready_time_pickup?.message!)}
                />
                <Input
                  label={t('form:input-label-delivery-ready-time')}
                  toolTipText={t('form:input-helper-delivery-ready-time')}
                  {...register('orders.auto_accept_ready_time_delivery')}
                  type="number"
                  variant="outline"
                  error={t(errors.orders?.auto_accept_ready_time_delivery?.message!)}
                />
              </div>
            )}

            <div className="mt-8 pt-8 border-t border-gray-50">
              <p className="text-sm text-gray-500 italic">
                {t('form:info-auto-complete-description')}
              </p>
            </div>
          </div>
        </Card>
      </div>

      <div className="flex flex-wrap pb-8 my-5 border-b border-gray-300 border-dashed sm:mt-8 sm:mb-3">
        <Description
          title={t('form:form-title-operating-hours')}
          details={t('form:form-description-operating-hours')}
          className="w-full px-0 pb-5 sm:w-4/12 sm:py-8 sm:pe-4 md:w-1/3 md:pe-5"
        />

        <Card className="w-full sm:w-8/12 md:w-2/3">
          <div className="mt-6 mb-8">
            <SwitchInput
              name="operating_hours.auto_close"
              control={control}
              label={t('form:form-input-label-auto-close')}
              toolTipText={t('form:form-input-tip-auto-close')}
            />
          </div>

          <Label className="mb-5 underline decoration-dashed uppercase text-sm font-bold text-gray-400">
            {t('form:form-title-weekly-schedule')}
          </Label>
          <div className="space-y-4">
            <div className="hidden md:grid grid-cols-4 gap-4 mb-2 text-xs font-bold text-gray-500 uppercase">
              <div>{t('form:text-open')}</div>
              <div>{t('form:text-close')}</div>
              <div className="text-center">{t('form:text-closed')}</div>
            </div>
            {scheduleFields.map((item: any, index: number) => (
              <div
                key={item.id}
                className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center border-b border-gray-100 pb-4 last:border-0"
              >
                <div className="font-semibold text-sm text-heading capitalize">
                  {t(item.day)}
                  <input
                    type="hidden"
                    {...register(`operating_hours.schedule.${index}.day`)}
                  />
                </div>
                <Input
                  {...register(`operating_hours.schedule.${index}.open_time`)}
                  type="time"
                  variant="outline"
                  disabled={watch(
                    `operating_hours.schedule.${index}.is_closed`,
                  )}
                />
                <Input
                  {...register(`operating_hours.schedule.${index}.close_time`)}
                  type="time"
                  variant="outline"
                  disabled={watch(
                    `operating_hours.schedule.${index}.is_closed`,
                  )}
                />
                <div className="flex justify-start md:justify-center">
                  <SwitchInput
                    name={`operating_hours.schedule.${index}.is_closed`}
                    control={control}
                    label={t('form:text-closed')}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="flex flex-wrap pb-8 my-5 border-b border-gray-300 border-dashed sm:mt-8 sm:mb-3">
        <Description
          title={t('form:shop-settings')}
          details={t('form:shop-settings-helper-text')}
          className="w-full px-0 pb-5 sm:w-4/12 sm:py-8 sm:pe-4 md:w-1/3 md:pe-5"
        />

        <Card className="w-full sm:w-8/12 md:w-2/3">
          <div className="mt-6 mb-5">
            <SwitchInput
              name="isProductReview"
              control={control}
              label={t('form:input-label-product-for-review')}
              toolTipText={t('form:input-tooltip-shop-product-review')}
              // disabled={isNotDefaultSettingsPage}
            />
          </div>

          <div className="mt-6 mb-5">
            <SwitchInput
              name="enableCoupons"
              control={control}
              label={t('form:input-label-coupons-vendors')}
              toolTipText={t('form:input-tooltip-shop-enable-coupons')}
            />
          </div>
          <div className="mt-6 mb-5">
            <SwitchInput
              name="enableReviewPopup"
              control={control}
              label={t('form:text-enable-review-popup')}
              toolTipText={t('form:input-tooltip-enable-review-popup')}
            />
          </div>
          <div className="mb-5 mt-6">
            <SelectInput
              name="reviewSystem"
              control={control}
              defaultValue={options?.reviewSystem}
              getOptionLabel={(option: any) => option.name}
              getOptionValue={(option: any) => option.value}
              options={[
                {
                  name: t('form:text-conventional-review-system'),
                  value: 'review_single_time',
                },
                {
                  name: t('form:text-order-basis-review-system'),
                  value: 'review_multiple_time',
                },
              ]}
              label={t('form:text-review-system')}
              toolTipText={t('form:input-tooltip-review-system')}
            />
          </div>
          <div className="mt-6 mb-5">
            <div className="flex items-center gap-x-4">
              <SwitchInput
                name="enableEmailForDigitalProduct"
                control={control}
              />
              <Label className="!mb-0.5">
                Send email to purchased customer of any digital product, when
                that digital product get update.
              </Label>
            </div>
          </div>
        </Card>
      </div>

      <StickyFooterPanel className="z-0">
        <Button
          loading={loading}
          disabled={loading}
          className="text-sm md:text-base"
        >
          <SaveIcon className="relative w-6 h-6 top-px shrink-0 ltr:mr-2 rtl:pl-2" />
          {t('form:button-label-save-settings')}
        </Button>
      </StickyFooterPanel>
    </form>
  );
}

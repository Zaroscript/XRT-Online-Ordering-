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
import { ContactDetailsInput, Settings, UserAddress } from '@/types';
import { useConfirmRedirectIfDirty } from '@/utils/confirmed-redirect-if-dirty';
import { formatAddress } from '@/utils/format-address';
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
  timezone?: any;
  currency?: string;
  currencyOptions?: {
    formation?: string;
    fractions?: number;
  };
  // Shop Settings
  isProductReview?: boolean;
  enableTerms?: boolean;
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
  };
  delivery?: {
    enabled?: boolean;
    radius: number;
    fee: number;
    min_order: number;
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
  // Company Information fields
  siteLink?: string;
  copyrightText?: string;
  footer_text?: string;
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
    formState: { errors, isDirty },
  } = useForm<ShopFormValues>({
    shouldUnregister: true,
    // @ts-ignore
    resolver: yupResolver(shopValidationSchema),
    defaultValues: {
      ...options,
      // Business Information defaults
      siteTitle: options?.siteTitle ?? '',
      siteSubtitle: options?.siteSubtitle ?? '',
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
      },
      delivery: {
        enabled: options?.delivery?.enabled ?? false,
        radius: options?.delivery?.radius ?? options?.maxShopDistance ?? 0,
        fee: options?.delivery?.fee ?? 0,
        min_order: options?.delivery?.min_order ?? 0,
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
      // Company Information defaults
      siteLink: options?.siteLink ?? '',
      copyrightText: options?.copyrightText ?? 'Powered by XRT',
      footer_text: options?.footer_text ?? '',
    },
  });

  const { fields: scheduleFields } = useFieldArray({
    control,
    name: 'operating_hours.schedule',
  });

  const useGoogleMap = watch('useGoogleMap');
  const allowScheduleOrder = watch('orders.allowScheduleOrder');

  async function onSubmit(values: ShopFormValues) {
    const {
      contactDetails: { location, contact, website, emailAddress },
      // ... rest of destructuring
    } = values;

    // Process contactDetails with location formatting
    const contactDetails = {
      ...values?.contactDetails,
      location: {
        ...values?.contactDetails?.location,
        formattedAddress: formatAddress(
          values?.contactDetails?.location as UserAddress,
        ),
      },
      socials: values?.contactDetails?.socials
        ? values?.contactDetails?.socials.map((social: any) => ({
            icon: social?.icon?.value ?? social?.icon,
            url: social?.url,
          }))
        : [],
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
            (values?.currencyOptions?.formation as { code?: string } | undefined)
              ?.code ?? values?.currencyOptions?.formation,
        },
        contactDetails,
        maxShopDistance: Number(
          values.maxShopDistance || values?.delivery?.radius || 0,
        ),
        useGoogleMap: false,
        delivery: {
          ...values?.delivery,
          radius: Number(values?.delivery?.radius ?? 0),
          fee: Number(values?.delivery?.fee ?? 0),
          min_order: Number(values?.delivery?.min_order ?? 0),
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
        enableTerms: values?.enableTerms,
        enableCoupons: values?.enableCoupons,
        isProductReview: values?.isProductReview,
        enableEmailForDigitalProduct: values?.enableEmailForDigitalProduct,
        reviewSystem: values?.reviewSystem?.value ?? values?.reviewSystem,
        orders: {
          ...options?.orders,
          allowScheduleOrder: values?.orders?.allowScheduleOrder,
          maxDays: Number(values?.orders?.maxDays ?? 0),
          deliveredOrderTime: Number(values?.orders?.deliveredOrderTime ?? 0),
        },
        footer_text: values?.footer_text,
        copyrightText: values?.copyrightText,
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
  useConfirmRedirectIfDirty({ isDirty });
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
        </Card>
      </div>
      {/* Company Address Section */}
      <div className="flex flex-wrap pb-8 my-5 border-b border-gray-300 border-dashed sm:mt-8 sm:mb-3">
        <Description
          title={t('form:footer-address')}
          details={t('form:footer-address-helper-text')}
          className="w-full px-0 pb-5 sm:w-4/12 sm:py-8 sm:pe-4 md:w-1/3 md:pe-5"
        />

        <Card className="w-full sm:w-8/12 md:w-2/3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
            <Input
              label={t('text-city')}
              toolTipText={t('City where your business is located')}
              {...register('contactDetails.location.city')}
              variant="outline"
            />
            <Input
              label={t('text-country')}
              toolTipText={t('Country where your business operates')}
              {...register('contactDetails.location.country')}
              variant="outline"
            />
            <Input
              label={t('text-state')}
              toolTipText={t('State or province of your business')}
              {...register('contactDetails.location.state')}
              variant="outline"
            />
            <Input
              label={t('text-zip')}
              toolTipText={t('Postal or ZIP code')}
              {...register('contactDetails.location.zip')}
              variant="outline"
            />
            <TextArea
              label={t('text-street-address')}
              toolTipText={t('Full street address of your business')}
              {...register('contactDetails.location.street_address')}
              variant="outline"
              className="col-span-full"
            />
          </div>
          <PhoneNumberInput
            label={t('form:form-input-label-contact')}
            toolTipText={t('form:form-input-tip-contact')}
            name="contactDetails.contact"
            control={control}
          />
          <Input
            label={t('form:form-input-label-website')}
            toolTipText={t('form:form-input-tip-website')}
            {...register('contactDetails.website')}
            variant="outline"
            className="mb-5"
          />
          <Input
            label={t('form:form-input-label-email')}
            toolTipText={t('form:form-input-tip-email')}
            {...register('contactDetails.emailAddress')}
            variant="outline"
            className="mb-5"
          />
        </Card>
      </div>

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
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-5">
            <Input
              label={t('form:form-input-label-delivery-radius')}
              {...register('delivery.radius')}
              type="number"
              variant="outline"
              error={t(errors.delivery?.radius?.message!)}
            />
            <Input
              label={t('form:form-input-label-delivery-fee')}
              toolTipText={t('form:form-input-tip-delivery-fee')}
              {...register('delivery.fee')}
              type="number"
              variant="outline"
              error={t(errors.delivery?.fee?.message!)}
            />
            <Input
              label={t('form:form-input-label-min-order')}
              toolTipText={t('form:form-input-tip-min-order')}
              {...register('delivery.min_order')}
              type="number"
              variant="outline"
              error={t(errors.delivery?.min_order?.message!)}
            />
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
              <div>Open</div>
              <div>Close</div>
              <div className="text-center">Closed</div>
            </div>
            {scheduleFields.map((item: any, index: number) => (
              <div
                key={item.id}
                className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center border-b border-gray-100 pb-4 last:border-0"
              >
                <div className="font-semibold text-sm text-heading lowercase capitalize">
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
                    label={t('Closed')}
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
              name="enableTerms"
              control={control}
              label={t('form:input-label-terms-conditions-vendors')}
              toolTipText={t('form:input-tooltip-shop-enable-terms')}
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

      {/* Footer Information Section */}
      <div className="flex flex-wrap pb-8 my-5 border-b border-gray-300 border-dashed sm:mt-8 sm:mb-3">
        <Description
          title={t('form:form-title-footer-information')}
          details={t('form:site-info-footer-description')}
          className="w-full px-0 pb-5 sm:w-4/12 sm:py-8 sm:pe-4 md:w-1/3 md:pe-5"
        />

        <Card className="w-full sm:w-8/12 md:w-2/3">
          <TextArea
            label={t('Footer Description')}
            toolTipText={t(
              'Text displayed as a description in the website footer',
            )}
            {...register('footer_text')}
            variant="outline"
            className="mb-5"
          />
          <Input
            label={t('form:input-label-site-link')}
            toolTipText={t('form:input-tooltip-site-link')}
            {...register('siteLink')}
            variant="outline"
            className="mb-5"
          />
          <Input
            label={t('Copyright Text')}
            toolTipText={t('Copyright notice displayed in footer')}
            {...register('copyrightText')}
            variant="outline"
            className="mb-5"
          />
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

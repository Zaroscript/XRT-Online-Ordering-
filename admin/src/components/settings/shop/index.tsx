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
  siteSubtitle: string;
  timezone: string;
  currency: string;
  currencyOptions: {
    formation: string;
    fractions: number;
  };
  // Shop Settings
  isProductReview: boolean;
  enableTerms: boolean;
  enableCoupons: boolean;
  enableEmailForDigitalProduct: boolean;
  useGoogleMap: boolean;
  enableReviewPopup: boolean;
  maxShopDistance: number;
  contactDetails: ContactDetailsInput;
  google: {
    isEnable: boolean;
    tagManagerId: string;
  };
  facebook: {
    isEnable: boolean;
    appId: string;
    pageId: string;
  };
  reviewSystem: string;
  orders: {
    accept_orders: boolean;
    allowScheduleOrder: boolean;
    maxDays: number;
    deliveredOrderTime: number;
  };
  delivery: {
    enabled: boolean;
    radius: number;
    fee: number;
    min_order: number;
  };
  fees: {
    service_fee: number;
    tip_options: number[];
  };
  taxes: {
    sales_tax: number;
  };
  operating_hours: {
    auto_close: boolean;
    schedule: {
      day: string;
      open_time: string;
      close_time: string;
      is_closed: boolean;
    }[];
  };
  // Company Information fields
  siteLink: string;
  copyrightText: string;
  externalText: string;
  externalLink: string;
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
  const { mutate: updateSettingsMutation, isLoading: loading } =
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
    //@ts-ignore
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
      copyrightText: options?.copyrightText ?? '',
      externalText: options?.externalText ?? '',
      externalLink: options?.externalLink ?? '',
    },
  });

  const {
    fields: scheduleFields,
  } = useFieldArray({
    control,
    name: 'operating_hours.schedule',
  });

  const useGoogleMap = watch('useGoogleMap');
  const allowScheduleOrder = watch('orders.allowScheduleOrder');

  async function onSubmit(values: ShopFormValues) {
    // Process contactDetails with location formatting
    const contactDetails = {
      ...values?.contactDetails,
      location: useGoogleMap
        ? { ...omit(values?.contactDetails?.location, '__typename') }
        : {
          ...values?.contactDetails?.location,
          formattedAddress: formatAddress(
            values?.contactDetails?.location as UserAddress,
          ),
        },
      socials: options?.contactDetails?.socials,
    };

    updateSettingsMutation({
      language: locale,
      // @ts-ignore
      options: {
        ...options,
        ...values,
        contactDetails,
        maxShopDistance: Number(values.maxShopDistance || values?.delivery?.radius),
        useGoogleMap: values?.useGoogleMap,
        delivery: {
          ...values?.delivery,
          radius: Number(values?.delivery?.radius),
          fee: Number(values?.delivery?.fee),
          min_order: Number(values?.delivery?.min_order),
        },
        fees: {
          ...values?.fees,
          service_fee: Number(values?.fees?.service_fee),
          tip_options: values?.fees?.tip_options?.map((t: number) => Number(t)) ?? [],
        },
        taxes: {
          ...values?.taxes,
          sales_tax: Number(values?.taxes?.sales_tax),
        },
        operating_hours: {
          ...values?.operating_hours,
        },
        enableTerms: values?.enableTerms,
        enableCoupons: values?.enableCoupons,
        isProductReview: values?.isProductReview,
        enableEmailForDigitalProduct: values?.enableEmailForDigitalProduct,
        reviewSystem: values?.reviewSystem,
        orders: {
          ...options?.orders,
          ...values?.orders,
          maxDays: Number(values?.orders?.maxDays),
          deliveredOrderTime: Number(values?.orders?.deliveredOrderTime),
        },
      },
    });
    reset(values, { keepValues: true });
  }
  useConfirmRedirectIfDirty({ isDirty });
  return (
    <form onSubmit={handleSubmit(onSubmit as any)}>
      {/* Business Settings Section */}
      <div className="flex flex-wrap pb-8 my-5 border-b border-gray-300 border-dashed sm:mt-8 sm:mb-3">
        <Description
          title={t('Business Info')}
          details={t('Configure your business information and branding')}
          className="w-full px-0 pb-5 sm:w-4/12 sm:py-8 sm:pe-4 md:w-1/3 md:pe-5"
        />

        <Card className="w-full sm:w-8/12 md:w-2/3">
          <Input
            label={t('Business Name')}
            {...register('siteTitle')}
            variant="outline"
            className="mb-5"
            toolTipText={t('Your business name displayed on the storefront')}
          />
          <TextArea
            label={t('Business Description')}
            {...register('siteSubtitle')}
            variant="outline"
            className="mb-5"
            toolTipText={t('A brief description of your business')}
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-5">
            <Input
              label={t('Timezone')}
              {...register('timezone')}
              variant="outline"

              toolTipText={t('Your business timezone for operating hours')}
            />
            <Input
              label={t('Currency')}
              {...register('currency')}
              variant="outline"

              toolTipText={t('Primary currency for pricing')}
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <Input
              label={t('Currency Format')}
              {...register('currencyOptions.formation')}
              variant="outline"

            />
            <Input
              label={t('Decimal Places')}
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
          {useGoogleMap ? (
            <div className="mb-5">
              <Label>{t('form:input-label-autocomplete')}</Label>
              <Controller
                control={control}
                name="contactDetails.location"
                render={({ field: { onChange } }) => (
                  <GooglePlacesAutocomplete
                    onChange={onChange}
                    data={getValues('contactDetails.location')!}
                  />
                )}
              />
            </div>
          ) : (
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
          )}
          <PhoneNumberInput
            label={t('form:input-label-contact')}
            toolTipText={t('Primary phone number for customer contact')}
            {...register('contactDetails.contact')}
            control={control}
          />
          <Input
            label={t('form:input-label-website')}
            toolTipText={t('Your business website URL')}
            {...register('contactDetails.website')}
            variant="outline"
            className="mb-5"
          />
          <Input
            label={t('form:input-label-email')}
            toolTipText={t('Business email for customer inquiries')}
            {...register('contactDetails.emailAddress')}
            variant="outline"
            className="mb-5"
          />
        </Card>
      </div>

      <div className="flex flex-wrap pb-8 my-5 border-b border-gray-300 border-dashed sm:mt-8 sm:mb-3">
        <Description
          title={t('Fees & Taxes')}
          details={t('Configure service fees and tax rates')}
          className="w-full px-0 pb-5 sm:w-4/12 sm:py-8 sm:pe-4 md:w-1/3 md:pe-5"
        />

        <Card className="w-full sm:w-8/12 md:w-2/3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-5">
            <Input
              label={t('Service Fee')}
              toolTipText={t('Fixed service fee added to each order')}
              {...register('fees.service_fee')}
              type="number"
              variant="outline"
              error={t(errors.fees?.service_fee?.message!)}
            />
            <Input
              label={t('Tip Options')}
              toolTipText={t('Tip percentages for customers to choose from, e.g. 10, 15, 20')}
              {...register('fees.tip_options')}
              variant="outline"
              placeholder="10, 15, 20"
            />
          </div>
          <Input
            label={t('Sales Tax')}
            toolTipText={t('Sales tax percentage applied to orders')}
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
          title={t('Delivery Details')}
          details={t('Configure delivery settings like radius, fee and minimum order')}
          className="w-full px-0 pb-5 sm:w-4/12 sm:py-8 sm:pe-4 md:w-1/3 md:pe-5"
        />

        <Card className="w-full sm:w-8/12 md:w-2/3">
          <div className="mt-6 mb-5">
            <SwitchInput
              name="delivery.enabled"
              control={control}
              label={t('Enable Delivery')}
              toolTipText={t('Enable or disable delivery service for your business')}
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <Input
              label={t('Radius (Miles)')}
              {...register('delivery.radius')}
              type="number"
              variant="outline"
              className="my-5"
              error={t(errors.delivery?.radius?.message!)}
            />
            <Input
              label={t('Delivery Fee')}
              toolTipText={t('Fee charged for delivery service')}
              {...register('delivery.fee')}
              type="number"
              variant="outline"
              className="my-5"
              error={t(errors.delivery?.fee?.message!)}
            />
          </div>
          <Input
            label={t('Minimum Order')}
            toolTipText={t('Minimum order amount required for delivery')}
            {...register('delivery.min_order')}
            type="number"
            variant="outline"
            className="mb-5"
            error={t(errors.delivery?.min_order?.message!)}
          />
        </Card>
      </div>

      <div className="flex flex-wrap pb-8 my-5 border-b border-gray-300 border-dashed sm:mt-8 sm:mb-3">
        <Description
          title={t('Order Settings')}
          details={t('Configure order related settings used in the shop')}
          className="w-full px-0 pb-5 sm:w-4/12 sm:py-8 sm:pe-4 md:w-1/3 md:pe-5"
        />

        <Card className="w-full sm:w-8/12 md:w-2/3">
          <div className="mt-6 mb-5">
            <SwitchInput
              name="orders.allowScheduleOrder"
              control={control}
              label={t('Allow Schedule Order')}
              toolTipText={t('Allow customers to schedule orders for later')}
            />
          </div>
          {allowScheduleOrder && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <Input
                label={t('Max Days')}
                toolTipText={t('Maximum days ahead customers can schedule orders')}
                {...register('orders.maxDays')}
                type="number"
                variant="outline"
                className="my-5"
                error={t(errors.orders?.maxDays?.message!)}
              />
              <Input
                label={t('Notification Time')}
                toolTipText={t('Minutes before order to receive notification')}
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
          title={t('Operating Hours')}
          details={t('Configure your shop operating hours and schedule')}
          className="w-full px-0 pb-5 sm:w-4/12 sm:py-8 sm:pe-4 md:w-1/3 md:pe-5"
        />

        <Card className="w-full sm:w-8/12 md:w-2/3">
          <div className="mt-6 mb-8">
            <SwitchInput
              name="operating_hours.auto_close"
              control={control}
              label={t('Auto Close')}
              toolTipText={t('Automatically close the shop based on schedule')}
            />
          </div>

          <Label className="mb-5 underline decoration-dashed uppercase text-sm font-bold text-gray-400">{t('Weekly Schedule')}</Label>
          <div className="space-y-4">
            <div className="hidden md:grid grid-cols-4 gap-4 mb-2 text-xs font-bold text-gray-500 uppercase">
              <div>Day</div>
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
                  <input type="hidden" {...register(`operating_hours.schedule.${index}.day`)} />
                </div>
                <Input
                  {...register(`operating_hours.schedule.${index}.open_time`)}
                  type="time"
                  variant="outline"
                  disabled={watch(`operating_hours.schedule.${index}.is_closed`)}
                />
                <Input
                  {...register(`operating_hours.schedule.${index}.close_time`)}
                  type="time"
                  variant="outline"
                  disabled={watch(`operating_hours.schedule.${index}.is_closed`)}
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
              name="useGoogleMap"
              control={control}
              label={t('form:input-label-use-google-map-service')}
              toolTipText={t('form:input-tooltip-shop-enable-google-map')}
            // disabled={isNotDefaultSettingsPage}
            />
          </div>
          {useGoogleMap ? (
            <Input
              label={t('text-max-search-location-distance')}
              {...register('maxShopDistance')}
              type="number"
              error={t(errors.maxShopDistance?.message!)}
              variant="outline"
              className="my-5"
            // disabled={isNotDefaultSettingsPage}
            />
          ) : (
            ''
          )}
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
          <Input
            label={t('Site Link')}
            toolTipText={t('URL link to your website displayed in footer')}
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
          <Input
            label={t('External Text')}
            toolTipText={t('Text for external link displayed in footer')}
            {...register('externalText')}
            variant="outline"
            className="mb-5"
          />
          <Input
            label={t('External Link')}
            toolTipText={t('External URL displayed in footer')}
            {...register('externalLink')}
            variant="outline"
            className="mb-5"
          />
        </Card>
      </div>


      <StickyFooterPanel className="z-0">
        <Button
          loading={loading}
          disabled={loading || !Boolean(isDirty)}
          className="text-sm md:text-base"
        >
          <SaveIcon className="relative w-6 h-6 top-px shrink-0 ltr:mr-2 rtl:pl-2" />
          {t('form:button-label-save-settings')}
        </Button>
      </StickyFooterPanel>
    </form>
  );
}

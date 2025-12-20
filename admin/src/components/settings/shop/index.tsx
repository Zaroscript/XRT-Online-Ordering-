import Card from '@/components/common/card';
import { SaveIcon } from '@/components/icons/save';
import * as socialIcons from '@/components/icons/social';
import { shopValidationSchema } from '@/components/settings/shop/shop-validation-schema';
import Alert from '@/components/ui/alert';
import Button from '@/components/ui/button';
import Description from '@/components/ui/description';
import Input from '@/components/ui/input';
import Label from '@/components/ui/label';
import StickyFooterPanel from '@/components/ui/sticky-footer-panel';
import SwitchInput from '@/components/ui/switch-input';
import TextArea from '@/components/ui/text-area';
import TooltipLabel from '@/components/ui/tooltip-label';
import { useUpdateSettingsMutation } from '@/data/settings';
import { socialIcon } from '@/settings/site.settings';
import { ContactDetailsInput, Settings } from '@/types';
import { useConfirmRedirectIfDirty } from '@/utils/confirmed-redirect-if-dirty';
import { getIcon } from '@/utils/get-icon';
import { yupResolver } from '@hookform/resolvers/yup';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
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
  isProductReview: boolean;
  enableTerms: boolean;
  enableCoupons: boolean;
  enableEmailForDigitalProduct: boolean;
  useGoogleMap: boolean;
  enableReviewPopup: boolean;
  maxShopDistance: number;
  contactDetails: ContactDetailsInput;
  deliveryTime: {
    title: string;
    description: string;
  }[];
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
    tip: number;
    tip_type: string;
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
    formState: { errors, isDirty },
  } = useForm<ShopFormValues>({
    shouldUnregister: true,
    //@ts-ignore
    resolver: yupResolver(shopValidationSchema),
    defaultValues: {
      ...options,
      contactDetails: {
        ...options?.contactDetails,
        socials: options?.contactDetails?.socials
          ? options?.contactDetails?.socials.map((social: any) => ({
            icon: updatedIcons?.find((icon) => icon?.value === social?.icon),
            url: social?.url,
          }))
          : [],
      },
      deliveryTime: options?.deliveryTime ? options?.deliveryTime : [],
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
        tip: options?.fees?.tip ?? 0,
        tip_type: options?.fees?.tip_type ?? 'percentage',
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
    },
  });

  const {
    fields: scheduleFields,
  } = useFieldArray({
    control,
    name: 'operating_hours.schedule',
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'deliveryTime',
  });


  const useGoogleMap = watch('useGoogleMap');
  const allowScheduleOrder = watch('orders.allowScheduleOrder');

  async function onSubmit(values: ShopFormValues) {
    updateSettingsMutation({
      language: locale,
      // @ts-ignore
      options: {
        ...values,
        ...options,
        deliveryTime: values?.deliveryTime,
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
          tip: Number(values?.fees?.tip),
          tip_type: values?.fees?.tip_type,
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
      <div className="flex flex-wrap pb-8 my-5 border-b border-gray-300 border-dashed sm:my-8">
        <Description
          title={t('form:text-delivery-schedule')}
          details={t('form:delivery-schedule-help-text')}
          className="w-full px-0 pb-5 sm:w-4/12 sm:py-8 sm:pr-4 md:w-1/3 md:pr-5"
        />

        <Card className="w-full sm:w-8/12 md:w-2/3">
          <div>
            {fields.map((item: any & { id: string }, index: number) => (
              <div
                className="py-5 border-b border-dashed border-border-200 first:pt-0 last:border-0 md:py-8"
                key={item.id}
              >
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-5">
                  <div className="grid grid-cols-1 gap-5 sm:col-span-4">
                    <Input
                      label={t('form:input-delivery-time-title')}
                      toolTipText={t('form:input-tooltip-shop-title')}
                      variant="outline"
                      {...register(`deliveryTime.${index}.title` as const)}
                      defaultValue={item?.title!} // make sure to set up defaultValue
                      error={t(errors?.deliveryTime?.[index]?.title?.message)}
                    />
                    <TextArea
                      label={t('form:input-delivery-time-description')}
                      toolTipText={t('form:input-tooltip-shop-description')}
                      variant="outline"
                      {...register(
                        `deliveryTime.${index}.description` as const,
                      )}
                      defaultValue={item.description!} // make sure to set up defaultValue
                    />
                  </div>

                  <button
                    onClick={() => {
                      remove(index);
                    }}
                    type="button"
                    className="text-sm text-red-500 transition-colors duration-200 hover:text-red-700 focus:outline-none sm:col-span-1 sm:mt-4"
                  >
                    {t('form:button-label-remove')}
                  </button>
                </div>
              </div>
            ))}
          </div>
          <Button
            type="button"
            onClick={() => append({ title: '', description: '' })}
            className="w-full sm:w-auto"
          >
            {t('form:button-label-add-delivery-time')}
          </Button>

          {errors?.deliveryTime?.message ? (
            <Alert
              message={t(errors?.deliveryTime?.message)}
              variant="error"
              className="mt-5"
            />
          ) : null}
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
            />
          </div>
          <div className="grid grid-cols-2 gap-5">
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
              {...register('delivery.fee')}
              type="number"
              variant="outline"
              className="my-5"
              error={t(errors.delivery?.fee?.message!)}
            />
          </div>
          <Input
            label={t('Minimum Order Amount')}
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
          title={t('Fees & Taxes')}
          details={t('Configure service fees and tax rates')}
          className="w-full px-0 pb-5 sm:w-4/12 sm:py-8 sm:pe-4 md:w-1/3 md:pe-5"
        />

        <Card className="w-full sm:w-8/12 md:w-2/3">
          <div className="grid grid-cols-2 gap-5 mb-5">
            <Input
              label={t('Service Fee')}
              {...register('fees.service_fee')}
              type="number"
              variant="outline"
              error={t(errors.fees?.service_fee?.message!)}
            />
            <SelectInput
              name="fees.tip_type"
              control={control}
              getOptionLabel={(option: any) => option.name}
              getOptionValue={(option: any) => option.value}
              options={[
                { name: t('Fixed'), value: 'fixed' },
                { name: t('Percentage'), value: 'percentage' },
              ]}
              label={t('Tip Type')}
              error={t(errors.fees?.tip_type?.message!)}
            />
          </div>
          <Input
            label={t('Default Tip')}
            {...register('fees.tip')}
            type="number"
            variant="outline"
            className="mb-5"
            error={t(errors.fees?.tip?.message!)}
          />
          <Input
            label={t('Sales Tax (%)')}
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
            <div className="grid grid-cols-2 gap-5">
              <Input
                label={t('Max Days')}
                {...register('orders.maxDays')}
                type="number"
                variant="outline"
                className="my-5"
                error={t(errors.orders?.maxDays?.message!)}
              />
              <Input
                label={t('Delivered Order Time (Minutes)')}
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

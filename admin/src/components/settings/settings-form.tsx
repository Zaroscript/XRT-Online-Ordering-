import Card from '@/components/common/card';
import GooglePlacesAutocomplete from '@/components/form/google-places-autocomplete';
import * as socialIcons from '@/components/icons/social';
import OpenAIButton from '@/components/openAI/openAI.button';
import DatePicker from '@/components/ui/date-picker';
import { addDays, addMinutes, isSameDay, isToday } from 'date-fns';
import { AI } from '@/components/settings/ai';
import { COUNTRY_LOCALE } from '@/components/settings/payment/country-locale';
import { CURRENCY } from '@/components/settings/payment/currency';
import { PAYMENT_GATEWAY } from '@/components/settings/payment/payment-gateway';
import WebHookURL from '@/components/settings/payment/webhook-url';
import { settingsValidationSchema } from '@/components/settings/settings-validation-schema';
import Alert from '@/components/ui/alert';
import Badge from '@/components/ui/badge/badge';
import Button from '@/components/ui/button';
import Description from '@/components/ui/description';
import FileInput from '@/components/ui/file-input';
import ValidationError from '@/components/ui/form-validation-error';
import Input from '@/components/ui/input';
import Label from '@/components/ui/label';
import Loader from '@/components/ui/loader/loader';
import { useModalAction } from '@/components/ui/modal/modal.context';
import PaymentSelect from '@/components/ui/payment-select';
import SelectInput from '@/components/ui/select-input';
import SwitchInput from '@/components/ui/switch-input';
import TextArea from '@/components/ui/text-area';
import { useUpdateSettingsMutation } from '@/data/settings';
import { siteSettings } from '@/settings/site.settings';
import {
  ServerInfo,
  Settings,
  Shipping,
  ShopSocialInput,
  Tax,
} from '@/types';

import { getIcon } from '@/utils/get-icon';
import { formatPrice } from '@/utils/use-price';
import { yupResolver } from '@hookform/resolvers/yup';
import { isEmpty } from 'lodash';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import { useMemo, useState } from 'react';
import { Controller, useFieldArray, useForm } from 'react-hook-form';
import { socialIcon } from '@/settings/site.settings';
import { HeroSlide } from '@/types';

type FormValues = {
  siteTitle: string;
  siteSubtitle: string;
  minimumOrderAmount: number;
  logo: any;
  useOtp: boolean;
  useAi: boolean;
  defaultAi: any;
  useMustVerifyEmail: boolean;
  freeShipping: boolean;
  freeShippingAmount: number;
  taxClass: Tax;
  shippingClass: Shipping;
  signupPoints: number;
  maximumQuestionLimit: number;
  currencyToWalletRatio: number;
  guestCheckout: boolean;
  messages: {
    closed_message: string;
    not_accepting_orders_message: string;
  };
  server_info: ServerInfo;
  footer_text: string;
  heroSlides: HeroSlide[];
};

type paymentGatewayOption = {
  name: string;
  title: string;
};

// const socialIcon = [
//   {
//     value: 'FacebookIcon',
//     label: 'Facebook',
//   },
//   {
//     value: 'InstagramIcon',
//     label: 'Instagram',
//   },
//   {
//     value: 'TwitterIcon',
//     label: 'Twitter',
//   },
//   {
//     value: 'YouTubeIcon',
//     label: 'Youtube',
//   },
// ];

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
  taxClasses: Tax[] | undefined | null;
  shippingClasses: Shipping[] | undefined | null;
};

// TODO: Split Settings
export default function SettingsForm({
  settings,
  taxClasses,
  shippingClasses,
}: IProps) {
  const { t } = useTranslation();
  const { locale } = useRouter();
  const [isCopied, setIsCopied] = useState(false);
  const today = new Date();
  const { mutate: updateSettingsMutation, isLoading: loading } =
    useUpdateSettingsMutation();
  const { language, options } = settings ?? {};
  const [serverInfo, SetSeverInfo] = useState(options?.server_info);

  const {
    register,
    handleSubmit,
    control,
    getValues,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    shouldUnregister: true,
    //@ts-ignore
    resolver: yupResolver(settingsValidationSchema),
    defaultValues: {
      ...options,
      server_info: serverInfo,

      logo: options?.logo ?? '',
      guestCheckout: options?.guestCheckout ?? true,
      defaultAi: options?.defaultAi
        ? AI.find((item) => item.value == options?.defaultAi)
        : 'openai',

      // @ts-ignore
      taxClass: !!taxClasses?.length
        ? taxClasses?.find((tax: Tax) => tax.id == options?.taxClass)
        : '',
      // @ts-ignore
      shippingClass: !!shippingClasses?.length
        ? shippingClasses?.find(
          (shipping: Shipping) => shipping.id == options?.shippingClass,
        )
        : '',
      footer_text: options?.footer_text ?? '',
      messages: {
        closed_message: options?.messages?.closed_message ?? '',
        not_accepting_orders_message: options?.messages?.not_accepting_orders_message ?? '',
      },
      maximumQuestionLimit: options?.maximumQuestionLimit ?? 0,
      heroSlides: options?.heroSlides ?? [],
    },
  });

  const {
    fields: heroSlideFields,
    append: appendHeroSlide,
    remove: removeHeroSlide,
  } = useFieldArray({
    control,
    name: 'heroSlides',
  });

  const { openModal } = useModalAction();

  const enableFreeShipping = watch('freeShipping');


  // const upload_max_filesize = options?.server_info?.upload_max_filesize! / 1024;
  const max_fileSize = options?.server_info?.upload_max_filesize! * 1000;

  const logoInformation = (
    <span>
      {t('form:logo-help-text')} <br />
      {t('form:logo-dimension-help-text')} &nbsp;
      <span className="font-bold">
        {siteSettings.logo.width}x{siteSettings.logo.height} {t('common:pixel')}
      </span>
      <br />
      {t('form:size-help-text')} &nbsp;
      <span className="font-bold">{max_fileSize} MB </span>
    </span>
  );
  // const isNotDefaultSettingsPage = Config.defaultLanguage !== locale;

  async function onSubmit(values: any) {
    updateSettingsMutation({
      language: locale,
      options: {
        ...options,
        ...values,
        server_info: serverInfo,
        signupPoints: Number(values.signupPoints),
        currencyToWalletRatio: Number(values.currencyToWalletRatio),
        minimumOrderAmount: Number(values.minimumOrderAmount),
        freeShippingAmount: Number(values.freeShippingAmount),
        guestCheckout: values?.guestCheckout,
        defaultAi: values?.defaultAi?.value,
        taxClass: values?.taxClass?.id,
        shippingClass: values?.shippingClass?.id,
        logo: values?.logo,
        footer_text: values.footer_text,
        messages: {
          closed_message: values.messages.closed_message,
          not_accepting_orders_message: values.messages.not_accepting_orders_message,
        },
      },
    });
  }



  return (
    <form onSubmit={handleSubmit(onSubmit as any)}>
      <div className="flex flex-wrap pb-8 my-5 border-b border-dashed border-border-base sm:my-8">
        <Description
          title={t('form:input-label-logo')}
          details={logoInformation}
          className="w-full px-0 pb-5 sm:w-4/12 sm:py-8 sm:pe-4 md:w-1/3 md:pe-5"
        />

        <Card className="w-full sm:w-8/12 md:w-2/3">
          <FileInput
            name="logo"
            control={control}
            multiple={false}
            maxSize={max_fileSize}
          />
        </Card>
      </div>

      {/* Hero Slider Section */}
      <div className="flex flex-wrap pb-8 my-5 border-b border-dashed border-border-base sm:my-8">
        <Description
          title={t('Hero Slider')}
          details={t('Manage homepage banner slides with images, titles, and buttons')}
          className="w-full px-0 pb-5 sm:w-4/12 sm:py-8 sm:pe-4 md:w-1/3 md:pe-5"
        />

        <Card className="w-full sm:w-8/12 md:w-2/3">
          {heroSlideFields.map((slide, index) => (
            <div
              key={slide.id}
              className="py-5 border-b border-dashed border-border-200 last:border-b-0"
            >
              <div className="flex justify-between items-center mb-4">
                <h4 className="font-semibold text-gray-700">
                  {t('Slide')} {index + 1}
                </h4>
                <button
                  type="button"
                  onClick={() => removeHeroSlide(index)}
                  className="text-sm text-red-500 hover:text-red-700"
                >
                  {t('Remove')}
                </button>
              </div>

              <div className="mb-4">
                <FileInput
                  name={`heroSlides.${index}.bgImage`}
                  control={control}
                  multiple={false}
                  label={t('Background Image')}
                  toolTipText={t('Upload background image for this slide')}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label={t('Title')}
                  toolTipText={t('Main heading for this slide')}
                  {...register(`heroSlides.${index}.title`)}
                  variant="outline"
                />
                <Input
                  label={t('Subtitle')}
                  toolTipText={t('Secondary text below the title')}
                  {...register(`heroSlides.${index}.subtitle`)}
                  variant="outline"
                />
                <Input
                  label={t('Button Text')}
                  toolTipText={t('Text displayed on the call-to-action button')}
                  {...register(`heroSlides.${index}.btnText`)}
                  variant="outline"
                />
                <Input
                  label={t('Button Link')}
                  toolTipText={t('URL the button links to')}
                  {...register(`heroSlides.${index}.btnLink`)}
                  variant="outline"
                />
              </div>
            </div>
          ))}

          <Button
            type="button"
            onClick={() =>
              appendHeroSlide({
                bgImage: undefined,
                title: '',
                subtitle: '',
                btnText: '',
                btnLink: '',
              })
            }
            className="w-full sm:w-auto mt-4"
            variant="outline"
          >
            {t('Add New Slide')}
          </Button>
        </Card>
      </div>

      <div className="flex flex-wrap pb-8 my-5 border-b border-dashed border-border-base sm:my-8">
        <Description
          title={t('form:form-title-information')}
          details={t('form:site-info-help-text')}
          className="w-full px-0 pb-5 sm:w-4/12 sm:py-8 sm:pe-4 md:w-1/3 md:pe-5"
        />

        <Card className="w-full sm:w-8/12 md:w-2/3">
          <Input
            label={t('Site Title')}
            toolTipText={t('Your business name displayed in the browser tab')}
            {...register('siteTitle')}
            error={t(errors.siteTitle?.message!)}
            variant="outline"
            className="mb-5"
          />
          <Input
            label={t('Site Subtitle')}
            toolTipText={t('A tagline or short description for your business')}
            {...register('siteSubtitle')}
            error={t(errors.siteSubtitle?.message!)}
            variant="outline"
            className="mb-5"
          />
          <Input
            label={t('Minimum Order Amount')}
            {...register('minimumOrderAmount')}
            type="number"
            error={t(errors.minimumOrderAmount?.message!)}
            variant="outline"
            className="mb-5"
          // disabled={isNotDefaultSettingsPage}
          />
          <Input
            label={t('Wallet Currency Ratio')}
            {...register('currencyToWalletRatio')}
            type="number"
            error={t(errors.currencyToWalletRatio?.message!)}
            variant="outline"
            className="mb-5"
          // disabled={isNotDefaultSettingsPage}
          />
          <Input
            label={t('Signup Points')}
            {...register('signupPoints')}
            type="number"
            error={t(errors.signupPoints?.message!)}
            variant="outline"
            className="mb-5"
          // disabled={isNotDefaultSettingsPage}
          />


          <div className="mb-5">
            <TextArea
              label={t('Footer Text')}
              toolTipText={t('Text displayed in the website footer')}
              {...register('footer_text')}
              variant="outline"
              className="mb-5"
            />
          </div>

          <div className="mb-5">
            <TextArea
              label={t('Closed Message')}
              toolTipText={t('Message displayed when your restaurant is closed')}
              {...register('messages.closed_message')}
              variant="outline"
              className="mb-5"
            />
          </div>

          <div className="mb-5">
            <TextArea
              label={t('Not Accepting Orders Message')}
              toolTipText={t('Message displayed when you are not accepting orders')}
              {...register('messages.not_accepting_orders_message')}
              variant="outline"
              className="mb-5"
            />
          </div>

          <Input
            label={t('Maximum Question Limit')}
            {...register('maximumQuestionLimit')}
            type="number"
            error={t(errors.maximumQuestionLimit?.message!)}
            variant="outline"
            className="mb-5"
          // disabled={isNotDefaultSettingsPage}
          />

          <div className="mb-5">
            <div className="flex items-center gap-x-4">
              <SwitchInput
                name="useOtp"
                label={t("Enable OTP")}
                toolTipText={t("Enable one-time password verification for login")}
                control={control}
              // disabled={isNotDefaultSettingsPage}
              />
            </div>
          </div>

          <div className="mb-5">
            <div className="flex items-center gap-x-4">
              <SwitchInput
                name="useMustVerifyEmail"
                label={t("Require Email Verification")}
                toolTipText={t("Require users to verify their email address")}
                control={control}
              // disabled={isNotDefaultSettingsPage}
              />
            </div>
          </div>

          <div className="mb-5">
            <div className="flex items-center gap-x-4">
              <SwitchInput
                name="useAi"
                label={t("Enable AI Features")}
                toolTipText={t("Enable AI-powered product description generation")}
                control={control}
              // disabled={isNotDefaultSettingsPage}
              />
            </div>
          </div>
          <div className="mb-5">
            <SelectInput
              name="defaultAi"
              label={t('Select AI Provider')}
              toolTipText={t('Choose your AI service provider for product descriptions')}
              control={control}
              getOptionLabel={(option: any) => option.name}
              getOptionValue={(option: any) => option.value}
              options={AI}
            // disabled={isNotDefaultSettingsPage}
            />
          </div>

          <div className="mb-5">
            <SelectInput
              name="taxClass"
              label={t('Tax Class')}
              toolTipText={t('Default tax class to apply to products')}
              control={control}
              getOptionLabel={(option: any) => option.name}
              getOptionValue={(option: any) => option.id}
              options={taxClasses!}
            // disabled={isNotDefaultSettingsPage}
            />
          </div>

          <div className="mb-5">
            <SelectInput
              name="shippingClass"
              label={t('Shipping Class')}
              toolTipText={t('Default shipping class for orders')}
              control={control}
              getOptionLabel={(option: any) => option.name}
              getOptionValue={(option: any) => option.id}
              options={shippingClasses!}
            // disabled={isNotDefaultSettingsPage}
            />
          </div>
          <div className="mb-5">
            <div className="flex items-center gap-x-4">
              <SwitchInput
                name="guestCheckout"
                label={t("Allow Guest Checkout")}
                toolTipText={t("Allow customers to checkout without creating an account")}
                control={control}
              // disabled={isNotDefaultSettingsPage}
              />
            </div>
          </div>

          <div className="flex items-center gap-x-4">
            <SwitchInput
              name="freeShipping"
              label={t("Enable Free Shipping")}
              toolTipText={t("Enable free shipping for orders over a certain amount")}
              control={control}
              checked={enableFreeShipping}
            // disabled={isNotDefaultSettingsPage}
            />
          </div>

          {enableFreeShipping && (
            <Input
              label={t('Free Shipping Amount')}
              toolTipText={t('Minimum order amount to qualify for free shipping')}
              {...register('freeShippingAmount')}
              error={t(errors.freeShippingAmount?.message!)}
              variant="outline"
              type="number"
              className="mt-5"
            // disabled={isNotDefaultSettingsPage}
            />
          )}
        </Card>
      </div>




      <div className="text-end">
        <Button
          loading={loading}
          disabled={loading}
          className="text-sm md:text-base"
        >
          {t('form:button-label-save-settings')}
        </Button>
      </div>
    </form >
  );
}

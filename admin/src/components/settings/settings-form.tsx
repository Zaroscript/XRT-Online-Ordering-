import Card from '@/components/common/card';
import GooglePlacesAutocomplete from '@/components/form/google-places-autocomplete';
import * as socialIcons from '@/components/icons/social';
import OpenAIButton from '@/components/openAI/openAI.button';
import Color from '@/components/ui/color';
import DatePicker from '@/components/ui/date-picker';
import Range from '@/components/ui/range';
import { addDays, addMinutes, isSameDay, isToday } from 'date-fns';
import { AI } from '@/components/settings/ai';

import {
  chatbotAutoSuggestion,
  chatbotAutoSuggestion1,
} from '@/components/settings/openAIPromptSample';
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
import { Config } from '@/config';
import { useUpdateSettingsMutation } from '@/data/settings';
import { siteSettings } from '@/settings/site.settings';
import {
  AttachmentInput,
  ContactDetailsInput,
  ItemProps,
  ServerInfo,
  SettingCurrencyOptions,
  Settings,
  Shipping,
  ShopSocialInput,
  Tax,
  PrinterSettings,
} from '@/types';

import { getIcon } from '@/utils/get-icon';
import { formatPrice } from '@/utils/use-price';
import { yupResolver } from '@hookform/resolvers/yup';
import { isEmpty, split } from 'lodash';
import omit from 'lodash/omit';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import { useCallback, useMemo, useState } from 'react';
import { Controller, useFieldArray, useForm } from 'react-hook-form';
import { socialIcon } from '@/settings/site.settings';

type FormValues = {
  siteTitle: string;
  siteSubtitle: string;
  currency: any;
  currencyOptions?: SettingCurrencyOptions;
  minimumOrderAmount: number;
  logo: any;
  useOtp: boolean;
  useAi: boolean;
  defaultAi: any;
  useGoogleMap: boolean;
  useMustVerifyEmail: boolean;
  freeShipping: boolean;
  freeShippingAmount: number;
  useCashOnDelivery: boolean;
  defaultPaymentGateway: paymentGatewayOption;
  useEnableGateway: boolean;
  paymentGateway: paymentGatewayOption[];
  taxClass: Tax;
  shippingClass: Shipping;
  signupPoints: number;
  maxShopDistance: number;
  maximumQuestionLimit: number;
  currencyToWalletRatio: number;
  contactDetails: ContactDetailsInput;
  deliveryTime: {
    title: string;
    description: string;
  }[];
  seo: {
    metaTitle: string;
    metaDescription: string;
    ogTitle: string;
    ogDescription: string;
    ogImage?: AttachmentInput;
    twitterHandle: string;
    twitterCardType: string;
    metaTags: string;
    canonicalUrl: string;
  };
  google: {
    isEnable: boolean;
    tagManagerId: string;
  };
  facebook: {
    isEnable: boolean;
    appId: string;
    pageId: string;
  };
  guestCheckout: boolean;
  printer: PrinterSettings;
  messages: {
    closed_message: string;
    not_accepting_orders_message: string;
  };
  server_info: ServerInfo;
  promoPopup: {
    isEnable: boolean;
    image: AttachmentInput;
    title: string;
    description: string;
    popupDelay: number;
    popupExpiredIn: number;
    isNotShowAgain: boolean;
  };
  isUnderMaintenance: boolean;
  maintenance: {
    image: AttachmentInput;
    title: string;
    description: string;
    start: string;
    until: string;
    isOverlayColor: boolean;
    overlayColor: string;
    overlayColorRange: string;
    buttonTitleOne: string;
    buttonTitleTwo: string;
    newsLetterTitle: string;
    newsLetterDescription: string;
    aboutUsTitle: string;
    aboutUsDescription: string;
    contactUsTitle: string;
  };
  footer_text: string;
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
      contactDetails: {
        ...options?.contactDetails,
        contacts: options?.contactDetails?.contacts
          ? options.contactDetails.contacts.map((contact: string) => ({ value: contact }))
          : [{ value: options?.contactDetails?.contact || '' }],
        socials: options?.contactDetails?.socials
          ? options?.contactDetails?.socials.map((social: any) => ({
            icon: updatedIcons?.find((icon) => icon?.value === social?.icon),
            url: social?.url,
          }))
          : [],
      },
      deliveryTime: options?.deliveryTime ? options?.deliveryTime : [],
      logo: options?.logo ?? '',
      useEnableGateway: options?.useEnableGateway ?? true,
      guestCheckout: options?.guestCheckout ?? true,
      currency: options?.currency
        ? CURRENCY.find((item) => item.code == options?.currency)
        : '',
      defaultAi: options?.defaultAi
        ? AI.find((item) => item.value == options?.defaultAi)
        : 'openai',

      // single-select on payment gateway
      // paymentGateway: options?.paymentGateway
      //   ? PAYMENT_GATEWAY.find((item) => item.name == options?.paymentGateway)
      //   : PAYMENT_GATEWAY[0],

      defaultPaymentGateway: options?.defaultPaymentGateway
        ? PAYMENT_GATEWAY.find(
          (item) => item.name == options?.defaultPaymentGateway,
        )
        : PAYMENT_GATEWAY[0],

      currencyOptions: {
        ...options?.currencyOptions,
        formation: options?.currencyOptions?.formation
          ? COUNTRY_LOCALE.find(
            (item) => item.code == options?.currencyOptions?.formation,
          )
          : COUNTRY_LOCALE[0],
      },
      // multi-select on payment gateway
      paymentGateway: options?.paymentGateway
        ? options?.paymentGateway?.map((gateway: any) => ({
          name: gateway?.name,
          title: gateway?.title,
        }))
        : [],

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
      printer: options?.printer ?? {
        printer_id: '',
        public_key: '',
        private_key: '',
      },
      footer_text: options?.footer_text ?? '',
      messages: {
        closed_message: options?.messages?.closed_message ?? '',
        not_accepting_orders_message: options?.messages?.not_accepting_orders_message ?? '',
      },
      promoPopup: {
        isEnable: options?.promoPopup?.isEnable ?? false,
        image: options?.promoPopup?.image,
        title: options?.promoPopup?.title ?? '',
        description: options?.promoPopup?.description ?? '',
        popupDelay: options?.promoPopup?.popupDelay ?? 0,
        popupExpiredIn: options?.promoPopup?.popupExpiredIn ?? 0,
        isNotShowAgain: options?.promoPopup?.isNotShowAgain ?? false,
      },
      isUnderMaintenance: options?.isUnderMaintenance ?? false,
      maintenance: {
        image: options?.maintenance?.image,
        title: options?.maintenance?.title ?? '',
        description: options?.maintenance?.description ?? '',
        start: options?.maintenance?.start ?? today.toString(),
        until: options?.maintenance?.until ?? today.toString(),
        isOverlayColor: options?.maintenance?.isOverlayColor ?? false,
        overlayColor: options?.maintenance?.overlayColor ?? '',
        overlayColorRange: options?.maintenance?.overlayColorRange ?? '',
        buttonTitleOne: options?.maintenance?.buttonTitleOne ?? '',
        buttonTitleTwo: options?.maintenance?.buttonTitleTwo ?? '',
        newsLetterTitle: options?.maintenance?.newsLetterTitle ?? '',
        newsLetterDescription: options?.maintenance?.newsLetterDescription ?? '',
        aboutUsTitle: options?.maintenance?.aboutUsTitle ?? '',
        aboutUsDescription: options?.maintenance?.aboutUsDescription ?? '',
        contactUsTitle: options?.maintenance?.contactUsTitle ?? '',
      },
      maximumQuestionLimit: options?.maximumQuestionLimit ?? 0,
    },
  });
  const { openModal } = useModalAction();

  const generateName = watch('siteTitle');
  const autoSuggestionList = useMemo(() => {
    return chatbotAutoSuggestion({ name: generateName ?? '' });
  }, [generateName]);

  const handleGenerateDescription = useCallback(() => {
    openModal('GENERATE_DESCRIPTION', {
      control,
      name: generateName,
      set_value: setValue,
      key: 'seo.metaDescription',
      suggestion: autoSuggestionList as ItemProps[],
    });
  }, [generateName]);

  const autoSuggestionList1 = useMemo(() => {
    return chatbotAutoSuggestion1({ name: generateName ?? '' });
  }, [generateName]);
  const handleGenerateDescription1 = useCallback(() => {
    openModal('GENERATE_DESCRIPTION', {
      control,
      name: generateName,
      set_value: setValue,
      key: 'seo.ogDescription',
      suggestion: autoSuggestionList1 as ItemProps[],
    });
  }, [generateName]);

  const enableFreeShipping = watch('freeShipping');
  const currentCurrency = watch('currency');
  const formation = watch('currencyOptions.formation');
  const currentFractions = watch('currencyOptions.fractions') as number;

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'deliveryTime',
  });
  const {
    fields: contactFields,
    append: contactAppend,
    remove: contactRemove,
  } = useFieldArray({
    control,
    name: 'contactDetails.contacts',
  });
  const {
    fields: socialFields,
    append: socialAppend,
    remove: socialRemove,
  } = useFieldArray({
    control,
    name: 'contactDetails.socials',
  });

  const startDate = watch('maintenance.start');
  const untilDate = watch('maintenance.until');
  const isOverlayColor = watch('maintenance.isOverlayColor');
  const isMaintenanceMode = watch('isUnderMaintenance');


  let sameDay = useMemo(() => {
    return isSameDay(new Date(untilDate), new Date(startDate));
  }, [untilDate, startDate]);

  const filterUntilTime = (date: Date) => {
    if (sameDay) {
      const isPastTime =
        addMinutes(new Date(startDate), 15).getTime() > date.getTime();
      return !isPastTime;
    }

    return true;
  };

  const filterStartTime = (date: Date) => {
    let today = isToday(new Date(startDate));
    if (today) {
      const isPastTime = new Date(startDate).getTime() > date.getTime();
      return !isPastTime;
    }

    return true;
  };

  const maintenanceImageInformation = (
    <span>
      {t('form:maintenance-cover-image-help-text')} <br />
      {t('form:cover-image-dimension-help-text')} &nbsp;
      <span className="font-bold">1170 x 435{t('common:text-px')}</span>
    </span>
  );

  // const isNotDefaultSettingsPage = Config.defaultLanguage !== locale;

  async function onSubmit(values: any) {
    const contactDetails = {
      ...values?.contactDetails,
      location: { ...omit(values?.contactDetails?.location, '__typename') },
      socials: values?.contactDetails?.socials
        ? values?.contactDetails?.socials?.map((social: any) => ({
          icon: social?.icon?.value,
          url: social?.url,
        }))
        : [],
    };
    updateSettingsMutation({
      language: locale,
      options: {
        ...values,
        server_info: serverInfo,
        signupPoints: Number(values.signupPoints),
        maxShopDistance: Number(values.maxShopDistance),
        currencyToWalletRatio: Number(values.currencyToWalletRatio),
        minimumOrderAmount: Number(values.minimumOrderAmount),
        freeShippingAmount: Number(values.freeShippingAmount),
        currency: values.currency?.code,
        defaultAi: values?.defaultAi?.value,
        // paymentGateway: values.paymentGateway?.name,
        defaultPaymentGateway: values.defaultPaymentGateway?.name,
        paymentGateway:
          values?.paymentGateway && values?.paymentGateway!.length
            ? values?.paymentGateway?.map((gateway: any) => ({
              name: gateway.name,
              title: gateway.title,
            }))
            : PAYMENT_GATEWAY.filter((value: any, index: number) => index < 2),
        useEnableGateway: values?.useEnableGateway,
        guestCheckout: values?.guestCheckout,
        taxClass: values?.taxClass?.id,
        shippingClass: values?.shippingClass?.id,
        logo: values?.logo,
        contactDetails,
        //@ts-ignore
        seo: {
          ...values?.seo,
          ogImage: values?.seo?.ogImage,
        },
        currencyOptions: {
          ...values.currencyOptions,
          formation: values?.currencyOptions?.formation?.code,
        },
        footer_text: values.footer_text,
        messages: {
          closed_message: values.messages.closed_message,
          not_accepting_orders_message: values.messages.not_accepting_orders_message,
        },
        promoPopup: {
          ...values.promoPopup,
          popupDelay: Number(values.promoPopup.popupDelay),
          popupExpiredIn: Number(values.promoPopup.popupExpiredIn),
        },
        isUnderMaintenance: values.isUnderMaintenance,
        maintenance: {
          ...values.maintenance,
          start: values.maintenance.start,
          until: values.maintenance.until,
        },
        printer: values.printer,
      },
    });
  }

  let paymentGateway = watch('paymentGateway');
  let defaultPaymentGateway = watch('defaultPaymentGateway');
  let useEnableGateway = watch('useEnableGateway');
  // let enableAi = watch('useAi');

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

  let checkAvailableDefaultGateway = paymentGateway?.some(
    (item: any) => item?.name === defaultPaymentGateway?.name,
  );

  const isStripeActive = paymentGateway?.some(
    (payment) => payment?.name === 'stripe',
  );

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

      <div className="flex flex-wrap pb-8 my-5 border-b border-dashed border-border-base sm:my-8">
        <Description
          title={t('form:form-title-information')}
          details={t('form:site-info-help-text')}
          className="w-full px-0 pb-5 sm:w-4/12 sm:py-8 sm:pe-4 md:w-1/3 md:pe-5"
        />

        <Card className="w-full sm:w-8/12 md:w-2/3">
          <Input
            label={t('form:input-label-site-title')}
            {...register('siteTitle')}
            error={t(errors.siteTitle?.message!)}
            variant="outline"
            className="mb-5"
          />
          <Input
            label={t('form:input-label-site-subtitle')}
            {...register('siteSubtitle')}
            error={t(errors.siteSubtitle?.message!)}
            variant="outline"
            className="mb-5"
          />
          <Input
            label={`${t('form:input-label-min-order-amount')}`}
            {...register('minimumOrderAmount')}
            type="number"
            error={t(errors.minimumOrderAmount?.message!)}
            variant="outline"
            className="mb-5"
          // disabled={isNotDefaultSettingsPage}
          />
          <Input
            label={`${t('form:input-label-wallet-currency-ratio')}`}
            {...register('currencyToWalletRatio')}
            type="number"
            error={t(errors.currencyToWalletRatio?.message!)}
            variant="outline"
            className="mb-5"
          // disabled={isNotDefaultSettingsPage}
          />
          <Input
            label={`${t('form:input-label-signup-points')}`}
            {...register('signupPoints')}
            type="number"
            error={t(errors.signupPoints?.message!)}
            variant="outline"
            className="mb-5"
          // disabled={isNotDefaultSettingsPage}
          />


          <div className="mb-5">
            <Label>Footer Text</Label>
            <TextArea
              label="Footer Text"
              {...register('footer_text')}
              variant="outline"
              className="mb-5"
            />
          </div>

          <div className="mb-5">
            <Label>Closed Message</Label>
            <TextArea
              label="Message to show when restaurant is closed"
              {...register('messages.closed_message')}
              variant="outline"
              className="mb-5"
            />
          </div>

          <div className="mb-5">
            <Label>Not Accepting Orders Message</Label>
            <TextArea
              label="Message to show when not accepting orders"
              {...register('messages.not_accepting_orders_message')}
              variant="outline"
              className="mb-5"
            />
          </div>

          <Input
            label={`${t('form:input-label-maximum-question-limit')}`}
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
                control={control}
              // disabled={isNotDefaultSettingsPage}
              />
              <Label className="mb-0">{t('form:input-label-enable-otp')}</Label>
            </div>
          </div>

          <div className="mb-5">
            <div className="flex items-center gap-x-4">
              <SwitchInput
                name="useMustVerifyEmail"
                control={control}
              // disabled={isNotDefaultSettingsPage}
              />
              <Label className="mb-0">
                {t('form:input-label-use-must-verify-email')}
              </Label>
            </div>
          </div>

          <div className="mb-5">
            <div className="flex items-center gap-x-4">
              <SwitchInput
                name="useAi"
                control={control}
              // disabled={isNotDefaultSettingsPage}
              />
              <Label className="mb-0">
                {t('form:input-label-enable-open-ai')}
              </Label>
            </div>
          </div>
          <div className="mb-5">
            <Label>{t('form:input-label-select-ai')}</Label>
            <SelectInput
              name="defaultAi"
              control={control}
              getOptionLabel={(option: any) => option.name}
              getOptionValue={(option: any) => option.value}
              options={AI}
            // disabled={isNotDefaultSettingsPage}
            />
          </div>

          <div className="mb-5">
            <Label>{t('form:input-label-tax-class')}</Label>
            <SelectInput
              name="taxClass"
              control={control}
              getOptionLabel={(option: any) => option.name}
              getOptionValue={(option: any) => option.id}
              options={taxClasses!}
            // disabled={isNotDefaultSettingsPage}
            />
          </div>

          <div className="mb-5">
            <Label>{t('form:input-label-shipping-class')}</Label>
            <SelectInput
              name="shippingClass"
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
                control={control}
              // disabled={isNotDefaultSettingsPage}
              />
              <Label className="mb-0">
                {t('form:input-label-enable-guest-checkout')}
              </Label>
            </div>
          </div>

          <div className="flex items-center gap-x-4">
            <SwitchInput
              name="freeShipping"
              control={control}
              checked={enableFreeShipping}
            // disabled={isNotDefaultSettingsPage}
            />
            <Label className="mb-0">
              {t('form:input-label-enable-free-shipping')}
            </Label>
          </div>

          {enableFreeShipping && (
            <Input
              label={t('form:free-shipping-input-label-amount')}
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

      <div className="flex flex-wrap pb-8 my-5 border-b border-dashed border-border-base sm:my-8">
        <Description
          title={t('Payment')}
          details={t('Configure Payment Option')}
          className="w-full px-0 pb-5 sm:w-4/12 sm:py-8 sm:pe-4 md:w-1/3 md:pe-5"
        />
        <Card className="w-full sm:w-8/12 md:w-2/3">
          <div className="mb-5">
            <div className="flex items-center gap-x-4">
              <SwitchInput
                name="useCashOnDelivery"
                control={control}
              // disabled={isNotDefaultSettingsPage}
              />
              <Label className="mb-0">{t('Enable Cash On Delivery')}</Label>
            </div>
          </div>
          <div className="mb-5">
            <Label>{t('form:input-label-currency')}</Label>
            <SelectInput
              name="currency"
              control={control}
              getOptionLabel={(option: any) => option.name}
              getOptionValue={(option: any) => option.code}
              options={CURRENCY}
            // disabled={isNotDefaultSettingsPage}
            />
            <ValidationError message={t(errors.currency?.message)} />
          </div>
          <div className="flex items-center gap-x-4">
            <SwitchInput
              control={control}
              // disabled={isNotDefaultSettingsPage}
              {...register('useEnableGateway')}
            />
            <Label className="mb-0">{t('Enable Gateway')}</Label>
          </div>
          {useEnableGateway ? (
            <>
              <div className="mt-5 mb-5">
                <Label>{t('text-select-payment-gateway')}</Label>
                <PaymentSelect
                  options={PAYMENT_GATEWAY}
                  control={control}
                  name="paymentGateway"
                  defaultItem={
                    checkAvailableDefaultGateway
                      ? defaultPaymentGateway?.name
                      : ''
                  }
                  disable={isEmpty(paymentGateway)}
                />
              </div>

              {isEmpty(paymentGateway) ? (
                <div className="flex px-5 py-4">
                  <Loader
                    simple={false}
                    showText={true}
                    text="Please wait payment method is preparing..."
                    className="mx-auto !h-20 w-6"
                  />
                </div>
              ) : (
                <>
                  <div className="mb-5">
                    <Label>{t('text-select-default-payment-gateway')}</Label>
                    <SelectInput
                      name="defaultPaymentGateway"
                      control={control}
                      getOptionLabel={(option: any) => option.title}
                      getOptionValue={(option: any) => option.name}
                      options={paymentGateway ?? []}
                    // disabled={isNotDefaultSettingsPage}
                    />
                  </div>
                  {isStripeActive && (
                    <>
                      <div className="mb-5">
                        <div className="flex items-center gap-x-4">
                          <SwitchInput
                            name="StripeCardOnly"
                            control={control}
                          // disabled={isNotDefaultSettingsPage}
                          />
                          <Label className="!mb-0">
                            {t('Enable Stripe Element')}
                          </Label>
                        </div>
                      </div>
                    </>
                  )}
                  <Label>{t('text-webhook-url')}</Label>
                  <div className="relative flex flex-col overflow-hidden rounded-md border border-solid border-[#D1D5DB]">
                    {paymentGateway?.map((gateway: any, index: any) => {
                      return <WebHookURL gateway={gateway} key={index} />;
                    })}
                  </div>
                </>
              )}
            </>
          ) : (
            ''
          )}
        </Card>
      </div>
      <div className="flex flex-wrap pb-8 my-5 border-b border-dashed border-border-base sm:my-8">
        <Description
          title="Currency Options"
          details={t('form:currency-options-info-help-text')}
          className="w-full px-0 pb-5 sm:w-4/12 sm:py-8 sm:pr-4 md:w-1/3 md:pr-5"
        />

        <Card className="w-full sm:w-8/12 md:w-2/3">
          <div className="mb-5">
            <Label>{`${t('form:input-label-currency-formations')} *`}</Label>
            <SelectInput
              {...register('currencyOptions.formation')}
              control={control}
              getOptionLabel={(option: any) => option.name}
              getOptionValue={(option: any) => option.code}
              options={COUNTRY_LOCALE}
            // disabled={isNotDefaultSettingsPage}
            />
          </div>
          <Input
            label={`${t('form:input-label-currency-number-of-decimal')} *`}
            {...register('currencyOptions.fractions')}
            type="number"
            variant="outline"
            placeholder={t('form:input-placeholder-currency-number-of-decimal')}
            error={t(errors.currencyOptions?.fractions?.message!)}
            className="mb-5"
          />
          {formation && (
            <div className="mb-5">
              <Label>
                {`Sample Output: `}
                <Badge
                  text={formatPrice({
                    amount: 987456321.123456789,
                    currencyCode:
                      currentCurrency?.code ?? settings?.options?.currency!,
                    // @ts-ignore
                    locale: formation?.code! as string,
                    fractions: currentFractions,
                  })}
                  color="bg-accent"
                />
              </Label>
            </div>
          )}
        </Card>
      </div>
      <div className="flex flex-wrap pb-8 my-5 border-b border-dashed border-border-base sm:my-8">
        <Description
          title="SEO"
          details={t('form:tax-form-seo-info-help-text')}
          className="w-full px-0 pb-5 sm:w-4/12 sm:py-8 sm:pr-4 md:w-1/3 md:pr-5"
        />

        <Card className="w-full sm:w-8/12 md:w-2/3">
          <Input
            label={t('form:input-label-meta-title')}
            {...register('seo.metaTitle')}
            variant="outline"
            className="mb-5"
          />
          <div className="relative">
            {options?.useAi && (
              <OpenAIButton
                title={t('form:button-label-description-ai')}
                onClick={handleGenerateDescription}
              />
            )}
            <TextArea
              label={t('form:input-label-meta-description')}
              {...register('seo.metaDescription')}
              variant="outline"
              className="mb-5"
            />
          </div>

          <Input
            label={t('form:input-label-meta-tags')}
            {...register('seo.metaTags')}
            variant="outline"
            className="mb-5"
          />
          <Input
            label={t('form:input-label-canonical-url')}
            {...register('seo.canonicalUrl')}
            variant="outline"
            className="mb-5"
          />
          <Input
            label={t('form:input-label-og-title')}
            {...register('seo.ogTitle')}
            variant="outline"
            className="mb-5"
          />

          <div className="relative">
            {options?.useAi && (
              <OpenAIButton
                title={t('form:button-label-description-ai')}
                onClick={handleGenerateDescription1}
              />
            )}
            <TextArea
              label={t('form:input-label-og-description')}
              {...register('seo.ogDescription')}
              variant="outline"
              className="mb-5"
            />
          </div>

          <div className="mb-5">
            <Label>{t('form:input-label-og-image')}</Label>
            <FileInput name="seo.ogImage" control={control} multiple={false} />
          </div>
        </Card>
      </div>

      {/* Promo Popup Section */}
      <div className="flex flex-wrap pb-8 my-5 border-b border-dashed border-border-base sm:my-8">
        <Description
          title="Promo Popup"
          details="Configure the promotional popup that appears on the storefront."
          className="w-full px-0 pb-5 sm:w-4/12 sm:py-8 sm:pe-4 md:w-1/3 md:pe-5"
        />

        <Card className="w-full sm:w-8/12 md:w-2/3">
          <div className="flex items-center gap-x-4 mb-5">
            <SwitchInput name="promoPopup.isEnable" control={control} />
            <Label className="mb-0">Enable Promo Popup</Label>
          </div>

          <div className="mb-5">
            <Label>Promo Image</Label>
            <FileInput name="promoPopup.image" control={control} multiple={false} />
          </div>

          <Input
            label="Popup Title"
            {...register('promoPopup.title')}
            variant="outline"
            className="mb-5"
          />

          <TextArea
            label="Popup Description"
            {...register('promoPopup.description')}
            variant="outline"
            className="mb-5"
          />

          <div className="flex flex-col sm:flex-row gap-5 mb-5">
            <Input
              label="Popup Delay (ms)"
              {...register('promoPopup.popupDelay')}
              type="number"
              variant="outline"
              className="w-full sm:w-1/2"
              placeholder="e.g. 3000"
            />
            <Input
              label="Expired In (days)"
              {...register('promoPopup.popupExpiredIn')}
              type="number"
              variant="outline"
              className="w-full sm:w-1/2"
              placeholder="e.g. 7"
            />
          </div>

          <div className="flex items-center gap-x-4">
            <SwitchInput name="promoPopup.isNotShowAgain" control={control} />
            <Label className="mb-0">Show &quot;Do not show again&quot; Option</Label>
          </div>
        </Card>
      </div>

      <div className="flex flex-wrap pb-8 my-5 border-b border-dashed border-border-base sm:my-8">
        <Description
          title={t('form:form-title-seo-settings')}
          details={t('form:seo-settings-help-text')}
          className="w-full px-0 pb-5 sm:w-4/12 sm:py-8 sm:pe-4 md:w-1/3 md:pe-5"
        />
        <Card className="w-full sm:w-8/12 md:w-2/3">
          <Input
            label={t('form:input-label-meta-title')}
            {...register('seo.metaTitle')}
            variant="outline"
            className="mb-5"
          />
          <TextArea
            label={t('form:input-label-meta-description')}
            {...register('seo.metaDescription')}
            variant="outline"
            className="mb-5"
          />
          <Input
            label={t('form:input-label-og-title')}
            {...register('seo.ogTitle')}
            variant="outline"
            className="mb-5"
          />
          <TextArea
            label={t('form:input-label-og-description')}
            {...register('seo.ogDescription')}
            variant="outline"
            className="mb-5"
          />
          <div className="mb-5">
            <Label>{t('form:input-label-og-image')}</Label>
            <FileInput name="seo.ogImage" control={control} multiple={false} />
          </div>
          <Input
            label={t('form:input-label-twitter-handle')}
            {...register('seo.twitterHandle')}
            variant="outline"
            className="mb-5"
            placeholder="your twitter username (exp: @username)"
          />
          <Input
            label={t('form:input-label-twitter-card-type')}
            {...register('seo.twitterCardType')}
            variant="outline"
            className="mb-5"
            placeholder="one of summary, summary_large_image, app, or player"
          />
        </Card>
      </div >
      <div className="flex flex-wrap pb-8 my-5 border-b border-dashed border-border-base sm:my-8">
        <Description
          title="Printer Settings"
          details="Configure your printer settings here."
          className="w-full px-0 pb-5 sm:w-4/12 sm:py-8 sm:pe-4 md:w-1/3 md:pe-5"
        />
        <Card className="w-full sm:w-8/12 md:w-2/3">
          <Input
            label="Printer ID"
            {...register('printer.printer_id')}
            variant="outline"
            className="mb-5"
          />
          <Input
            label="Public Key"
            {...register('printer.public_key')}
            variant="outline"
            className="mb-5"
          />
          <Input
            label="Private Key"
            {...register('printer.private_key')}
            variant="outline"
            className="mb-5"
          />
        </Card>
      </div >

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
                      variant="outline"
                      {...register(`deliveryTime.${index}.title` as const)}
                      defaultValue={item?.title!} // make sure to set up defaultValue
                      // @ts-ignore
                      error={t(errors?.deliveryTime?.[index]?.title?.message)}
                    />
                    <TextArea
                      label={t('form:input-delivery-time-description')}
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

          {
            /*@ts-ignore*/
            errors?.deliveryTime?.message ? (
              <Alert
                // @ts-ignore
                message={t(errors?.deliveryTime?.message)}
                variant="error"
                className="mt-5"
              />
            ) : null
          }
        </Card>
      </div>

      <div className="flex flex-wrap pb-8 my-5 border-b border-gray-300 border-dashed sm:my-8">
        <Description
          title={t('form:shop-settings')}
          details={t('form:shop-settings-helper-text')}
          className="w-full px-0 pb-5 sm:w-4/12 sm:py-8 sm:pe-4 md:w-1/3 md:pe-5"
        />

        <Card className="w-full sm:w-8/12 md:w-2/3">
          <div className="mb-5">
            <Label>{t('form:input-label-autocomplete')}</Label>
            <Controller
              control={control}
              name="contactDetails.location"
              render={({ field: { onChange } }) => (
                <GooglePlacesAutocomplete
                  onChange={onChange}
                  data={getValues('contactDetails.location')!}
                // disabled={isNotDefaultSettingsPage}
                />
              )}
            />
          </div>
          <div>
            {contactFields.map((item: any, index: number) => (
              <div className="flex items-center gap-x-4 mb-5" key={item.id}>
                <Input
                  className="w-full"
                  label={index === 0 ? t('form:input-label-contact') : ''}
                  {...register(`contactDetails.contacts.${index}.value` as const)}
                  variant="outline"
                // error={t(errors.contactDetails?.contacts?.[index]?.value?.message!)}
                />
                <button
                  onClick={() => contactRemove(index)}
                  type="button"
                  className={`text-sm text-red-500 transition-colors duration-200 hover:text-red-700 focus:outline-none ${index === 0 ? 'mt-8' : ''}`}
                >
                  {t('form:button-label-remove')}
                </button>
              </div>
            ))}
            <Button
              type="button"
              onClick={() => contactAppend({ value: '' })}
              className="w-full sm:w-auto mb-5"
            >
              Add Phone
            </Button>
          </div>
          <Input
            label={t('form:input-label-website')}
            {...register('contactDetails.website')}
            variant="outline"
            className="mb-5"
            error={t(errors.contactDetails?.website?.message!)}
          // disabled={isNotDefaultSettingsPage}
          />

          <div className="mt-6">
            <div className="flex items-center gap-x-4">
              <SwitchInput
                name="useGoogleMap"
                control={control}
              // disabled={isNotDefaultSettingsPage}
              />
              <Label className="mb-0">
                {t('form:input-label-use-google-map-service')}
              </Label>
            </div>
          </div>

          <Input
            label={`${t('Maximum Search Location Distance(miles)')}`}
            {...register('maxShopDistance')}
            type="number"
            error={t(errors.maxShopDistance?.message!)}
            variant="outline"
            className="my-5"
          // disabled={isNotDefaultSettingsPage}
          />

          <div className="mt-6">
            <div className="flex items-center gap-x-4">
              <SwitchInput
                name="isProductReview"
                control={control}
              // disabled={isNotDefaultSettingsPage}
              />
              <Label className="mb-0">
                {t('form:input-label-product-for-review')}
              </Label>
            </div>
          </div>

          {/* Social and Icon picker */}
          <div>
            {socialFields.map(
              (item: ShopSocialInput & { id: string }, index: number) => (
                <div
                  className="py-5 border-b border-dashed border-border-200 first:mt-5 first:border-t last:border-b-0 md:py-8 md:first:mt-10"
                  key={item.id}
                >
                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-5">
                    <div className="sm:col-span-2">
                      <Label className="whitespace-nowrap">
                        {t('form:input-label-select-platform')}
                      </Label>
                      <SelectInput
                        name={`contactDetails.socials.${index}.icon` as const}
                        control={control}
                        options={updatedIcons}
                        isClearable={true}
                        defaultValue={item?.icon!}
                      // disabled={isNotDefaultSettingsPage}
                      />
                    </div>
                    <Input
                      className="sm:col-span-2"
                      label={t('form:input-label-social-url')}
                      variant="outline"
                      {...register(
                        `contactDetails.socials.${index}.url` as const,
                      )}
                      defaultValue={item.url!} // make sure to set up defaultValue
                    // disabled={isNotDefaultSettingsPage}
                    />
                    {/* {!isNotDefaultSettingsPage && ( */}
                    <button
                      onClick={() => {
                        socialRemove(index);
                      }}
                      type="button"
                      className="text-sm text-red-500 transition-colors duration-200 hover:text-red-700 focus:outline-none sm:col-span-1 sm:mt-4"
                    // disabled={isNotDefaultSettingsPage}
                    >
                      {t('form:button-label-remove')}
                    </button>
                    {/* )} */}
                  </div>
                </div>
              ),
            )}
          </div>

          {/* {!isNotDefaultSettingsPage && ( */}
          <Button
            type="button"
            onClick={() => socialAppend({ icon: '', url: '' })}
            className="w-full sm:w-auto"
          // disabled={isNotDefaultSettingsPage}
          >
            {t('form:button-label-add-social')}
          </Button>
          {/* )} */}
        </Card>
      </div>

      {/* Maintenance Mode Section */}
      <div className="flex flex-wrap pb-8 my-5 border-b border-dashed border-border-base sm:my-8">
        <Description
          title={t('form:form-title-information')}
          details={t('form:site-maintenance-info-help-text')}
          className="w-full px-0 pb-5 sm:w-4/12 sm:py-8 sm:pe-4 md:w-1/3 md:pe-5"
        />

        <Card className="w-full sm:w-8/12 md:w-2/3">
          <div className="my-5">
            <SwitchInput
              name="isUnderMaintenance"
              label={t('form:input-label-enable-maintenance-mode')}
              toolTipText={t('form:input-tooltip-enable-maintenance-mode')}
              control={control}
            />
          </div>
        </Card>
      </div>

      <div className="flex flex-wrap pb-8 my-5 border-b border-dashed border-border-base sm:my-8">
        <Description
          title={t('form:input-label-maintenance-cover-image')}
          details={maintenanceImageInformation}
          className="w-full px-0 pb-5 sm:w-4/12 sm:py-8 sm:pe-4 md:w-1/3 md:pe-5"
        />

        <Card className="w-full logo-field-area sm:w-8/12 md:w-2/3">
          <FileInput
            name="maintenance.image"
            control={control}
            multiple={false}
            disabled={!isMaintenanceMode}
          />
        </Card>
      </div>

      <div className="flex flex-wrap pb-8 my-5 border-b border-dashed border-border-base sm:my-8">
        <Description
          title={t('form:form-title-maintenance-information')}
          details={t('form:site-maintenance-info-help-text')}
          className="w-full px-0 pb-5 sm:w-4/12 sm:py-8 sm:pe-4 md:w-1/3 md:pe-5"
        />

        <Card className="w-full sm:w-8/12 md:w-2/3">
          <Input
            label={t('form:input-label-title')}
            toolTipText={t('form:input-tooltip-maintenance-title')}
            {...register('maintenance.title')}
            // error={t(errors.maintenance?.title?.message!)}
            variant="outline"
            className="mb-5"
            disabled={!isMaintenanceMode}
          />
          <TextArea
            label={t('form:input-label-description')}
            toolTipText={t('form:input-tooltip-maintenance-description')}
            {...register('maintenance.description')}
            // error={t(errors.maintenance?.description?.message!)}
            variant="outline"
            className="mb-5"
            disabled={!isMaintenanceMode}
          />
          <div className="mb-5">
            <DatePicker
              control={control}
              name="maintenance.start"
              minDate={today}
              startDate={new Date(startDate)}
              locale={locale}
              placeholder="Start Date"
              disabled={!isMaintenanceMode}
              label={t('form:maintenance-start-time')}
              toolTipText={t('form:input-tooltip-maintenance-start-time')}
              // error={t(errors.maintenance?.start?.message!)}
              showTimeSelect
              timeFormat="h:mm aa"
              timeIntervals={15}
              timeCaption="time"
              dateFormat="MMMM d, yyyy h:mm aa"
              filterTime={filterStartTime}
            />
          </div>
          <div className="w-full">
            <DatePicker
              control={control}
              name="maintenance.until"
              disabled={!startDate || !isMaintenanceMode}
              minDate={addDays(new Date(startDate), 0)}
              placeholder="End Date"
              locale={locale}
              toolTipText={t('form:input-tooltip-maintenance-end-time')}
              label={t('form:maintenance-end-date')}
              // error={t(errors.maintenance?.until?.message!)}
              showTimeSelect
              timeFormat="h:mm aa"
              timeIntervals={15}
              timeCaption="time"
              dateFormat="MMMM d, yyyy h:mm aa"
              filterTime={filterUntilTime}
            />
          </div>
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

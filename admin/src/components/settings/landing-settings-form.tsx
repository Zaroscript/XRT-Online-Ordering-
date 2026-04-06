import Card from '@/components/common/card';
import Button from '@/components/ui/button';
import Description from '@/components/ui/description';
import FileInput from '@/components/ui/file-input';
import Input from '@/components/ui/input';
import PhoneNumberInput from '@/components/ui/phone-input';
import SwitchInput from '@/components/ui/switch-input';
import TextArea from '@/components/ui/text-area';
import { useUpdateSettingsMutation } from '@/data/settings';
import { formatAddress } from '@/utils/format-address';
import { siteSettings } from '@/settings/site.settings';
import { Settings, UserAddress } from '@/types';
import { HeroSlide } from '@/types';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import React, { useEffect } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { landingSettingsValidationSchema } from './landing-settings-validation-schema';
import Radio from '@/components/ui/radio/radio';
import Label from '@/components/ui/label';
import TooltipLabel from '@/components/ui/tooltip-label';
import { useCouponsQuery } from '@/data/coupon';
import SelectInput from '@/components/ui/select-input';

type FormValues = {
  logo: any;
  collapseLogo: any;
  footer_text: string;
  siteLink: string;
  copyrightText: string;
  showMenuSection: boolean;
  contactDetails: {
    location?: {
      city?: string;
      country?: string;
      state?: string;
      zip?: string;
      street_address?: string;
    };
    contact?: string;
    website?: string;
    emailAddress?: string;
  };
  messages: {
    closed_message: string;
    not_accepting_orders_message: string;
  };
  heroSlides: Array<HeroSlide & { bgVideo?: any }>;
  offerCards: Array<{
    title: string;
    description: string;
    image: any;
    couponCode: string;
    showCouponCode: boolean;
  }>;
  primary_color: string;
  secondary_color: string;
};

type IProps = {
  settings: Settings;
};

export default function LandingSettingsForm({ settings }: IProps) {
  const { t } = useTranslation();
  const { locale } = useRouter();
  const { mutate: updateSettingsMutation, isPending: loading } =
    useUpdateSettingsMutation();
  const { coupons } = useCouponsQuery({ limit: 100 });
  const couponOptions = coupons?.map((coupon: any) => ({
    label: coupon.code,
    value: coupon.code,
  })) ?? [];

  const options = settings?.options ?? {};
  const max_fileSize = options?.server_info?.upload_max_filesize
    ? options.server_info.upload_max_filesize / 1024
    : 0;
  const logoInformation = (
    <span className="space-y-3 block">
      <span className="block font-medium text-body-dark">
        {t('form:logo-help-text')}
      </span>
      <span className="block">
        <span className="font-semibold text-body-dark">
          {t('form:input-label-main-logo')}
        </span>
        <span className="block text-sm text-gray-500 mt-0.5">
          {t('form:logo-main-uploader-text')}
        </span>
      </span>
      <span className="block">
        <span className="font-semibold text-body-dark">
          {t('form:input-label-collapse-logo')}
        </span>
        <span className="block text-sm text-gray-500 mt-0.5">
          {t('form:logo-collapse-uploader-text')}
        </span>
      </span>
      {max_fileSize > 0 && (
        <span className="block text-xs text-gray-400">
          {t('form:size-help-text')} &nbsp;
          <span className="font-semibold">{max_fileSize} MB</span>
        </span>
      )}
    </span>
  );

  const {
    register,
    handleSubmit,
    control,
    watch,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: yupResolver(landingSettingsValidationSchema) as any,
    defaultValues: {
      logo: options?.logo ?? '',
      collapseLogo: options?.collapseLogo ?? '',
      footer_text: options?.footer_text ?? '',
      siteLink: options?.siteLink ?? '',
      copyrightText: options?.copyrightText ?? '',
      showMenuSection: (options as any)?.showMenuSection !== false,
      contactDetails: {
        ...options?.contactDetails,
        contact: options?.contactDetails?.contact ?? '',
        location: options?.contactDetails?.location ?? {},
        website: options?.contactDetails?.website ?? '',
        emailAddress: (options?.contactDetails as any)?.emailAddress ?? '',
      },
      messages: {
        closed_message: options?.messages?.closed_message ?? '',
        not_accepting_orders_message:
          options?.messages?.not_accepting_orders_message ?? '',
      },
      heroSlides: options?.heroSlides ?? [],
      offerCards: (options as any)?.offerCards ?? [],
      primary_color: (options as any)?.primary_color ?? '#5C9963',
      secondary_color: (options as any)?.secondary_color ?? '#2F3E30',
    },
  });

  React.useEffect(() => {
    reset({
      logo: options?.logo ?? '',
      collapseLogo: options?.collapseLogo ?? '',
      footer_text: options?.footer_text ?? '',
      siteLink: options?.siteLink ?? '',
      copyrightText: options?.copyrightText ?? '',
      showMenuSection: (options as any)?.showMenuSection !== false,
      contactDetails: {
        ...options?.contactDetails,
        contact: options?.contactDetails?.contact ?? '',
        location: options?.contactDetails?.location ?? {},
        website: options?.contactDetails?.website ?? '',
        emailAddress: (options?.contactDetails as any)?.emailAddress ?? '',
      },
      messages: {
        closed_message: options?.messages?.closed_message ?? '',
        not_accepting_orders_message:
          options?.messages?.not_accepting_orders_message ?? '',
      },
      heroSlides: options?.heroSlides ?? [],
      offerCards: (options as any)?.offerCards ?? [],
      primary_color: (options as any)?.primary_color ?? '#5C9963',
      secondary_color: (options as any)?.secondary_color ?? '#2F3E30',
    });
  }, [settings, reset]);

  const {
    fields: heroSlideFields,
    append: appendHeroSlide,
    remove: removeHeroSlide,
  } = useFieldArray({
    control,
    name: 'heroSlides',
  });

  const {
    fields: offerCardFields,
    append: appendOfferCard,
    remove: removeOfferCard,
  } = useFieldArray({
    control,
    name: 'offerCards',
  });

  function onSubmit(values: FormValues) {
    const contactDetails = {
      ...options?.contactDetails,
      ...values.contactDetails,
      location: values.contactDetails?.location
        ? {
            ...values.contactDetails.location,
            formattedAddress: formatAddress(
              values.contactDetails.location as UserAddress,
            ),
          }
        : options?.contactDetails?.location,
    };
    updateSettingsMutation({
      language: locale!,
      options: {
        ...options,
        logo: values.logo,
        collapseLogo: values.collapseLogo,
        footer_text: values.footer_text,
        siteLink: values.siteLink,
        copyrightText: values.copyrightText,
        showMenuSection: values.showMenuSection,
        contactDetails,
        messages: {
          closed_message: values.messages.closed_message,
          not_accepting_orders_message:
            values.messages.not_accepting_orders_message,
        },
        heroSlides: values.heroSlides.map((slide) => ({
          ...slide,
          bgVideo: slide.bgVideo ?? null,
        })),
        offerCards: values.offerCards.map((card: any) => ({
          ...card,
          couponCode:
            typeof card.couponCode === 'object'
              ? card.couponCode?.value
              : card.couponCode,
        })),
        primary_color: values.primary_color,
        secondary_color: values.secondary_color,
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

        <Card className="w-full logo-field-area sm:w-8/12 md:w-2/3">
          <FileInput
            name="logo"
            control={control}
            multiple={false}
            helperText={t('form:logo-main-uploader-text')}
          />

          <div className="mt-5">
            <span className="block mb-2 text-sm font-medium text-heading">
              {t('form:input-label-collapse-logo')}
            </span>
            <p className="text-xs text-gray-500 mb-3">
              {t('form:logo-collapse-uploader-hint')}
            </p>
            <FileInput
              name="collapseLogo"
              control={control}
              multiple={false}
              helperText={t('form:logo-collapse-uploader-text')}
            />
          </div>
        </Card>
      </div>

      <div className="flex flex-wrap pb-8 my-5 border-b border-dashed border-border-base sm:my-8">
        <Description
          title={t('form:form-title-information')}
          details={t('form:site-info-help-text')}
          className="w-full px-0 pb-5 sm:w-4/12 sm:py-8 sm:pe-4 md:w-1/3 md:pe-5"
        />

        <Card className="w-full sm:w-8/12 md:w-2/3">
          <div className="mb-5">
            <TextArea
              label={t('Closed Message')}
              toolTipText={t(
                'Message displayed when your restaurant is closed',
              )}
              {...register('messages.closed_message')}
              variant="outline"
              className="mb-5"
            />
          </div>

          <div className="mb-5">
            <TextArea
              label={t('Not Accepting Orders Message')}
              toolTipText={t(
                'Message displayed when you are not accepting orders',
              )}
              {...register('messages.not_accepting_orders_message')}
              variant="outline"
              className="mb-5"
            />
          </div>
        </Card>
      </div>

      <div className="flex flex-wrap pb-8 my-5 border-b border-dashed border-border-base sm:my-8">
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

      <div className="flex flex-wrap pb-8 my-5 border-b border-dashed border-border-base sm:my-8">
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

      <div className="flex flex-wrap pb-8 my-5 border-b border-dashed border-border-base sm:my-8">
        <Description
          title={t('form:form-title-menu-list-section')}
          details={t('form:form-description-menu-list-section')}
          className="w-full px-0 pb-5 sm:w-4/12 sm:py-8 sm:pe-4 md:w-1/3 md:pe-5"
        />

        <Card className="w-full sm:w-8/12 md:w-2/3">
          <SwitchInput
            name="showMenuSection"
            control={control}
            label={t('form:input-label-show-menu-section')}
            toolTipText={t('form:input-tooltip-show-menu-section')}
          />
        </Card>
      </div>

      <div className="flex flex-wrap pb-8 my-5 border-b border-dashed border-border-base sm:my-8">
        <Description
          title={t('form:form-title-hero-slider')}
          details={t('form:form-description-hero-slider')}
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
                  {t('form:form-label-slide')} {index + 1}
                </h4>
                <button
                  type="button"
                  onClick={() => removeHeroSlide(index)}
                  className="text-sm text-red-500 hover:text-red-700"
                >
                  {t('form:button-label-remove')}
                </button>
              </div>

              <div className="mb-6 pb-4 border-b border-gray-100">
                <Label className="mb-3 block text-sm font-semibold text-gray-600">
                  {t('form:input-label-hero-bg-type')}
                </Label>
                <div className="flex items-center gap-8">
                  <Radio
                    label={t('form:text-image')}
                    id={`heroSlides.${index}.bgType.image`}
                    value="image"
                    {...register(`heroSlides.${index}.bgType`)}
                  />
                  <Radio
                    label={t('form:text-video')}
                    id={`heroSlides.${index}.bgType.video`}
                    value="video"
                    {...register(`heroSlides.${index}.bgType`)}
                  />
                </div>
              </div>

              <div className="mb-4 grid grid-cols-1 gap-5">
                {watch(`heroSlides.${index}.bgType`) !== 'video' ? (
                  <div>
                    <FileInput
                      name={`heroSlides.${index}.bgImage`}
                      control={control}
                      multiple={false}
                      label={t('form:input-label-hero-bg-image')}
                      toolTipText={t('form:input-tooltip-hero-bg-image')}
                      helperText={t('form:hero-image-uploader-text')}
                    />
                  </div>
                ) : (
                  <div>
                    <FileInput
                      name={`heroSlides.${index}.bgVideo`}
                      control={control}
                      multiple={false}
                      label={t('form:input-label-hero-video')}
                      helperText={t('form:hero-video-uploader-text')}
                      accept="video/*"
                    />
                    <div className="mt-3 p-4 bg-gray-50 rounded-lg border border-gray-100">
                      <h5 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                        {t('form:hero-video-recommendation-title')}
                      </h5>
                      <ul className="text-[11px] text-gray-500 space-y-1 list-disc pl-4">
                        <li>{t('form:hero-video-recommendation-time')}</li>
                        <li>{t('form:hero-video-recommendation-size')}</li>
                        <li>{t('form:hero-video-recommendation-quality')}</li>
                      </ul>
                    </div>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label={t('form:input-title')}
                  toolTipText={t('form:input-tooltip-hero-title')}
                  {...register(`heroSlides.${index}.title`)}
                  variant="outline"
                />
                <Input
                  label={t('form:input-label-subtitle')}
                  {...register(`heroSlides.${index}.subtitle`)}
                  variant="outline"
                />
                <Input
                  label={t('form:input-label-offer-text')}
                  toolTipText={t('form:input-tooltip-offer-text')}
                  {...register(`heroSlides.${index}.offer`)}
                  variant="outline"
                />
                <Input
                  label={t('form:input-label-btn-text')}
                  toolTipText={t('form:input-tooltip-btn-text')}
                  {...register(`heroSlides.${index}.btnText`)}
                  variant="outline"
                />
                <Input
                  label={t('form:input-label-btn-link')}
                  toolTipText={t('form:input-tooltip-btn-link')}
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
                bgType: 'image',
                bgImage: undefined,
                bgVideo: undefined,
                title: '',
                subtitle: '',
                offer: '',
                btnText: '',
                btnLink: '',
              })
            }
            className="w-full sm:w-auto mt-4"
            variant="outline"
          >
            {t('form:button-label-add-hero-slide')}
          </Button>
        </Card>
      </div>

      <div className="flex flex-wrap pb-8 my-5 border-b border-dashed border-border-base sm:my-8">
        <Description
          title={t('form:form-title-offer-cards')}
          details={t('form:form-description-offer-cards')}
          className="w-full px-0 pb-5 sm:w-4/12 sm:py-8 sm:pe-4 md:w-1/3 md:pe-5"
        />

        <Card className="w-full sm:w-8/12 md:w-2/3">
          <div className="flex flex-col gap-8">
            {offerCardFields.map((field, index) => (
              <div
                key={field.id}
                className="p-5 border border-border-200 rounded-lg bg-light-50"
              >
                <div className="flex justify-between items-center mb-5 pb-2 border-b border-dashed">
                  <h4 className="font-semibold text-body-dark">
                    {t('form:form-label-offer-card')} {index + 1}
                  </h4>
                  <button
                    type="button"
                    onClick={() => removeOfferCard(index)}
                    className="text-sm text-red-500 hover:text-red-700 transition-colors"
                  >
                    {t('form:button-label-remove')}
                  </button>
                </div>

                <div className="grid grid-cols-1 gap-5">
                  <FileInput
                    name={`offerCards.${index}.image`}
                    control={control}
                    multiple={false}
                    label={t('form:input-label-offer-card-image')}
                  />
                  <p className="mt-2 text-sm text-gray-500 italic">
                    {t('form:input-note-offer-card-image')}
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input
                      label={t('form:input-label-offer-card-title')}
                      {...register(`offerCards.${index}.title`)}
                      variant="outline"
                      error={t(errors.offerCards?.[index]?.title?.message as string)}
                    />
                    <Input
                      label={t('form:input-label-offer-card-description')}
                      {...register(`offerCards.${index}.description`)}
                      variant="outline"
                    />
                  </div>

                    <SelectInput
                      name={`offerCards.${index}.couponCode`}
                      label={t('form:input-label-offer-card-coupon')}
                      control={control}
                      options={couponOptions}
                      isClearable
                      placeholder={t('form:input-placeholder-select-coupon')}
                    />

                    <div className="mt-2">
                      <SwitchInput
                        name={`offerCards.${index}.showCouponCode`}
                        control={control}
                        label={t('form:input-label-show-coupon-code')}
                        toolTipText={t('form:input-tooltip-show-coupon-code')}
                      />
                    </div>
                  </div>
                </div>
              ))}
          </div>

          {offerCardFields.length < 3 && (
            <Button
              type="button"
              onClick={() =>
                appendOfferCard({
                  title: '',
                  description: '',
                  image: null,
                  couponCode: '',
                  showCouponCode: false,
                })
              }
              className="w-full sm:w-auto mt-4"
              variant="outline"
            >
              {t('form:button-label-add-offer-card')}
            </Button>
          )}
        </Card>
      </div>

      <div className="flex flex-wrap pb-8 my-5 border-b border-dashed border-border-base sm:my-8">
        <Description
          title={t('form:branding-settings')}
          details={t('form:branding-settings-helper-text')}
          className="w-full px-0 pb-5 sm:w-4/12 sm:py-8 sm:pe-4 md:w-1/3 md:pe-5"
        />

        <Card className="w-full sm:w-8/12 md:w-2/3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
            <Input
              label="Primary Color"
              {...register('primary_color')}
              type="color"
              variant="outline"
            />
            <Input
              label="Secondary Color"
              {...register('secondary_color')}
              type="color"
              variant="outline"
            />
          </div>
          <p className="text-sm text-gray-500">
            These two colors now control the dashboard theme and the public
            website styling.
          </p>
        </Card>
      </div>

      <div className="flex justify-end mt-6">
        <Button type="submit" loading={loading}>
          {t('form:button-label-save-settings')}
        </Button>
      </div>
    </form>
  );
}

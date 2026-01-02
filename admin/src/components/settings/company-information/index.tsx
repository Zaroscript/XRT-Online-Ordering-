import Card from '@/components/common/card';
import GooglePlacesAutocomplete from '@/components/form/google-places-autocomplete';
import { SaveIcon } from '@/components/icons/save';

import { companyValidationSchema } from '@/components/settings/company-information/company-validation-schema';
import Button from '@/components/ui/button';
import Description from '@/components/ui/description';
import Input from '@/components/ui/input';
import Label from '@/components/ui/label';
import PhoneNumberInput from '@/components/ui/phone-input';
import SelectInput from '@/components/ui/select-input';
import StickyFooterPanel from '@/components/ui/sticky-footer-panel';
import TextArea from '@/components/ui/text-area';
import TooltipLabel from '@/components/ui/tooltip-label';
import { useUpdateSettingsMutation } from '@/data/settings';

import {
  ContactDetailsInput,
  Settings,

  UserAddress,
} from '@/types';
import { useConfirmRedirectIfDirty } from '@/utils/confirmed-redirect-if-dirty';
import { formatAddress } from '@/utils/format-address';

import { yupResolver } from '@hookform/resolvers/yup';
import omit from 'lodash/omit';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import { Controller, useForm } from 'react-hook-form';

type CompanyInformationFormValues = {
  siteLink: string;
  copyrightText: string;
  externalText: string;
  externalLink: string;
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
};

type IProps = {
  settings?: Settings | null;
};



export default function CompanyInfoForm({ settings }: IProps) {
  const { mutate: updateSettingsMutation, isLoading: loading } =
    useUpdateSettingsMutation();
  const { t } = useTranslation();
  const { options } = settings ?? {};
  const isGoogleMapActive = options?.useGoogleMap;
  const { locale } = useRouter();
  // const isNotDefaultSettingsPage = Config.defaultLanguage !== locale;

  const {
    register,
    handleSubmit,
    control,
    getValues,
    reset,
    formState: { errors, dirtyFields },
  } = useForm<CompanyInformationFormValues>({
    shouldUnregister: true,
    //@ts-ignore
    resolver: yupResolver(companyValidationSchema),
    // @ts-ignore
    defaultValues: {
      ...options,
      contactDetails: {
        ...options?.contactDetails,
        socials: options?.contactDetails?.socials,
      },
    },
  });



  async function onSubmit(values: any) {
    const contactDetails = {
      ...values?.contactDetails,
      location: isGoogleMapActive
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
      //   @ts-ignore
      options: {
        ...options,
        ...values,
        contactDetails,
      },
    });
    reset(values, { keepValues: true });
  }
  const isDirty = Object.keys(dirtyFields).length > 0;
  useConfirmRedirectIfDirty({ isDirty });
  return (
    <form onSubmit={handleSubmit(onSubmit as any)}>
      <div className="flex flex-wrap pb-8 my-5 border-b border-gray-300 border-dashed sm:my-8 sm:mt-8 sm:mb-3">
        <Description
          title={t('form:footer-address')}
          details={t('form:footer-address-helper-text')}
          className="w-full px-0 pb-5 sm:w-4/12 sm:py-8 sm:pe-4 md:w-1/3 md:pe-5"
        />

        <Card className="w-full sm:w-8/12 md:w-2/3">
          {isGoogleMapActive ? (
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
          ) : (
            <div className="grid grid-cols-2 gap-4 mb-5">
              <Input
                label={t('text-city')}
                toolTipText={t('form:input-tooltip-company-city')}
                {...register('contactDetails.location.city')}
                error={t(errors.contactDetails?.location?.city!)}
                variant="outline"
              // disabled={isNotDefaultSettingsPage}
              />
              <Input
                label={t('text-country')}
                toolTipText={t('form:input-tooltip-company-country')}
                {...register('contactDetails.location.country')}
                error={t(errors.contactDetails?.location?.country!)}
                variant="outline"
              // disabled={isNotDefaultSettingsPage}
              />
              <Input
                label={t('text-state')}
                toolTipText={t('form:input-tooltip-company-state')}
                {...register('contactDetails.location.state')}
                error={t(errors.contactDetails?.location?.state!)}
                variant="outline"
              // disabled={isNotDefaultSettingsPage}
              />
              <Input
                label={t('text-zip')}
                toolTipText={t('form:input-tooltip-company-zip')}
                {...register('contactDetails.location.zip')}
                error={t(errors.contactDetails?.location?.zip!)}
                variant="outline"
              // disabled={isNotDefaultSettingsPage}
              />
              <TextArea
                label={t('text-street-address')}
                toolTipText={t('form:input-tooltip-company-street-address')}
                {...register('contactDetails.location.street_address')}
                error={t(errors.contactDetails?.location?.street_address!)}
                variant="outline"
                // disabled={isNotDefaultSettingsPage}
                className="col-span-full"
              />
            </div>
          )}
          <PhoneNumberInput
            label={t('form:input-label-contact')}
            toolTipText={t('form:input-tooltip-company-contact-number')}
            {...register('contactDetails.contact')}
            control={control}
            error={t(errors.contactDetails?.contact?.message!)}
          // disabled={isNotDefaultSettingsPage}
          />
          <Input
            label={t('form:input-label-website')}
            toolTipText={t('form:input-tooltip-company-website')}
            {...register('contactDetails.website')}
            variant="outline"
            className="mb-5"
            error={t(errors.contactDetails?.website?.message!)}
          // disabled={isNotDefaultSettingsPage}
          />
          <Input
            label={t('form:input-label-email')}
            toolTipText={t('form:input-tooltip-company-email')}
            {...register('contactDetails.emailAddress')}
            variant="outline"
            className="mb-5"
            error={t(errors.contactDetails?.emailAddress?.message!)}
          // disabled={isNotDefaultSettingsPage}
          />

        </Card>
      </div>
      <div className="flex flex-wrap pb-8 my-5 border-b border-dashed border-border-base">
        <Description
          title={t('form:form-title-footer-information')}
          details={t('form:site-info-footer-description')}
          className="w-full px-0 pb-5 sm:w-4/12 sm:py-8 sm:pe-4 md:w-1/3 md:pe-5"
        />

        <Card className="w-full sm:w-8/12 md:w-2/3">
          <Input
            label={t('form:input-label-site-link')}
            toolTipText={t('form:input-tooltip-company-site-link')}
            {...register('siteLink')}
            error={t(errors?.siteLink?.message!)}
            variant="outline"
            className="mb-5"
          />
          <Input
            label={t('form:input-label-copyright-text')}
            toolTipText={t('form:input-tooltip-company-copyright-text')}
            {...register('copyrightText')}
            error={t(errors?.copyrightText?.message!)}
            variant="outline"
            className="mb-5"
          />
          <Input
            label={t('form:input-label-external-text')}
            toolTipText={t('form:input-tooltip-company-external-text')}
            {...register('externalText')}
            error={t(errors?.externalText?.message!)}
            variant="outline"
            className="mb-5"
          />
          <Input
            label={t('form:input-label-external-link')}
            toolTipText={t('form:input-tooltip-company-external-link')}
            {...register('externalLink')}
            error={t(errors?.externalLink?.message!)}
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

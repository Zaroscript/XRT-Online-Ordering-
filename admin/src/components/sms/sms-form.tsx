import Input from '@/components/ui/input';
import { useForm } from 'react-hook-form';
import Button from '@/components/ui/button';
import Description from '@/components/ui/description';
import Card from '@/components/common/card';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import RichTextEditor from '@/components/ui/wysiwyg-editor/editor';
import { useCreateSmsCampaignMutation, useUpdateSmsCampaignMutation } from '@/data/sms';
import AudienceFilter from '@/components/emails/audience-filter';

const smsValidationSchema = yup.object().shape({
  filters: yup.array().of(
    yup.object().shape({
      rule: yup.object().nullable(),
      value: yup.mixed().nullable(),
    })
  ).default([]),
  subject: yup.string().required('form:error-subject-required'),
  body: yup.string().required('form:error-body-required'),
  marketing_consent_only: yup.boolean().default(true),
});

type FormValues = yup.InferType<typeof smsValidationSchema>;

const defaultValues: FormValues = {
  filters: [],
  subject: '',
  body: '',
  marketing_consent_only: true,
};

type FormProps = {
  initialValues?: any;
};

export default function CreateSmsForm({ initialValues }: FormProps) {
  const router = useRouter();
  const { t } = useTranslation();
  const { mutate: createCampaign, isPending: creating } = useCreateSmsCampaignMutation();
  const { mutate: updateCampaign, isPending: updating } = useUpdateSmsCampaignMutation();

  const isUpdating = !!initialValues;

  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    shouldUnregister: true,
    resolver: yupResolver(smsValidationSchema),
    defaultValues: initialValues
      ? {
          ...initialValues,
          subject: initialValues.subject || '',
          body: initialValues.body || '',
          filters: initialValues.filters || [],
          marketing_consent_only: initialValues.marketing_consent_only ?? true,
        }
      : defaultValues,
  });

  const marketingConsentOnly = watch('marketing_consent_only');

  const onSubmit = (values: FormValues) => {
    const payload = {
      subject: values.subject,
      body: values.body,
      marketing_consent_only: values.marketing_consent_only ?? true,
      filters: (values.filters || []) as any,
    };

    if (isUpdating) {
      updateCampaign({ id: initialValues.id, ...payload });
    } else {
      createCampaign(payload);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="my-5 flex flex-wrap sm:my-8">
        <Description
          title={t('form:item-description')}
          details={t('form:sms-form-info-help-text')}
          className="w-full px-0 pb-5 sm:w-4/12 sm:py-8 sm:pe-4 md:w-1/3 md:pe-5"
        />

        <Card className="w-full sm:w-8/12 md:w-2/3">
          {/* Audience Filter — reused from emails */}
          <AudienceFilter
            control={control}
            register={register}
            errors={errors}
            targetType="sms"
            countPayload={{ marketing_consent_only: marketingConsentOnly ?? true }}
          />

          {/* SMS Subject / Title */}
          <Input
            label={t('form:input-label-sms-subject')}
            {...register('subject')}
            error={errors.subject?.message ? t(errors.subject.message) : undefined}
            variant="outline"
            className="mb-5"
          />

          {/* SMS Body — rich text editor (same as email) */}
          <div className="mb-5">
            <RichTextEditor
              title={t('form:input-label-sms-body')}
              control={control}
              name="body"
              error={errors.body?.message ? t(errors.body.message) : undefined}
              className="mb-12"
            />
          </div>

          <label className="flex items-start gap-3 rounded-md border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-body">
            <input
              type="checkbox"
              {...register('marketing_consent_only')}
              className="mt-1 h-4 w-4 rounded border-gray-300 text-accent focus:ring-accent"
            />
            <span className="leading-6">
              Send only to filtered customers who accepted marketing emails and text messages.
            </span>
          </label>
        </Card>
      </div>

      <div className="mb-4 text-end">
        <Button
          variant="outline"
          onClick={router.back}
          className="me-4"
          type="button"
        >
          {t('form:button-label-back')}
        </Button>
        <Button loading={creating || updating}>
          {isUpdating ? t('form:button-label-update') : t('form:button-label-send-sms')}
        </Button>
      </div>
    </form>
  );
}

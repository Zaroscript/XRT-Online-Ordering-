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
import { useCreateEmailCampaignMutation, useUpdateEmailCampaignMutation } from '@/data/emails';
import AudienceFilter from './audience-filter';

const emailValidationSchema = yup.object().shape({
  filters: yup.array().of(
    yup.object().shape({
      rule: yup.object().nullable(),
      value: yup.mixed().nullable(),
    })
  ).default([]),
  heading: yup.string().required('form:error-heading-required'),
  subject: yup.string().required('form:error-subject-required'),
  body: yup.string().required('form:error-body-required'),
  marketing_consent_only: yup.boolean().default(true),
});

type FormValues = yup.InferType<typeof emailValidationSchema>;

const defaultValues = {
  filters: [],
  heading: '',
  subject: '',
  body: '',
  marketing_consent_only: true,
};

type FormProps = {
  initialValues?: any;
};

export default function CreateEmailForm({ initialValues }: FormProps) {
  const router = useRouter();
  const { t } = useTranslation();
  const { mutate: createCampaign, isPending: creating } = useCreateEmailCampaignMutation();
  const { mutate: updateCampaign, isPending: updating } = useUpdateEmailCampaignMutation();

  const isUpdating = !!initialValues;

  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    shouldUnregister: true,
    resolver: yupResolver(emailValidationSchema),
    defaultValues: initialValues
      ? {
          ...initialValues,
          heading: initialValues.heading || '',
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
      heading: values.heading,
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
          details={t('form:email-form-info-help-text')}
          className="w-full px-0 pb-5 sm:w-4/12 sm:py-8 sm:pe-4 md:w-1/3 md:pe-5"
        />

        <Card className="w-full sm:w-8/12 md:w-2/3">
          {/* Audience Filter (Target Audience) */}
          <AudienceFilter
            control={control}
            register={register}
            errors={errors}
            targetType="email"
            countPayload={{ marketing_consent_only: marketingConsentOnly ?? true }}
          />

          <Input
            label={t('form:input-label-subject')}
            {...register('subject')}
            error={t(errors.subject?.message!)}
            variant="outline"
            className="mb-5"
          />

          <Input
            label={t('form:input-label-heading')}
            {...register('heading')}
            error={t(errors.heading?.message!)}
            variant="outline"
            className="mb-5"
          />

          <div className="mb-5">
            <RichTextEditor
              title={t('form:input-label-body')}
              control={control}
              name="body"
              error={t(errors.body?.message!)}
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
          {isUpdating ? t('form:button-label-update') : t('form:button-label-create-email')}
        </Button>
      </div>
    </form>
  );
}

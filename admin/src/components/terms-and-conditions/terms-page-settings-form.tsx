import Card from '@/components/common/card';
import Button from '@/components/ui/button';
import Description from '@/components/ui/description';
import Input from '@/components/ui/input';
import RichTextEditor from '@/components/ui/wysiwyg-editor/editor';
import { useUpdateSettingsMutation } from '@/data/settings';
import { Settings } from '@/types';
import { yupResolver } from '@hookform/resolvers/yup';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import * as yup from 'yup';

type FormValues = {
  termsPage: {
    title: string;
    body: string;
  };
};

function hasVisibleRichTextContent(value: string | undefined) {
  return Boolean(
    value
      ?.replace(/<[^>]*>/g, ' ')
      .replace(/&nbsp;/gi, ' ')
      .replace(/\s+/g, ' ')
      .trim(),
  );
}

const validationSchema = yup.object({
  termsPage: yup.object({
    title: yup.string().trim().required('Terms title is required'),
    body: yup
      .string()
      .required('Terms content is required')
      .test(
        'terms-body-content',
        'Terms content is required',
        (value) => hasVisibleRichTextContent(value),
      ),
  }),
});

type Props = {
  settings: Settings;
};

export default function TermsPageSettingsForm({ settings }: Props) {
  const { t } = useTranslation();
  const { locale } = useRouter();
  const { mutate: updateSettingsMutation, isPending: loading } =
    useUpdateSettingsMutation();

  const options = settings?.options ?? {};

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: yupResolver(validationSchema) as any,
    defaultValues: {
      termsPage: {
        title: options?.termsPage?.title ?? 'Terms & Conditions',
        body: options?.termsPage?.body ?? '',
      },
    },
  });

  useEffect(() => {
    reset({
      termsPage: {
        title: options?.termsPage?.title ?? 'Terms & Conditions',
        body: options?.termsPage?.body ?? '',
      },
    });
  }, [options?.termsPage?.body, options?.termsPage?.title, reset]);

  function onSubmit(values: FormValues) {
    updateSettingsMutation(
      {
        language: locale!,
        options: {
          ...options,
          termsPage: {
            title: values.termsPage.title.trim(),
            body: values.termsPage.body,
          },
        },
      },
      {
        onSuccess: (data: any) => {
          const savedOptions = data?.options ?? data;
          reset({
            termsPage: {
              title: savedOptions?.termsPage?.title ?? 'Terms & Conditions',
              body: savedOptions?.termsPage?.body ?? '',
            },
          });
        },
      },
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit as any)}>
      <div className="flex flex-wrap pb-8 my-5 border-b border-dashed border-border-base sm:my-8">
        <Description
          title="Terms Page"
          details="Control the public website terms and conditions page from this single form. Changes here update the website content and footer link destination."
          className="w-full px-0 pb-5 sm:w-4/12 sm:py-8 sm:pe-4 md:w-1/3 md:pe-5"
        />

        <Card className="w-full space-y-5 sm:w-8/12 md:w-2/3">
          <Input
            label="Page Title"
            {...register('termsPage.title')}
            variant="outline"
            error={errors?.termsPage?.title?.message}
          />

          <RichTextEditor
            title="Page Content"
            toolTipText="This content is shown on the storefront terms and conditions page."
            control={control}
            name="termsPage.body"
            editorClassName="min-h-[22rem]"
            error={errors?.termsPage?.body?.message}
          />

        
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

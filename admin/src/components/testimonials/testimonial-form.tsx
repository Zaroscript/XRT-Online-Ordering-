import Input from '@/components/ui/input';
import TextArea from '@/components/ui/text-area';
import Button from '@/components/ui/button';
import Card from '@/components/common/card';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'next-i18next';
import Description from '@/components/ui/description';
import SwitchInput from '@/components/ui/switch-input';
import Label from '@/components/ui/label';
import {
  useCreateTestimonialMutation,
  useUpdateTestimonialMutation,
} from '@/data/testimonial';
import FileInput from '@/components/ui/file-input';

type FormValues = {
  name: string;
  feedback: string;
  role: string;
  image: any;
  is_active: boolean;
};

const defaultValues: FormValues = {
  name: '',
  feedback: '',
  role: '',
  image: '',
  is_active: true,
};

type IProps = {
  initialValues?: any;
};

export default function CreateOrUpdateTestimonialForm({
  initialValues,
}: IProps) {
  const { t } = useTranslation();
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: initialValues
      ? {
          name: initialValues.name,
          feedback: initialValues.feedback,
          role: initialValues.role,
          image: initialValues.image ?? '',
          is_active: initialValues.is_active ?? true,
        }
      : defaultValues,
  });

  const { mutate: createTestimonial, isPending: creating } =
    useCreateTestimonialMutation();
  const { mutate: updateTestimonial, isPending: updating } =
    useUpdateTestimonialMutation();

  const onSubmit = (values: FormValues) => {
    const input = {
      name: values.name,
      feedback: values.feedback,
      role: values.role,
      image: values.image?.thumbnail ?? values.image ?? '',
      is_active: values.is_active,
    };

    if (initialValues) {
      updateTestimonial({ id: initialValues.id, ...input });
    } else {
      createTestimonial(input);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="my-5 flex flex-wrap sm:my-8">
        <Description
          title={t('form:form-title-testimonial-info')}
          details={t('form:form-description-testimonial-info')}
          className="w-full px-0 pb-5 sm:w-4/12 sm:py-8 sm:pe-4 md:w-1/3 md:pe-5"
        />
        <Card className="w-full sm:w-8/12 md:w-2/3">
          <Input
            label={t('form:input-label-testimonial-name')}
            {...register('name', {
              required: t('form:error-name-required') as string,
            })}
            error={t(errors.name?.message!)}
            variant="outline"
            className="mb-5"
          />

          <Input
            label={t('form:input-label-testimonial-role')}
            {...register('role', {
              required: t('form:error-role-required') as string,
            })}
            error={t(errors.role?.message!)}
            variant="outline"
            className="mb-5"
          />

          <TextArea
            label={t('form:input-label-testimonial-feedback')}
            {...register('feedback', {
              required: t('form:error-description-required') as string,
            })}
            error={t(errors.feedback?.message!)}
            variant="outline"
            className="mb-5"
          />

          <div className="mb-5">
            <Label>{t('form:input-label-testimonial-image')}</Label>
            <FileInput name="image" control={control} multiple={false} />
          </div>

          <div className="mb-5">
            <div className="flex items-center gap-x-4">
              <SwitchInput name="is_active" control={control} />
              <Label className="mb-0">{t('common:text-active')}</Label>
            </div>
          </div>
        </Card>
      </div>

      <div className="mb-4 text-end">
        <Button loading={creating || updating} disabled={creating || updating}>
          {initialValues
            ? t('form:button-label-update-testimonial')
            : t('form:button-label-add-testimonial')}
        </Button>
      </div>
    </form>
  );
}

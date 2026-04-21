import Input from '@/components/ui/input';
import Button from '@/components/ui/button';
import Description from '@/components/ui/description';
import Card from '@/components/common/card';
import { useUpdateProfileMutation } from '@/data/user';
import TextArea from '@/components/ui/text-area';
import { useTranslation } from 'next-i18next';
import FileInput from '@/components/ui/file-input';
import pick from 'lodash/pick';
import { profileValidationSchema } from './profile-validation-schema';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';

type FormValues = {
  name: string;
  profile: {
    bio: string;
    contact: string;
    avatar: {
      thumbnail: string;
      original: string;
      id: string;
    };
  };
};

export default function ProfileUpdate({ me }: any) {
  const { t } = useTranslation();
  const { mutate: updateProfile, isPending: loading } = useUpdateProfileMutation();
  
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<FormValues>({
    //@ts-ignore
    resolver: yupResolver(profileValidationSchema),
    defaultValues: {
      ...(me &&
        pick(me, [
          'name',
          'profile.bio',
          'profile.contact',
          'profile.avatar',
        ])),
    },
  });

  const onSubmit = async (values: any) => {
    const { name, profile } = values;
    updateProfile({
      input: {
        name: name,
        profile: {
          ...me?.profile,
          bio: profile?.bio,
          contact: profile?.contact,
          avatar: profile?.avatar,
        },
      },
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit as any)} noValidate>
      <div className="flex flex-wrap pb-8 my-5 border-b border-dashed border-border-base sm:my-8">
        <Description
          title={t('form:input-label-avatar')}
          details={t('form:avatar-help-text')}
          className="w-full px-0 pb-5 sm:w-4/12 sm:py-8 sm:pe-4 md:w-1/3 md:pe-5"
        />

        <Card className="w-full sm:w-8/12 md:w-2/3">
          <FileInput name="profile.avatar" control={control} multiple={false} />
        </Card>
      </div>

      <div className="flex flex-wrap pb-8 my-5 border-b border-dashed border-border-base sm:my-8">
        <Description
          title={t('form:form-title-information')}
          details={t('form:profile-info-help-text')}
          className="w-full px-0 pb-5 sm:w-4/12 sm:py-8 sm:pe-4 md:w-1/3 md:pe-5"
        />

        <Card className="w-full mb-5 sm:w-8/12 md:w-2/3">
          <Input
            label={t('form:input-label-name')}
            {...register('name')}
            error={t(errors.name?.message!)}
            variant="outline"
            className="mb-5"
          />
          <TextArea
            label={t('form:input-label-bio')}
            {...register('profile.bio')}
            error={t(errors.profile?.bio?.message!)}
            variant="outline"
            className="mb-6"
          />
          <Input
            label={t('form:input-label-contact')}
            {...register('profile.contact')}
            error={t(errors.profile?.contact?.message!)}
            variant="outline"
            placeholder="+1234567890"
          />
        </Card>
      </div>

      <div className="flex flex-wrap pb-8 my-5 border-b border-dashed border-border-base sm:my-8">
        <div className="w-full text-end">
          <Button loading={loading} disabled={loading} className="bg-accent hover:bg-accent-hover">
            {t('form:button-label-save')}
          </Button>
        </div>
      </div>
    </form>
  );
}

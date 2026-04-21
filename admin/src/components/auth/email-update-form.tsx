import Input from '@/components/ui/input';
import { useForm } from 'react-hook-form';
import Button from '@/components/ui/button';
import { useUpdateProfileMutation } from '@/data/user';
import { useTranslation } from 'next-i18next';
import pick from 'lodash/pick';
import Description from '@/components/ui/description';
import Card from '@/components/common/card';
import SwitchInput from '@/components/ui/switch-input';
import Label from '@/components/ui/label';
import { adminOnly, hasAccess, getAuthCredentials } from '@/utils/auth-utils';

type FormValues = {
  email: string;
  profile: {
    notifications: {
      email: string;
      enable: boolean;
    };
  };
};

export default function AccountSettingsForm({ me }: any) {
  const { t } = useTranslation();
  const { mutate: updateProfile, isPending: loading } = useUpdateProfileMutation();
  const { permissions } = getAuthCredentials();
  let permission = hasAccess(adminOnly, permissions);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      ...(me && pick(me, ['email'])),
      profile: {
        notifications: {
          email: me?.profile?.notifications?.email ?? me?.email,
          enable: me?.profile?.notifications?.enable ?? false,
        },
      },
    },
  });

  async function onSubmit(values: any) {
    updateProfile({
      input: {
        email: values.email,
        profile: {
          ...me?.profile,
          notifications: values.profile.notifications,
        },
      },
    });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <div className="my-5 flex flex-wrap border-b border-dashed border-border-base pb-8 sm:my-8">
        <Description
          title={t('common:text-email')}
          details={t('form:email-change-helper-text')}
          className="sm:pe-4 md:pe-5 w-full px-0 pb-5 sm:w-4/12 sm:py-8 md:w-1/3"
        />

        <Card className="mb-5 w-full sm:w-8/12 md:w-2/3">
          <Input
            label={t('form:input-label-email')}
            {...register('email')}
            error={t(errors.email?.message!)}
            variant="outline"
            className="mb-5"
          />
        </Card>
      </div>

      {permission && (
        <div className="my-5 flex flex-wrap border-b border-dashed border-border-base pb-8 sm:my-8">
          <Description
            title={t('form:form-notification-title')}
            details={t('form:form-notification-description')}
            className="sm:pe-4 md:pe-5 w-full px-0 pb-5 sm:w-4/12 sm:py-8 md:w-1/3"
          />

          <Card className="mb-5 w-full sm:w-8/12 md:w-2/3">
            <Input
              label={t('form:input-notification-email')}
              {...register('profile.notifications.email')}
              error={t(errors?.profile?.notifications?.email?.message!)}
              variant="outline"
              className="mb-5"
              type="email"
            />
            <div className="flex items-center gap-x-4">
              <SwitchInput
                name="profile.notifications.enable"
                control={control}
              />
              <Label className="!mb-0.5">
                {t('form:input-enable-notification')}
              </Label>
            </div>
          </Card>
        </div>
      )}

      <div className="text-end w-full">
        <Button loading={loading} disabled={loading} className="bg-accent hover:bg-accent-hover">
          {t('form:button-label-save')}
        </Button>
      </div>
    </form>
  );
}

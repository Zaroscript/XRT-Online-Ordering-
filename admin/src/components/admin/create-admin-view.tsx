import Button from '@/components/ui/button';
import Input from '@/components/ui/input';
import Label from '@/components/ui/label';
import PasswordInput from '@/components/ui/password-input';
import Select from '@/components/ui/select/select';
import { useRolesQuery } from '@/data/role';
import { useCreateUserMutation } from '@/data/user';
import { useModalAction } from '@/components/ui/modal/modal.context';
import { useTranslation } from 'next-i18next';
import { useForm, Controller, useWatch } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { Role } from '@/types';
import { customerValidationSchema } from '@/components/user/user-validation-schema';
import { CheckMarkCircle } from '@/components/icons/checkmark-circle';

const CreateAdminView = () => {
  const { t } = useTranslation(['form', 'common']);
  const { closeModal } = useModalAction();
  const { mutate: createUser, isLoading } = useCreateUserMutation();
  const { roles, loading: loadingRoles } = useRolesQuery({ limit: 100 });

  const {
    register: registerField,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: '',
      email: '',
      password: '',
      role: null as any,
    },
    resolver: yupResolver(customerValidationSchema),
  });

  const passwordValue = useWatch({
    control,
    name: 'password',
  });

  const rules = [
    {
      label: t('input-label-password-rule-length'),
      valid: (passwordValue?.length || 0) >= 8,
    },
    {
      label: t('input-label-password-rule-uppercase'),
      valid: /[A-Z]/.test(passwordValue || ''),
    },
    {
      label: t('input-label-password-rule-lowercase'),
      valid: /[a-z]/.test(passwordValue || ''),
    },
    {
      label: t('input-label-password-rule-number'),
      valid: /[0-9]/.test(passwordValue || ''),
    },
  ];

  const roleOptions = roles?.map((role: Role) => ({
    label: role.displayName,
    value: role.name,
  }));

  function onSubmit(values: any) {
    const { name, email, password, role } = values;

    const selectedRole = roles?.find((r: Role) => r.name === role.value);
    const permissions = selectedRole?.permissions || [];

    const userData = {
      name,
      email,
      password,
      role: role.value,
      permissions,
    };

    createUser(userData, {
      onSuccess: () => {
        closeModal();
      },
    });
  }

  return (
    <div className="p-5 bg-light sm:p-8 min-w-[350px] sm:min-w-[450px] max-w-lg rounded">
      <h1 className="mb-4 text-center font-semibold text-heading sm:mb-6 text-xl">
        {t('form-title-create-admin')}
      </h1>
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <Input
          label={t('input-label-name')}
          {...registerField('name')}
          error={t(errors.name?.message!)}
          variant="outline"
          className="mb-5"
        />
        <Input
          label={t('input-label-email')}
          type="email"
          {...registerField('email')}
          error={t(errors.email?.message!)}
          variant="outline"
          className="mb-5"
        />
        <PasswordInput
          label={t('input-label-password')}
          {...registerField('password')}
          error={t(errors.password?.message!)}
          className="mb-4"
        />

        <div className="mb-6 grid grid-cols-1 gap-2 sm:grid-cols-2">
          {rules.map((rule, idx) => (
            <div key={idx} className="flex items-center text-xs">
              {rule.valid ? (
                <CheckMarkCircle className="w-4 h-4 text-accent me-2 flex-shrink-0" />
              ) : (
                <div className="w-4 h-4 rounded-full border border-gray-300 flex items-center justify-center me-2 flex-shrink-0">
                  <div className="w-1.5 h-1.5 rounded-full bg-gray-300" />
                </div>
              )}
              <span className={rule.valid ? 'text-accent font-medium' : 'text-body-dark'}>
                {rule.label}
              </span>
            </div>
          ))}
        </div>

        <div className="mb-5">
          <Label>{t('input-label-role')}</Label>
          <Controller
            name="role"
            control={control}
            render={({ field }) => (
              <Select
                {...field}
                options={roleOptions}
                isLoading={loadingRoles}
                placeholder={t('input-placeholder-role')}
              />
            )}
          />
          {errors.role && (
            <p className="my-2 text-xs text-red-500 text-start">
              {t(errors.role?.message!)}
            </p>
          )}
        </div>

        <Button className="w-full" loading={isLoading} disabled={isLoading}>
          {t('button-label-create-admin')}
        </Button>
      </form>
    </div>
  );
};

export default CreateAdminView;

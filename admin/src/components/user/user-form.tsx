import Select from '@/components/ui/select/select';
import Card from '@/components/common/card';
import Description from '@/components/ui/description';
import Button from '@/components/ui/button';
import Input from '@/components/ui/input';
import PasswordInput from '@/components/ui/password-input';
import StickyFooterPanel from '@/components/ui/sticky-footer-panel';
import Label from '@/components/ui/label';
import { useRolesQuery } from '@/data/role';
import { useRegisterMutation, useUpdateUserMutation } from '@/data/user';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { CheckMarkCircle } from '@/components/icons/checkmark-circle';
import { useState } from 'react';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import { yupResolver } from '@hookform/resolvers/yup';
import { User, Role } from '@/types';
import {
  customerUpdateValidationSchema,
  customerValidationSchema,
} from './user-validation-schema';
import { Routes } from '@/config/routes';
import { getIcon } from '@/utils/get-icon';
import * as socialIcons from '@/components/icons/social';
import { socialIcon } from '@/settings/site.settings';
import SelectInput from '@/components/ui/select-input';
import { useFieldArray } from 'react-hook-form';

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

type FormValues = {
  name: string;
  email: string;
  password?: string;
  passwordConfirmation?: string;
  role?: any;
  profile?: {
    socials: {
      icon: any;
      url: string;
    }[];
  };
};

const defaultValues = {
  email: '',
  password: '',
  name: '',
  role: '',
  profile: {
    socials: [],
  },
};

type UserFormProps = {
  initialValues?: User | null;
};

const UserForm = ({ initialValues }: UserFormProps) => {
  const { t } = useTranslation(['form', 'common']);
  const router = useRouter();
  const { mutate: registerUser, isLoading: creating } = useRegisterMutation();
  const { mutate: updateUser, isLoading: updating } = useUpdateUserMutation();
  const { roles, loading: loadingRoles } = useRolesQuery({ limit: 100 });
  const [showOldPassword, setShowOldPassword] = useState(false);

  const isNew = !initialValues;
  const isLoading = creating || updating;

  const {
    register,
    handleSubmit,
    setError,
    control,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: initialValues
      ? {
        name: initialValues.name,
        email: initialValues.email,
        password: '',
        role: initialValues.role
          ? {
            label:
              initialValues.role === 'super_admin'
                ? t('common:text-super-admin')
                : initialValues.role === 'client'
                  ? t('common:text-client')
                  : initialValues.role, // Display role string if custom
            value: initialValues.role,
          }
          : { label: t('common:text-client'), value: 'client' },
        profile: {
          socials: initialValues?.profile?.socials
            ? initialValues?.profile?.socials.map((social: any) => ({
              icon: updatedIcons?.find((icon) => icon?.value === social?.type),
              url: social?.link,
            }))
            : [],
        },
      }
      : { ...defaultValues, role: { label: t('common:text-client'), value: 'client' } },
    resolver: yupResolver(
      isNew ? customerValidationSchema : customerUpdateValidationSchema,
    ),
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

  const {
    fields: socialFields,
    append: socialAppend,
    remove: socialRemove,
  } = useFieldArray({
    control,
    name: 'profile.socials',
  });

  const roleOptions = [
    { label: t('common:text-super-admin'), value: 'super_admin' },
    { label: t('common:text-client'), value: 'client' },
    ...(roles?.map((role: Role) => ({
      label: role.displayName,
      value: role.id,
    })) || []),
  ];

  async function onSubmit(values: FormValues) {
    const { name, email, password, role } = values;
    const roleValue = role?.value;

    const input = {
      name,
      email,
      password: password || undefined,
      role: roleValue, // Just send the value (ID or 'client'/'super_admin')
      permissions: undefined, // Let backend handle permissions based on role lookup if implemented, or just empty?
      // Previous code cleared permissions if custom role.
      // Now backend `User` model doesn't auto-fetch permissions from Role ID unless I implement it.
      // The user's request was "depend on the role property".
      // If `roleValue` is an ID, and I passed it, backend saves it as string.
      // Permissions are NOT automatic anymore unless backend implements it.
      // I will send `roleValue` as is.
      profile: {
        ...(initialValues?.profile?.id && { id: initialValues.profile.id }),
        socials: values?.profile?.socials
          ? values?.profile?.socials?.map((social: any) => ({
            type: social?.icon?.value,
            link: social?.url,
          }))
          : [],
      },
    };

    if (isNew) {
      registerUser(
        { ...input, password: password as string } as any,
        {
          onError: (error: any) => {
            Object.keys(error?.response?.data).forEach((field: any) => {
              setError(field, {
                type: 'manual',
                message: error?.response?.data[field][0],
              });
            });
          },
          onSuccess: (data) => {
            if (data) {
              router.push(Routes.user.list);
            }
          },
        });
    } else {
      updateUser(
        {
          id: initialValues?.id as string,
          input: input as any,
        },
        {
          onError: (error: any) => {
            // Handle Errors
          },
          onSuccess: (data) => {
            router.push(Routes.adminList);
          },
        },
      );
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit as any)} noValidate>
      <div className="my-5 flex flex-wrap sm:my-8">
        <Description
          title={t('form-title-information')}
          details={t('form:customer-form-info-help-text')}
          className="w-full px-0 pb-5 sm:w-4/12 sm:py-8 sm:pe-4 md:w-1/3 md:pe-5"
        />

        <Card className="w-full sm:w-8/12 md:w-2/3">
          <Input
            label={t('form:input-label-name')}
            {...register('name')}
            type="text"
            variant="outline"
            className="mb-4"
            error={t(errors.name?.message!)}
            required
          />
          <Input
            label={t('form:input-label-email')}
            {...register('email')}
            type="email"
            variant="outline"
            className="mb-4"
            error={t(errors.email?.message!)}
            required
          />
          {!isNew && (
            <div className="mb-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowOldPassword(!showOldPassword)}
                className="mb-2"
              >
                {t('input-label-show-old-password')}
              </Button>
              {showOldPassword && (
                <Input
                  {...register('oldPassword' as any)}
                  label={t('input-label-password-hash')}
                  defaultValue={(initialValues as any)?.password}
                  disabled
                  variant="outline"
                />
              )}
            </div>
          )}
          <PasswordInput
            label={isNew ? t('input-label-password') : t('input-label-update-password')}
            {...register('password')}
            error={t(errors.password?.message!)}
            variant="outline"
            className="mb-4"
            required={isNew}
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

          <PasswordInput
            label={t('input-label-confirm-password')}
            {...register('passwordConfirmation')}
            error={t(errors.passwordConfirmation?.message!)}
            variant="outline"
            className="mb-4"
          />

          <div className="mb-4">
            <Label>{t('input-label-role')}</Label>
            <Controller
              name="role"
              control={control}
              render={({ field }) => (
                <Select
                  {...field}
                  isLoading={loadingRoles}
                  options={roleOptions}
                  isClearable={false}
                />
              )}
            />
            {/* Add error handling for role if needed */}
          </div>
        </Card>
      </div>
      <div className="my-5 flex flex-wrap sm:my-8">
        <Description
          title={t('form:social-settings')}
          details={t('form:social-settings-helper-text')}
          className="w-full px-0 pb-5 sm:w-4/12 sm:py-8 sm:pe-4 md:w-1/3 md:pe-5"
        />

        <Card className="w-full sm:w-8/12 md:w-2/3">
          <div>
            {socialFields.map((item: any, index: number) => (
              <div
                className="py-5 border-b border-dashed border-border-200 first:mt-0 first:border-t-0 first:pt-0 last:border-b-0 md:py-8 md:first:mt-0"
                key={item.id}
              >
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-5">
                  <div className="sm:col-span-2">
                    <Label>{t('form:input-label-select-platform')}</Label>
                    <SelectInput
                      name={`profile.socials.${index}.icon` as const}
                      control={control}
                      options={updatedIcons}
                      isClearable={true}
                      defaultValue={item?.icon!}
                    />
                  </div>
                  <Input
                    className="sm:col-span-2"
                    label={t('form:input-label-url')}
                    variant="outline"
                    {...register(`profile.socials.${index}.url` as const)}
                    defaultValue={item.url!}
                  />
                  <button
                    onClick={() => socialRemove(index)}
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
            onClick={() => socialAppend({ icon: '', url: '' })}
            className="w-full text-sm sm:w-auto md:text-base"
          >
            {t('form:button-label-add-social')}
          </Button>
        </Card>
      </div>

      <StickyFooterPanel className="z-0">
        <div className="mb-4 text-end">
          <Button
            variant="outline"
            onClick={() => router.back()}
            className="me-4"
            type="button"
          >
            {t('form:button-label-back')}
          </Button>
          <Button loading={isLoading} disabled={isLoading}>
            {initialValues
              ? t('form:button-label-update-user')
              : t('form:button-label-create-customer')}
          </Button>
        </div>
      </StickyFooterPanel>
    </form>
  );
};

export default UserForm;

import { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useTranslation } from 'next-i18next';
import {
  useModalAction,
  useModalState,
} from '@/components/ui/modal/modal.context';
import { useUpdateUserMutation, useUserQuery } from '@/data/user';
import { useRolesQuery, useAssignRoleMutation, useRemoveRoleMutation } from '@/data/role';
import Select from '@/components/ui/select/select';
import Label from '@/components/ui/label';
import Button from '@/components/ui/button';
import Loader from '@/components/ui/loader/loader';

type FormValues = {
  role: any;
};

const UserRoleAssignmentView = () => {
  const { t } = useTranslation();
  const { data: userId } = useModalState();
  const { closeModal } = useModalAction();
  const { mutate: assignRole, isLoading: assigning } = useAssignRoleMutation();
  const { mutate: removeRole, isLoading: removing } = useRemoveRoleMutation();
  const { roles, loading: loadingRoles } = useRolesQuery({ limit: 100 });
  const { data: user, isLoading: loadingUser } = useUserQuery({ id: userId });

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      role: null,
    },
  });

  useEffect(() => {
    if (user) {
      if (user.customRole) {
        setValue('role', {
          label: user.customRole.displayName,
          value: user.customRole.id,
        });
      } else if (user.role) {
        setValue('role', {
          label: user.role === 'super_admin' ? 'Super Admin' : 'Client',
          value: user.role,
        });
      }
    }
  }, [user, setValue]);

  const roleOptions = [
    { label: 'Client', value: 'client' },
    ...(roles?.map((role: any) => ({
      label: role.displayName,
      value: role.id,
    })) || []),
  ];

  async function onSubmit({ role }: FormValues) {
    const roleValue = role?.value;

    // For now, we only support assigning Custom Roles or removing them (setting to Client)
    // Super Admin assignment should probably remain separate or be explicitly handled if needed.
    // Assuming 'client' means removing any custom role.

    if (roleValue === 'client') {
      removeRole(
        { userId },
        {
          onSuccess: () => closeModal(),
        },
      );
    } else {
      // It's a custom role ID
      assignRole(
        { userId, roleId: roleValue },
        {
          onSuccess: () => closeModal(),
        },
      );
    }
  }

  const updating = assigning || removing;

  if (loadingUser) {
    return <Loader text={t('common:text-loading')} />;
  }

  return (
    <div className="p-5 bg-light sm:p-8">
      <h1 className="mb-4 text-center font-semibold text-heading">
        {t('common:text-assign-role')}
      </h1>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="mb-5">
          <Label>{t('form:input-label-role')}</Label>
          <Controller
            name="role"
            control={control}
            rules={{ required: t('form:error-role-required') }}
            render={({ field }) => (
              <Select
                {...field}
                isLoading={loadingRoles}
                options={roleOptions}
                isClearable={false}
              />
            )}
          />
          {errors.role && (
            <p className="text-red-500 text-xs mt-1">{errors.role.message}</p>
          )}
        </div>

        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={closeModal} type="button">
            {t('form:button-label-cancel')}
          </Button>
          <Button loading={updating} disabled={updating}>
            {t('form:button-label-assign')}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default UserRoleAssignmentView;

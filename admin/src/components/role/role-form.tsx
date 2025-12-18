import { useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { useQueryClient } from 'react-query';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { toast } from 'react-toastify';
import Input from '@/components/ui/input';
import Button from '@/components/ui/button';
import Description from '@/components/ui/description';
import Card from '@/components/common/card';
import Label from '@/components/ui/label';
import Checkbox from '@/components/ui/checkbox/checkbox';
import {
  useCreateRoleMutation,
  useUpdateRoleMutation,
  usePermissionsQuery,
} from '@/data/role';
import { Role } from '@/types';

type FormValues = {
  name: string;
  displayName: string;
  description: string;
  permissions: string[];
};

const roleValidationSchema: yup.ObjectSchema<FormValues> = yup.object().shape({
  name: yup.string().required('form:error-role-name-required'),
  displayName: yup.string().required('form:error-role-display-name-required'),
  description: yup.string().required(),
  permissions: yup
    .array()
    .of(yup.string().defined())
    .min(1, 'form:error-role-permissions-required')
    .required(),
});

type IProps = {
  initialValues?: Role | null;
};

type PermissionsResponse = {
  status: string;
  data: {
    permissions: string[];
  };
};

export default function RoleForm({ initialValues }: IProps) {
  const router = useRouter();
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  // Success and error callbacks for mutations
  const onSuccess = () => {
    toast.success(
      t(initialValues ? 'common:update-success' : 'common:create-success'),
    );
    queryClient.invalidateQueries('roles');
    router.push('/roles');
  };

  const onError = (error: any) => {
    toast.error(
      error?.response?.data?.message || t('common:error-something-wrong'),
    );
  };

  const { mutate: createRole, isLoading: creating } = useCreateRoleMutation();
  const { mutate: updateRole, isLoading: updating } = useUpdateRoleMutation();
  const { data: permissionsData, isLoading: loadingPermissions } =
    usePermissionsQuery();

  // Memoize permissions to prevent unnecessary re-renders
  const permissions = useMemo(() => permissionsData || [], [permissionsData]);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      name: initialValues?.name || '',
      displayName: initialValues?.displayName || '',
      description: initialValues?.description || '',
      permissions: initialValues?.permissions || [],
    },
    resolver: yupResolver<FormValues>(roleValidationSchema),
  });

  const onSubmit = (values: any) => {
    if (initialValues?.id) {
      updateRole({
        id: initialValues.id,
        input: values,
      });
    } else {
      createRole(values);
    }
  };

  const isLoading = creating || updating || loadingPermissions;

  const currentPermissions = watch('permissions') || [];

  const handlePermissionChange = (permission: string) => {
    const newPermissions = currentPermissions.includes(permission)
      ? currentPermissions.filter((p) => p !== permission)
      : [...currentPermissions, permission];

    setValue('permissions', newPermissions, { shouldValidate: true });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="flex flex-wrap pb-8 border-b border-dashed border-border-base my-5 sm:my-8">
        <Description
          title={t('form:form-title-role-info')}
          details={t('form:role-info-help-text')}
          className="w-full px-0 sm:pe-4 md:w-1/3 md:pe-5"
        />

        <Card className="w-full sm:w-8/12 md:w-2/3">
          <Input
            label={t('form:input-label-display-name')}
            {...register('displayName')}
            error={t(errors.displayName?.message || '')}
            variant="outline"
            className="mb-5"
            disabled={isLoading}
            aria-invalid={!!errors.displayName}
          />
          <Input
            label={t('form:input-label-name')}
            {...register('name')}
            error={t(errors.name?.message || '')}
            variant="outline"
            className="mb-5"
            note={t('form:role-name-help-text')}
            disabled={isLoading}
            aria-invalid={!!errors.name}
          />
          <Input
            label={t('form:input-label-description')}
            {...register('description')}
            error={t(errors.description?.message || '')}
            variant="outline"
            className="mb-5"
            disabled={isLoading}
            aria-invalid={!!errors.description}
          />
        </Card>
      </div>

      <div className="flex flex-wrap pb-8 border-b border-dashed border-border-base my-5 sm:my-8">
        <Description
          title={t('form:form-title-permissions')}
          details={t('form:permissions-help-text')}
          className="w-full px-0 sm:pe-4 md:w-1/3 md:pe-5"
        />

        <Card className="w-full sm:w-8/12 md:w-2/3">
          <div className="mb-5">
            <Label>{t('form:input-label-permissions')}</Label>
            {loadingPermissions ? (
              <div>Loading permissions...</div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                {permissions?.map((permission) => {
                  const isChecked = currentPermissions.includes(permission);
                  return (
                    <Checkbox
                      key={permission}
                      id={`permission-${permission}`}
                      name={`permissions.${permission}`}
                      label={permission}
                      checked={isChecked}
                      onChange={() => handlePermissionChange(permission)}
                      disabled={isLoading}
                      aria-checked={isChecked}
                      className="mb-2 last:mb-0"
                    />
                  );
                })}
              </div>
            )}
            {errors.permissions && (
              <p className="text-red-500 text-xs mt-1">
                {t(errors.permissions.message!)}
              </p>
            )}
          </div>
        </Card>
      </div>

      <div className="mb-4 text-end">
        {initialValues && (
          <Button
            variant="outline"
            onClick={() => router.back()}
            className="me-4"
            type="button"
          >
            {t('form:button-label-back')}
          </Button>
        )}

        <Button
          type="submit"
          loading={isLoading}
          disabled={isLoading}
          className="min-w-[150px]"
        >
          {initialValues
            ? t('form:button-label-update-role')
            : t('form:button-label-add-role')}
        </Button>
      </div>
    </form>
  );
}

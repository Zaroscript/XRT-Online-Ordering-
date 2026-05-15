import { useForm } from 'react-hook-form';
import { useQueryClient } from '@tanstack/react-query';
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
} from '@/data/role';
import { useGroupedPermissionsQuery } from '@/data/permission';
import { Role } from '@/types';
import {
  buildPermissionUiGroups,
  collectKeysFromSections,
  PermissionGroupSection,
} from '@/utils/permission-groups';

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

export default function RoleForm({ initialValues }: IProps) {
  const router = useRouter();
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  // Success and error callbacks for mutations
  const onSuccess = () => {
    toast.success(
      t(initialValues ? 'common:update-success' : 'common:create-success'),
    );
    queryClient.invalidateQueries({ queryKey: ['roles'] });
    router.push('/roles');
  };

  const onError = (error: any) => {
    toast.error(
      error?.response?.data?.message || t('common:error-something-wrong'),
    );
  };

  const { mutate: createRole, isPending: creating } = useCreateRoleMutation();
  const { mutate: updateRole, isPending: updating } = useUpdateRoleMutation();

  // Use the new grouped permissions query
  const { data: permissionsData, isPending: loadingPermissions } = useGroupedPermissionsQuery();

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
    // Ensure permissions is array of strings
    const input = {
      ...values,
      permissions: values.permissions,
    };

    if (initialValues?.id) {
      updateRole({
        id: initialValues.id,
        input: input,
      });
    } else {
      createRole(input);
    }
  };

  const isLoading = creating || updating || loadingPermissions;

  const currentPermissions = watch('permissions') || [];

  const handlePermissionChange = (permissionKey: string) => {
    const newPermissions = currentPermissions.includes(permissionKey)
      ? currentPermissions.filter((p) => p !== permissionKey)
      : [...currentPermissions, permissionKey];

    setValue('permissions', newPermissions, { shouldValidate: true });
  };

  // Select all permissions for a module
  const handleModuleSelect = (modulePermissions: { key: string }[]) => {
    const modulePermissionKeys = modulePermissions.map((p) => p.key);
    const allSelected = modulePermissionKeys.every((key: string) =>
      currentPermissions.includes(key),
    );

    let newPermissions = [...currentPermissions];

    if (allSelected) {
      newPermissions = newPermissions.filter((p) => !modulePermissionKeys.includes(p));
    } else {
      const toAdd = modulePermissionKeys.filter(
        (key: string) => !currentPermissions.includes(key),
      );
      newPermissions = [...newPermissions, ...toAdd];
    }

    setValue('permissions', newPermissions, { shouldValidate: true });
  };

  const handleGroupToggle = (section: PermissionGroupSection) => {
    const keys = collectKeysFromSections(section.moduleSections);
    const allSelected = keys.every((k) => currentPermissions.includes(k));
    let next = [...currentPermissions];
    if (allSelected) {
      next = next.filter((p) => !keys.includes(p));
    } else {
      const toAdd = keys.filter((k) => !next.includes(k));
      next = [...next, ...toAdd];
    }
    setValue('permissions', next, { shouldValidate: true });
  };

  const groupedUi = buildPermissionUiGroups(
    permissionsData?.modules ?? [],
    permissionsData?.permissionsByModule ?? {},
  );

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
              <div className="py-4 text-center">Loading permissions...</div>
            ) : (
              <div className="space-y-8">
                {groupedUi.map((section) => {
                  const groupKeys = collectKeysFromSections(section.moduleSections);
                  const groupCount = groupKeys.length;
                  const allInGroup = groupCount > 0 && groupKeys.every((k) => currentPermissions.includes(k));

                  return (
                    <section
                      key={section.groupId}
                      className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm sm:p-5"
                    >
                      <div className="mb-4 flex flex-wrap items-start justify-between gap-2 border-b border-gray-100 pb-3">
                        <div className="flex items-start gap-2">
                          <Checkbox
                            name={`group-${section.groupId}`}
                            label=""
                            checked={allInGroup}
                            onChange={() => handleGroupToggle(section)}
                            disabled={isLoading || groupCount === 0}
                            className="mt-1"
                          />
                          <div>
                            <h3 className="text-base font-semibold text-heading">
                              {t(`common:${section.titleKey}`)}
                            </h3>
                            <p className="text-xs text-gray-500">
                              {section.moduleSections.length}{' '}
                              {section.moduleSections.length === 1
                                ? 'module'
                                : 'modules'}{' '}
                              · {groupCount}{' '}
                              {groupCount === 1 ? 'permission' : 'permissions'}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-5">
                        {section.moduleSections.map(({ module, permissions: modulePermissions }) => {
                          const allSelected = modulePermissions.every((p) =>
                            currentPermissions.includes(p.key),
                          );
                          return (
                            <div
                              key={module}
                              className="rounded-md border border-gray-100 bg-gray-50/60 p-4"
                            >
                              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                                <div className="flex items-center gap-2">
                                  <Checkbox
                                    name={`module-${module}`}
                                    label=""
                                    checked={allSelected}
                                    onChange={() => handleModuleSelect(modulePermissions)}
                                    className="mt-0.5"
                                    disabled={isLoading}
                                  />
                                  <h4 className="text-sm font-semibold capitalize text-body-dark">
                                    {module.replace(/_/g, ' ')}
                                  </h4>
                                </div>
                                <span className="text-xs text-gray-500">
                                  {modulePermissions.length}
                                </span>
                              </div>
                              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                                {modulePermissions.map((permission) => {
                                  const isChecked = currentPermissions.includes(
                                    permission.key,
                                  );
                                  const label =
                                    permission.description ||
                                    permission.action.replace(/_/g, ' ');

                                  return (
                                    <Checkbox
                                      key={permission.key}
                                      id={`permission-${permission.key}`}
                                      name={`permissions.${permission.key}`}
                                      label={label}
                                      checked={isChecked}
                                      onChange={() =>
                                        handlePermissionChange(permission.key)
                                      }
                                      disabled={isLoading}
                                      className="flex items-start text-sm"
                                    />
                                  );
                                })}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </section>
                  );
                })}
              </div>
            )}

            {(!permissionsData || !permissionsData?.modules?.length) && !loadingPermissions && (
              <div className="text-red-500 text-sm">{t('form:error-no-permissions-found') || 'No permissions found'}</div>
            )}

            {errors.permissions && (
              <p className="text-red-500 text-xs mt-2">
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

import Loader from '@/components/ui/loader/loader';
import { useModalState } from '@/components/ui/modal/modal.context';
import { useUserQuery } from '@/data/user';
import { useTranslation } from 'next-i18next';

const AdminPermissionsView = () => {
  const { t } = useTranslation();
  const { data: userId } = useModalState();
  const { data: user, isLoading } = useUserQuery({ id: userId });

  console.log('AdminPermissionsView - userId:', userId);
  console.log('AdminPermissionsView - user data:', user);
  console.log('AdminPermissionsView - isLoading:', isLoading);

  if (isLoading) return <Loader text={t('common:text-loading')} />;

  // Get permissions from user data
  const directPermissions = user?.permissions || [];

  console.log('AdminPermissionsView - directPermissions:', directPermissions);

  // Handle both string permissions and object permissions with name property
  const normalizePermissions = (permissions: any[]) => {
    const normalized = permissions.map(p => typeof p === 'string' ? p : p?.name).filter(Boolean);
    console.log('AdminPermissionsView - normalized permissions:', normalized);
    return normalized;
  };

  const allPermissions = normalizePermissions(directPermissions);

  return (
    <div className="p-5 bg-light sm:p-8 min-w-[350px] sm:min-w-[450px] max-w-2xl">
      <h1 className="mb-4 text-center font-semibold text-heading sm:mb-6">
        {t('common:text-permissions')}
        {user?.name && (
          <span className="block text-sm font-normal text-body mt-1">
            {user.name}
          </span>
        )}
      </h1>

      <div className="max-h-[60vh] overflow-y-auto">
        {allPermissions.length > 0 ? (
          <div className="grid grid-cols-2 gap-3">
            {allPermissions.map((permission: string) => (
              <div
                key={permission}
                className="px-3 py-2 bg-gray-100 rounded text-sm text-heading"
              >
                {permission}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-body">
            {t('common:text-no-permissions-found')}
          </p>
        )}

        {user?.role === 'super_admin' && (
          <p className="mt-4 text-center text-accent font-semibold">
            {t('common:text-super-admin-all-access')}
          </p>
        )}
      </div>
    </div>
  );
};

export default AdminPermissionsView;

import { useTranslation } from 'next-i18next';
import {
  useModalState,
  useModalAction,
} from '@/components/ui/modal/modal.context';
import { CloseIcon } from '@/components/icons/close-icon';

const UserPermissionsView = () => {
  const { t } = useTranslation();
  const { data } = useModalState();
  const { closeModal } = useModalAction();

  // Handle both string permissions and object permissions with name property
  const normalizePermissions = (permissions: any[]) => {
    return permissions.map(p => typeof p === 'string' ? p : p?.name).filter(Boolean);
  };

  const permissions = data?.permissions ? normalizePermissions(data.permissions) : [];

  return (
    <div className="m-auto w-full max-w-sm rounded-md bg-white p-5 shadow-lg md:max-w-md md:p-6 text-center">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-heading">
          {t('common:text-permissions')}
        </h2>
        <button
          onClick={closeModal}
          aria-label="Close panel"
          className="inline-flex h-7 w-7 items-center justify-center rounded-full text-body transition duration-200 hover:bg-gray-100 focus:outline-none"
        >
          <CloseIcon className="h-4 w-4" />
        </button>
      </div>

      <div className="flex flex-wrap gap-2 justify-center">
        {permissions.length > 0 ? (
          permissions.map((permission: string, index: number) => (
            <span
              key={index}
              className="rounded bg-accent/10 px-3 py-1 text-sm text-accent"
            >
              {permission}
            </span>
          ))
        ) : (
          <span className="text-sm text-gray-500">
            {t('common:text-no-permissions-found')}
          </span>
        )}
      </div>
    </div>
  );
};

export default UserPermissionsView;

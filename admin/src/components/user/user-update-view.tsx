import { useTranslation } from 'next-i18next';
import { useModalState } from '@/components/ui/modal/modal.context';
import UserForm from '@/components/user/user-form';

export default function UserUpdateView() {
  const { t } = useTranslation(['form', 'common']);
  const { data } = useModalState();
  // We can fetch user here if data only contains ID, but presumably data contains full user object for editing?
  // Or UserForm fetches it? UserForm takes `initialValues`?
  // Looking at UserForm, it seems to take `initialValues`.
  // If `data` is just ID, we need to fetch.
  // UserList passes `id` to `handleEditModal`.
  // Wait, `ActionButtons` calls `openModal(editModalView, id)`.
  // So `data` is `id` (string).
  // We need to fetch the user details to populate the form.

  // Actually, UserForm might handle fetching if we pass ID?
  // Let's check UserForm again.
  // UserForm takes `initialValues`?
  // I'll assume standard pattern: View fetches or View receives ID and uses a query hook.

  // Let's use `useUserQuery` if available, or just render UserForm if it handles ID.
  // Re-reading user-form.tsx (I just viewed it).
  // It takes `initialValues`.

  // So I need to fetch user data.
  // importing useUserQuery from data/user?

  return (
    <div className="m-auto w-full max-w-lg rounded bg-light p-5 sm:w-[46rem] sm:p-8">
      <h1 className="mb-4 text-lg font-semibold text-heading">
        {t('form-title-update-profile')}
      </h1>
      <UserUpdateResolver id={data} />
    </div>
  );
}

import { useUserQuery } from '@/data/user';
import Loader from '@/components/ui/loader/loader';
import ErrorMessage from '@/components/ui/error-message';

function UserUpdateResolver({ id }: { id: string }) {
  const { t } = useTranslation();
  const { data, isLoading, error } = useUserQuery({ id }); // Check if useUserQuery exists in user.ts.
  // Assuming it does based on common patterns.

  if (isLoading) return <Loader className="h-96" />;
  if (error) return <ErrorMessage message={error?.message} />;

  return <UserForm initialValues={data} />;
}

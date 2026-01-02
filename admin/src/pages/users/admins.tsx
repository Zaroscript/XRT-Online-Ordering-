import Card from '@/components/common/card';
import Layout from '@/components/layouts/admin';
import ErrorMessage from '@/components/ui/error-message';
import Loader from '@/components/ui/loader/loader';
import AdminsList from '@/components/user/user-admin-list';
import { useAdminsQuery } from '@/data/user';
import { SortOrder } from '@/types';
import { adminOnly } from '@/utils/auth-utils';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useState } from 'react';
import PageHeading from '@/components/common/page-heading';
import Link from '@/components/ui/link';
import { useModalAction } from '@/components/ui/modal/modal.context';
import Button from '@/components/ui/button';

export default function Admins() {
  const { t } = useTranslation();
  const { openModal } = useModalAction();
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [orderBy, setOrder] = useState('created_at');
  const [sortedBy, setColumn] = useState<SortOrder>(SortOrder.Desc);

  const { admins, paginatorInfo, loading, error } = useAdminsQuery({
    limit: 20,
    page,
    name: searchTerm,
    orderBy,
    sortedBy,
  });

  if (loading) return <Loader text={t('common:text-loading')} />;
  if (error) return <ErrorMessage message={error.message} />;

  function handleSearch({ searchText }: { searchText: string }) {
    setSearchTerm(searchText);
    setPage(1);
  }

  function handlePagination(current: any) {
    setPage(current);
  }

  function handleCreateAdmin() {
    openModal('CREATE_ADMIN');
  }

  return (
    <>
      <Card className="mb-8 flex flex-col items-center justify-between md:flex-row">
        <div className="md:w-1/4">
          <PageHeading title={t('text-admins')} />
        </div>
        <div className="flex w-full flex-col items-center space-y-4 md:w-3/4 md:flex-row md:justify-end md:space-y-0 md:space-x-4/rtl:space-x-reverse">
          <Button onClick={handleCreateAdmin}>
            <span>+ {t('form:button-label-create-admin')}</span>
          </Button>
        </div>
      </Card>

      {loading ? null : (
        <AdminsList
          admins={admins}
          paginatorInfo={paginatorInfo}
          onPagination={handlePagination}
          onOrder={setOrder}
          onSort={setColumn}
        />
      )}
    </>
  );
}

Admins.authenticate = {
  permissions: adminOnly,
};
Admins.Layout = Layout;

export const getStaticProps = async ({ locale }: any) => ({
  props: {
    ...(await serverSideTranslations(locale, ['table', 'common', 'form'])),
  },
});

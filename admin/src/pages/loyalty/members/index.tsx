import Card from '@/components/common/card';
import PageHeading from '@/components/common/page-heading';
import Search from '@/components/common/search';
import Layout from '@/components/layouts/admin';
import ErrorMessage from '@/components/ui/error-message';
import Loader from '@/components/ui/loader/loader';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useState } from 'react';
import { adminOnly } from '@/utils/auth-utils';
import { useLoyaltyMembersQuery } from '@/data/loyalty';
import LoyaltyMemberList from '@/components/loyalty/loyalty-member-list';

export default function LoyaltyMembersPage() {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);

  const { members, paginatorInfo, loading, error } = useLoyaltyMembersQuery({
    limit: 15,
    page,
    search: searchTerm,
  });

  if (loading) return <Loader text={t('common:text-loading')} />;
  if (error) return <ErrorMessage message={error.message} />;

  function handleSearch({ searchText }: { searchText: string }) {
    setSearchTerm(searchText);
    setPage(1);
  }

  function handlePagination(current: number) {
    setPage(current);
  }

  return (
    <>
      <Card className="flex flex-col items-center mb-8 md:flex-row">
        <div className="mb-4 md:mb-0 md:w-1/4">
          <PageHeading title={t('table:table-item-loyalty-members', 'Loyalty Members')} />
        </div>

        <div className="flex w-full flex-col justify-end ms-auto md:w-3/4 md:flex-row space-y-4 md:space-y-0">
          <Search
            onSearch={handleSearch}
            placeholderText={t('form:input-placeholder-search-phone', 'Search by Phone...')}
          />
        </div>
      </Card>

      <LoyaltyMemberList
        members={members}
        paginatorInfo={paginatorInfo}
        onPagination={handlePagination}
      />
    </>
  );
}

LoyaltyMembersPage.authenticate = {
  permissions: adminOnly,
};

LoyaltyMembersPage.Layout = Layout;

export const getStaticProps = async ({ locale }: any) => ({
  props: {
    ...(await serverSideTranslations(locale, ['table', 'common', 'form'])),
  },
});

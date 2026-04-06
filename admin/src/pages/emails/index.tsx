import Card from '@/components/common/card';
import Layout from '@/components/layouts/admin';
import { useState } from 'react';
import ErrorMessage from '@/components/ui/error-message';
import Loader from '@/components/ui/loader/loader';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { adminOnly } from '@/utils/auth-utils';
import PageHeading from '@/components/common/page-heading';
import { useMarketingEmailsQuery } from '@/data/emails';
import EmailList from '@/components/emails/email-list';
import LinkButton from '@/components/ui/link-button';
import { Routes } from '@/config/routes';
import Search from '@/components/common/search';

export default function EmailsPage() {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');

  const { data, isPending: loading, error } = useMarketingEmailsQuery(searchTerm);

  if (loading) return <Loader text={t('common:text-loading')} />;
  if (error) return <ErrorMessage message={(error as any).message} />;

  function handleSearch({ searchText }: { searchText: string }) {
    setSearchTerm(searchText);
  }

  return (
    <>
      <Card className="mb-8 flex flex-col items-center xl:flex-row">
        <div className="mb-4 md:w-1/3 xl:mb-0">
          <PageHeading title={t('common:sidebar-nav-item-emails')} />
        </div>

        <div className="flex w-full flex-col xl:w-2/3 xl:flex-row xl:items-center xl:ms-auto">
          <Search onSearch={handleSearch} />
          
          <LinkButton
            href={Routes.emails.create}
            className="h-12 w-full xl:w-auto xl:ms-6 mt-5 xl:mt-0"
          >
            <span className="hidden xl:block">
              + {t('form:button-label-add')} {t('common:email')}
            </span>
            <span className="xl:hidden">
              + {t('form:button-label-add')}
            </span>
          </LinkButton>
        </div>
      </Card>
      
      <EmailList emails={data?.data} paginatorInfo={data?.paginatorInfo} />
    </>
  );
}

EmailsPage.authenticate = {
  permissions: adminOnly,
};
EmailsPage.Layout = Layout;

export const getStaticProps = async ({ locale }: any) => ({
  props: {
    ...(await serverSideTranslations(locale, ['form', 'common', 'table'])),
  },
});

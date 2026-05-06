import Card from '@/components/common/card';
import PageHeading from '@/components/common/page-heading';
import PromotionList from '@/components/promotion/promotion-list';
import Layout from '@/components/layouts/admin';
import ErrorMessage from '@/components/ui/error-message';
import LinkButton from '@/components/ui/link-button';
import Loader from '@/components/ui/loader/loader';
import { Config } from '@/config';
import { usePromotionsQuery } from '@/data/promotion';
import { adminOnly } from '@/utils/auth-utils';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useRouter } from 'next/router';
import { useState } from 'react';

export default function PromotionsPage() {
  const { t } = useTranslation();
  const { locale } = useRouter();
  const [page, setPage] = useState(1);

  const {
    promotions,
    paginatorInfo,
    websiteActiveCount,
    websiteActiveMax,
    loading,
    error,
  } = usePromotionsQuery({
    language: locale!,
    limit: 20,
    page,
    orderBy: 'sort_order',
    sortedBy: 'asc',
  });

  if (loading) return <Loader text={t('common:text-loading')} />;
  if (error) return <ErrorMessage message={error.message} />;

  const slotsLeft = Math.max(0, websiteActiveMax - websiteActiveCount);
  const atCap = websiteActiveCount >= websiteActiveMax;

  return (
    <>
      <Card className="flex flex-col items-center mb-8 md:flex-row">
        <div className="mb-4 md:mb-0 md:w-1/3">
          <PageHeading title="Promotions" />
        </div>
        <div className="flex flex-col items-stretch w-full gap-3 md:w-2/3 md:flex-row md:items-center md:justify-end">
          <div
            className={`rounded-md px-3 py-2 text-sm ${
              atCap ? 'bg-amber-50 text-amber-900 border border-amber-200' : 'bg-muted'
            }`}
          >
            Website: <strong>{websiteActiveCount}</strong> / {websiteActiveMax} active
            {!atCap ? (
              <span className="text-muted"> · {slotsLeft} slot(s) left</span>
            ) : (
              <span> · Turn one off before enabling another.</span>
            )}
          </div>
          {locale === Config.defaultLanguage && (
            <LinkButton href="/promotions/create" className="h-12 md:w-auto">
              <span>+ New promotion</span>
            </LinkButton>
          )}
        </div>
      </Card>
      <PromotionList
        promotions={promotions}
        paginatorInfo={paginatorInfo}
        onPagination={setPage}
      />
    </>
  );
}

PromotionsPage.authenticate = {
  permissions: adminOnly,
};

PromotionsPage.Layout = Layout;

export const getStaticProps = async ({ locale }: any) => ({
  props: {
    ...(await serverSideTranslations(locale, ['form', 'common', 'table'])),
  },
});

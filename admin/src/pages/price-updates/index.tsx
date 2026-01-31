import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { GetStaticProps } from 'next';
import { useTranslation } from 'next-i18next';
import Layout from '@/components/layouts/admin';
import BulkPriceUpdateForm from '@/components/price-update/bulk-price-update-form';
import PriceUpdateHistoryTable from '@/components/price-update/price-update-history-table';
import { usePriceUpdateHistoryQuery } from '@/data/price-update';
import Loader from '@/components/ui/loader/loader';
import ErrorMessage from '@/components/ui/error-message';
import { useState } from 'react';
import { useMeQuery } from '@/data/user';
import { useRouter } from 'next/router';
import Button from '@/components/ui/button';
import { LongArrowPrev } from '@/components/icons/long-arrow-prev';

export default function PriceUpdatesPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const [page, setPage] = useState(1);
  const { data: me, isLoading: meLoading } = useMeQuery();

  const { data, isLoading, error } = usePriceUpdateHistoryQuery({
    page,
    limit: 10,
  });

  if (meLoading) {
    return <Loader text={t('common:text-loading')} />;
  }

  if (isLoading) return <Loader text={t('common:text-loading')} />;
  if (error) return <ErrorMessage message={error.message} />;

  return (
    <>
      <div className="flex items-center border-b border-dashed border-border-base pb-5 md:pb-7">
        <Button
          onClick={() => router.back()}
          variant="custom"
          className="me-4 flex items-center justify-center rounded-full bg-gray-200 p-2 text-body transition-colors duration-200 hover:bg-gray-300"
        >
          <LongArrowPrev className="h-5 w-5" />
        </Button>
        <h1 className="text-lg font-semibold text-heading">
          {t('form:form-title-bulk-price-update')}
        </h1>
      </div>

      <BulkPriceUpdateForm />

      <div className="mt-10">
        <h3 className="mb-4 text-lg font-semibold text-heading">
          {t('common:text-history')}
        </h3>
        <PriceUpdateHistoryTable
          history={data?.history ?? []}
          paginatorInfo={{
            total: data?.total,
            currentPage: page,
            perPage: 10,
          }}
          onPagination={setPage}
        />
      </div>
    </>
  );
}

PriceUpdatesPage.Layout = Layout;

export const getStaticProps: GetStaticProps = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale!, ['table', 'common', 'form'])),
  },
});

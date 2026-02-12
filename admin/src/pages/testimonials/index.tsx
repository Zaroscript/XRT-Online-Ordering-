import TestimonialList from '@/components/testimonials/testimonial-list';
import Card from '@/components/common/card';
import Layout from '@/components/layouts/admin';
import { useState } from 'react';
import ErrorMessage from '@/components/ui/error-message';
import Loader from '@/components/ui/loader/loader';
import { SortOrder } from '@/types';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useTestimonialsQuery } from '@/data/testimonial';
import { adminOnly } from '@/utils/auth-utils';
import PageHeading from '@/components/common/page-heading';
import LinkButton from '@/components/ui/link-button';
import { Routes } from '@/config/routes';

export default function TestimonialsPage() {
  const [page, setPage] = useState(1);
  const { t } = useTranslation();
  const [orderBy, setOrder] = useState('created_at');
  const [sortedBy, setColumn] = useState<SortOrder>(SortOrder.Desc);

  const { testimonials, paginatorInfo, loading, error } = useTestimonialsQuery({
    limit: 15,
    page,
    orderBy,
    sortedBy,
  });

  if (loading) return <Loader text={t('common:text-loading')} />;
  if (error) return <ErrorMessage message={error.message} />;

  function handlePagination(current: any) {
    setPage(current);
  }

  return (
    <>
      <Card className="mb-8 flex flex-col items-center md:flex-row">
        <div className="mb-4 md:mb-0 md:w-1/4">
          <PageHeading title={t('common:sidebar-nav-item-testimonials')} />
        </div>
        <div className="flex w-full flex-col items-center ms-auto md:w-3/4 md:flex-row xl:w-2/4">
          <LinkButton
            href={Routes.testimonials.create}
            className="h-12 w-full md:w-auto md:ms-auto"
          >
            <span>+ {t('form:button-label-add-testimonial')}</span>
          </LinkButton>
        </div>
      </Card>
      <TestimonialList
        testimonials={testimonials}
        paginatorInfo={paginatorInfo}
        onPagination={handlePagination}
        onOrder={setOrder}
        onSort={setColumn}
      />
    </>
  );
}

TestimonialsPage.authenticate = {
  permissions: adminOnly,
};
TestimonialsPage.Layout = Layout;

export const getStaticProps = async ({ locale }: any) => ({
  props: {
    ...(await serverSideTranslations(locale, ['form', 'common', 'table'])),
  },
});

import Layout from '@/components/layouts/admin';
import PromotionForm from '@/components/promotion/promotion-form';
import ErrorMessage from '@/components/ui/error-message';
import Loader from '@/components/ui/loader/loader';
import { Config } from '@/config';
import { usePromotionQuery } from '@/data/promotion';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useRouter } from 'next/router';

export default function EditPromotionPage() {
  const { query, locale } = useRouter();
  const id = query.slug as string;
  const { promotion, loading, error } = usePromotionQuery({
    id,
    language: locale || Config.defaultLanguage,
  });

  if (loading) return <Loader text="Loading..." />;
  if (error) return <ErrorMessage message={error.message} />;
  if (!promotion) return <ErrorMessage message="Promotion not found" />;

  return (
    <>
      <div className="flex pb-5 border-b border-dashed border-border-base md:pb-7">
        <h1 className="text-lg font-semibold text-heading">Edit promotion</h1>
      </div>
      <PromotionForm initialValues={promotion} />
    </>
  );
}

EditPromotionPage.Layout = Layout;

export const getServerSideProps = async ({ locale }: any) => ({
  props: {
    ...(await serverSideTranslations(locale, ['form', 'common'])),
  },
});

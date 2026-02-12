import Layout from '@/components/layouts/admin';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { adminOnly } from '@/utils/auth-utils';
import CreateOrUpdateTestimonialForm from '@/components/testimonials/testimonial-form';
import ErrorMessage from '@/components/ui/error-message';
import Loader from '@/components/ui/loader/loader';
import { useRouter } from 'next/router';
import { useTestimonialQuery } from '@/data/testimonial';

export default function EditTestimonialPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const { testimonialId } = router.query;

  const { data, isLoading, error } = useTestimonialQuery(
    testimonialId as string,
  );

  if (isLoading) return <Loader text={t('common:text-loading')} />;
  if (error) return <ErrorMessage message={error.message} />;

  return (
    <>
      <div className="flex items-center border-b border-dashed border-border-base py-5 sm:py-8">
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-1.5 text-accent font-semibold me-4 transition-colors hover:text-accent-hover"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5"/>
            <polyline points="12 19 5 12 12 5"/>
          </svg>
          {t('form:button-label-back')}
        </button>
        <h1 className="text-lg font-semibold text-heading">
          {t('form:form-title-edit-testimonial')}
        </h1>
      </div>
      <CreateOrUpdateTestimonialForm initialValues={data} />
    </>
  );
}

EditTestimonialPage.authenticate = {
  permissions: adminOnly,
};
EditTestimonialPage.Layout = Layout;

export const getServerSideProps = async ({ locale }: any) => ({
  props: {
    ...(await serverSideTranslations(locale, ['form', 'common', 'table'])),
  },
});

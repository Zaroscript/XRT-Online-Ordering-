import Layout from '@/components/layouts/admin';
import PromotionTemplatePicker from '@/components/promotion/promotion-template-picker';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import Link from 'next/link';

export default function ChoosePromotionTemplatePage() {
  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-dashed border-border-base pb-5 md:pb-7">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">
            Step 1 of 2
          </p>
          <h1 className="text-lg font-semibold text-heading">Choose promotion template</h1>
        </div>
        <Link
          href="/promotions"
          className="text-sm font-medium text-muted underline-offset-4 hover:text-heading hover:underline"
        >
          Back to list
        </Link>
      </div>
      <div className="my-8">
        <PromotionTemplatePicker />
      </div>
    </>
  );
}

ChoosePromotionTemplatePage.Layout = Layout;

export const getStaticProps = async ({ locale }: any) => ({
  props: {
    ...(await serverSideTranslations(locale, ['form', 'common'])),
  },
});
